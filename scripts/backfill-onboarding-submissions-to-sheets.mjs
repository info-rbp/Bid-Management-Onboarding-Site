import admin from 'firebase-admin';
import { google } from 'googleapis';

const SPREADSHEET_ID =
  process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID ||
  '18wC_QHcT9lZjezNpz_TstG6Yfcq_KwDHZiez3hdtsHY';

const SHEET_NAME =
  process.env.ONBOARDING_SUBMISSIONS_SHEET_NAME ||
  'OnboardingSubmissions';

const DRY_RUN = process.argv.includes('--dry-run');
const MARK_FIRESTORE_AS_SYNCED = true;

const HEADERS = [
  'Created At',
  'Updated At',
  'Submission ID',
  'User ID',
  'Business Name',
  'Status',
  'Current Step',
  'Completion Percentage',
  'Enabled Modules',
  'Full JSON',
];

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

function hasToDate(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  );
}

function toPlainJson(value) {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }

  if (typeof value === 'object' && value !== null) {
    const output = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = toPlainJson(nestedValue);
    }

    return output;
  }

  return value;
}

function toSheetDate(value) {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function toText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(toPlainJson(value));
}

function getEnabledModules(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return '';
  }

  return Object.entries(value)
    .filter(([, enabled]) => enabled === true)
    .map(([moduleName]) => moduleName)
    .join(', ');
}

function buildRow(submissionId, data) {
  return [
    toSheetDate(data.createdAt),
    toSheetDate(data.updatedAt),
    submissionId,
    toText(data.userId),
    toText(data.businessName),
    toText(data.status),
    toText(data.currentStep),
    toText(data.completionPercentage),
    getEnabledModules(data.enabledModules),
    JSON.stringify(toPlainJson(data)),
  ];
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({
    version: 'v4',
    auth,
  });
}

async function ensureHeaders(sheets) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:J1`,
  });

  const existingHeaderRow = response.data.values?.[0] || [];

  if (existingHeaderRow.length > 0) {
    console.log('Header row already exists. Leaving it unchanged.');
    return;
  }

  if (DRY_RUN) {
    console.log('[DRY RUN] Would add header row:', HEADERS);
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:J1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [HEADERS],
    },
  });

  console.log('Added header row.');
}

async function getExistingSubmissionIdsFromSheet(sheets) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!C:C`,
  });

  const values = response.data.values || [];

  return new Set(
    values
      .flat()
      .map((value) => String(value).trim())
      .filter(Boolean)
      .filter((value) => value !== 'Submission ID')
  );
}

async function appendRowToSheet(sheets, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:J`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });
}

async function markSubmissionAsSynced(docRef) {
  if (!MARK_FIRESTORE_AS_SYNCED) {
    return;
  }

  await docRef.set(
    {
      sheetSync: {
        onboardingSubmissions: {
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'manual_backfill',
          sheetName: SHEET_NAME,
          spreadsheetId: SPREADSHEET_ID,
        },
      },
    },
    { merge: true }
  );
}

async function main() {
  console.log('Starting onboarding submissions backfill...');
  console.log('Spreadsheet ID:', SPREADSHEET_ID);
  console.log('Sheet name:', SHEET_NAME);
  console.log('Dry run:', DRY_RUN ? 'yes' : 'no');

  const sheets = await getSheetsClient();

  await ensureHeaders(sheets);

  const existingSubmissionIds = await getExistingSubmissionIdsFromSheet(sheets);

  console.log(
    `Found ${existingSubmissionIds.size} existing submission IDs already in the Sheet.`
  );

  const snapshot = await db.collection('onboardingSubmissions').get();

  console.log(`Found ${snapshot.size} onboarding submissions in Firestore.`);

  let appended = 0;
  let skippedAlreadyInSheet = 0;
  let skippedMissingUserId = 0;

  for (const docSnapshot of snapshot.docs) {
    const submissionId = docSnapshot.id;
    const data = docSnapshot.data();

    if (existingSubmissionIds.has(submissionId)) {
      skippedAlreadyInSheet += 1;
      console.log(`Skipping ${submissionId}: already exists in Sheet.`);
      continue;
    }

    if (!data.userId) {
      skippedMissingUserId += 1;
      console.log(`Skipping ${submissionId}: missing userId.`);
      continue;
    }

    const row = buildRow(submissionId, data);

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would append submission ${submissionId}:`, row);
    } else {
      await appendRowToSheet(sheets, row);
      await markSubmissionAsSynced(docSnapshot.ref);
      existingSubmissionIds.add(submissionId);
      appended += 1;
      console.log(`Appended submission ${submissionId}.`);
    }
  }

  console.log('Backfill complete.');
  console.log({
    firestoreSubmissionsFound: snapshot.size,
    appended,
    skippedAlreadyInSheet,
    skippedMissingUserId,
    dryRun: DRY_RUN,
  });
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
