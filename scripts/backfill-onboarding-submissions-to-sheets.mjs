import admin from 'firebase-admin';
import { google } from 'googleapis';

const SPREADSHEET_ID =
  process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID ||
  '18wC_QHcT9lZjezNpz_TstG6Yfcq_KwDHZiez3hdtsHY';

const SUMMARY_SHEET_NAME =
  process.env.ONBOARDING_SUBMISSIONS_SHEET_NAME ||
  'OnboardingSubmissions';

const ANSWERS_SHEET_NAME =
  process.env.ONBOARDING_ANSWERS_SHEET_NAME ||
  'OnboardingAnswers';

const DRY_RUN = process.argv.includes('--dry-run');
const MARK_FIRESTORE_AS_SYNCED = true;

const SUMMARY_HEADERS = [
  'Created At',
  'Updated At',
  'Submission ID',
  'User ID',
  'Business Name',
  'Status',
  'Current Step',
  'Completion Percentage',
  'Enabled Modules',
  'Selected Services',
  'Submitted At',
  'Full JSON',
];

const ANSWER_HEADERS = [
  'Created At',
  'Updated At',
  'Submission ID',
  'User ID',
  'Business Name',
  'Status',
  'Current Step',
  'Section Key',
  'Section Title',
  'Field Path',
  'Field Label',
  'Answer',
  'Answer Type',
];

const SECTION_TITLES = {
  welcome_expectations: 'Welcome & Expectations',
  business_snapshot: 'Business Snapshot',
  service_selection: 'Service Selection & Engagement Scope',
  business_profile: 'Business Profile, Positioning and Value Proposition',
  offer_menu: 'Services, Products and Offer Menu',
  team_capacity: 'Team, Capacity and Delivery Model',
  proof_evidence: 'Proof, Case Studies, Reviews and Evidence',
  goals_strategy: 'Goals, Opportunity Strategy and Bid/No-Bid Rules',
  pricing_commercial: 'Pricing, Quoting and Commercial Rules',
  platform_setup: 'Platform and Channel Setup',
  compliance_insurance: 'Compliance, Insurance and Readiness',
  service_modules: 'Service Modules',
  workflow_rules: 'Communication, Review and Workflow Rules',
  document_upload_library: 'Document Upload Library',
  authority_matrix: 'Authority Matrix',
  final_submission: 'Final Submission',
};

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

function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !hasToDate(value)
  );
}

function toPlainJson(value) {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }

  if (isPlainObject(value)) {
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

  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(toPlainJson(value));
}

function getAnswerType(value) {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (hasToDate(value)) {
    return 'timestamp';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

function getEnabledModules(value) {
  if (!isPlainObject(value)) {
    return '';
  }

  return Object.entries(value)
    .filter(([, enabled]) => enabled === true)
    .map(([moduleName]) => moduleName)
    .join(', ');
}

function getSelectedServices(data) {
  const sections = data.sections;

  if (!isPlainObject(sections)) {
    return '';
  }

  const serviceSelection = sections.service_selection;

  if (!isPlainObject(serviceSelection)) {
    return '';
  }

  const selectedServices = serviceSelection.selectedServices;

  if (Array.isArray(selectedServices)) {
    return selectedServices.map(toText).filter(Boolean).join(', ');
  }

  return toText(selectedServices);
}

function getSubmittedAt(data) {
  const sections = data.sections;

  if (!isPlainObject(sections)) {
    return '';
  }

  const finalSubmission = sections.final_submission;

  if (!isPlainObject(finalSubmission)) {
    return '';
  }

  return (
    toSheetDate(finalSubmission.submittedAt) ||
    toSheetDate(finalSubmission.completedAt) ||
    toSheetDate(finalSubmission.finalSubmittedAt)
  );
}

function getSectionTitle(sectionKey) {
  return SECTION_TITLES[sectionKey] || toReadableLabel(sectionKey);
}

function toReadableLabel(value) {
  const withoutArrayIndexes = value.replace(/\[\d+\]/g, '');
  const finalSegment = withoutArrayIndexes.split('.').pop() || withoutArrayIndexes;

  return finalSegment
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function columnLetter(columnNumber) {
  let dividend = columnNumber;
  let columnName = '';

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
}

function quoteSheetName(sheetName) {
  return `'${sheetName.replace(/'/g, "''")}'`;
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

async function getSpreadsheetSheetTitles(sheets) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties.title',
  });

  return (
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter(Boolean) || []
  );
}

async function ensureSheetExists(sheets, sheetName) {
  const existingSheetTitles = await getSpreadsheetSheetTitles(sheets);

  if (existingSheetTitles.includes(sheetName)) {
    return;
  }

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create sheet tab: ${sheetName}`);
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });

  console.log(`Created sheet tab: ${sheetName}`);
}

async function ensureHeaders(sheets, sheetName, headers) {
  await ensureSheetExists(sheets, sheetName);

  const lastColumn = columnLetter(headers.length);
  const headerRange = `${quoteSheetName(sheetName)}!A1:${lastColumn}1`;

  let existingHeaderRow = [];

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: headerRange,
    });

    existingHeaderRow = response.data.values?.[0] || [];
  } catch (error) {
    if (DRY_RUN) {
      console.log(
        `[DRY RUN] Could not read header row for ${sheetName}. This is expected if the sheet tab does not exist yet.`
      );
      existingHeaderRow = [];
    } else {
      throw error;
    }
  }

  const headersAlreadyMatch =
    existingHeaderRow.length >= headers.length &&
    headers.every((header, index) => existingHeaderRow[index] === header);

  if (headersAlreadyMatch) {
    console.log(`Header row already matches for ${sheetName}.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update headers for ${sheetName}:`, headers);
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: headerRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers],
    },
  });

  console.log(`Updated headers for ${sheetName}.`);
}

async function getExistingSubmissionIdsFromSheet(sheets, sheetName) {
  const sheetTitles = await getSpreadsheetSheetTitles(sheets);

  if (!sheetTitles.includes(sheetName)) {
    return new Set();
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${quoteSheetName(sheetName)}!C:C`,
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

export function sortRowIndexesDescending(rowIndexes) {
  return [...rowIndexes].sort((a, b) => b - a);
}

async function updateRow(sheets, sheetName, headers, rowIndex, rowValues) {
  const lastColumn = columnLetter(headers.length);

  if (DRY_RUN) {
    console.log(
      `[DRY RUN] Would update row ${rowIndex} in ${sheetName} with:`,
      rowValues
    );
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${quoteSheetName(sheetName)}!A${rowIndex}:${lastColumn}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowValues],
    },
  });
}

async function deleteRowsByIndexes(sheets, sheetName, rowIndexes) {
  if (rowIndexes.length === 0) {
    return;
  }

  const sheetId = await getSheetId(sheets, sheetName);
  const requests = sortRowIndexesDescending(rowIndexes).map((rowIndex) => ({
    deleteDimension: {
      range: {
        sheetId,
        dimension: 'ROWS',
        startIndex: rowIndex - 1,
        endIndex: rowIndex,
      },
    },
  }));

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would delete ${rowIndexes.length} row(s) from ${sheetName}.`);
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests,
    },
  });
}

async function findRowsByColumnValue(sheets, sheetName, columnIndex, value, startRow = 2) {
  const columnLetterValue = columnLetter(columnIndex);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${quoteSheetName(sheetName)}!${columnLetterValue}${startRow}:${columnLetterValue}`,
  });

  const values = response.data.values || [];

  return values
    .map((row, index) => ({
      rowIndex: startRow + index,
      cellValue: String(row[0] ?? '').trim(),
    }))
    .filter((item) => item.cellValue === value)
    .map((item) => item.rowIndex);
}

async function getSheetId(sheets, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties',
  });

  const sheet = spreadsheet.data.sheets?.find(
    (sheetData) => sheetData.properties?.title === sheetName
  );

  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet tab not found: ${sheetName}`);
  }

  return sheet.properties.sheetId;
}

function buildSummaryRow(submissionId, data) {
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
    getSelectedServices(data),
    getSubmittedAt(data),
    JSON.stringify(toPlainJson(data)),
  ];
}

function flattenAnswerValue({ rows, baseRow, sectionKey, sectionTitle, fieldPath, value }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      rows.push([
        ...baseRow,
        sectionKey,
        sectionTitle,
        fieldPath,
        toReadableLabel(fieldPath),
        '',
        'array',
      ]);
      return;
    }

    const allItemsArePrimitive = value.every(
      (item) => !Array.isArray(item) && !isPlainObject(item)
    );

    if (allItemsArePrimitive) {
      rows.push([
        ...baseRow,
        sectionKey,
        sectionTitle,
        fieldPath,
        toReadableLabel(fieldPath),
        value.map(toText).filter(Boolean).join(', '),
        'array',
      ]);
      return;
    }

    value.forEach((item, index) => {
      flattenAnswerValue({
        rows,
        baseRow,
        sectionKey,
        sectionTitle,
        fieldPath: `${fieldPath}[${index}]`,
        value: item,
      });
    });

    return;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      rows.push([
        ...baseRow,
        sectionKey,
        sectionTitle,
        fieldPath,
        toReadableLabel(fieldPath),
        '',
        'object',
      ]);
      return;
    }

    for (const [key, nestedValue] of entries) {
      flattenAnswerValue({
        rows,
        baseRow,
        sectionKey,
        sectionTitle,
        fieldPath: fieldPath ? `${fieldPath}.${key}` : key,
        value: nestedValue,
      });
    }

    return;
  }

  rows.push([
    ...baseRow,
    sectionKey,
    sectionTitle,
    fieldPath,
    toReadableLabel(fieldPath),
    toText(value),
    getAnswerType(value),
  ]);
}

function buildAnswerRows(submissionId, data) {
  const sections = data.sections;

  if (!isPlainObject(sections)) {
    return [];
  }

  const baseRow = [
    toSheetDate(data.createdAt),
    toSheetDate(data.updatedAt),
    submissionId,
    toText(data.userId),
    toText(data.businessName),
    toText(data.status),
    toText(data.currentStep),
  ];

  const rows = [];

  for (const [sectionKey, sectionData] of Object.entries(sections)) {
    const sectionTitle = getSectionTitle(sectionKey);

    if (isPlainObject(sectionData)) {
      const entries = Object.entries(sectionData);

      if (entries.length === 0) {
        rows.push([
          ...baseRow,
          sectionKey,
          sectionTitle,
          '',
          sectionTitle,
          '',
          'object',
        ]);
        continue;
      }

      for (const [fieldKey, fieldValue] of entries) {
        flattenAnswerValue({
          rows,
          baseRow,
          sectionKey,
          sectionTitle,
          fieldPath: fieldKey,
          value: fieldValue,
        });
      }

      continue;
    }

    flattenAnswerValue({
      rows,
      baseRow,
      sectionKey,
      sectionTitle,
      fieldPath: sectionKey,
      value: sectionData,
    });
  }

  return rows;
}

async function appendRowsToSheet(sheets, sheetName, headers, rows) {
  if (rows.length === 0) {
    return;
  }

  await ensureHeaders(sheets, sheetName, headers);

  const lastColumn = columnLetter(headers.length);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would append ${rows.length} row(s) to ${sheetName}.`);
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${quoteSheetName(sheetName)}!A:${lastColumn}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });

  console.log(`Appended ${rows.length} row(s) to ${sheetName}.`);
}

async function markSubmissionAsSynced(docRef) {
  if (!MARK_FIRESTORE_AS_SYNCED || DRY_RUN) {
    return;
  }

  await docRef.set(
    {
      sheetSync: {
        onboardingSubmissions: {
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'manual_backfill',
          summarySheetName: SUMMARY_SHEET_NAME,
          answersSheetName: ANSWERS_SHEET_NAME,
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
  console.log('Summary sheet name:', SUMMARY_SHEET_NAME);
  console.log('Answers sheet name:', ANSWERS_SHEET_NAME);
  console.log('Dry run:', DRY_RUN ? 'yes' : 'no');

  const sheets = await getSheetsClient();

  await ensureHeaders(sheets, SUMMARY_SHEET_NAME, SUMMARY_HEADERS);
  await ensureHeaders(sheets, ANSWERS_SHEET_NAME, ANSWER_HEADERS);

  const snapshot = await db.collection('onboardingSubmissions').get();

  console.log(`Found ${snapshot.size} onboarding submission(s) in Firestore.`);

  let summaryCreated = 0;
  let summaryUpdated = 0;
  let totalAnswerRowsDeleted = 0;
  let totalAnswerRowsAppended = 0;
  let submissionsMarkedAsSynced = 0;

  for (const docSnapshot of snapshot.docs) {
    const submissionId = docSnapshot.id;
    const data = docSnapshot.data();

    const summaryRow = buildSummaryRow(submissionId, data);
    const answerRows = buildAnswerRows(submissionId, data);

    const existingSummaryRowIndexes = await findRowsByColumnValue(
      sheets,
      SUMMARY_SHEET_NAME,
      3,
      submissionId,
      2
    );

    const existingAnswerRowIndexes = await findRowsByColumnValue(
      sheets,
      ANSWERS_SHEET_NAME,
      3,
      submissionId,
      2
    );

    const summaryAction = existingSummaryRowIndexes.length > 0 ? 'updated' : 'created';

    if (DRY_RUN) {
      if (summaryAction === 'created') {
        console.log(`[DRY RUN] Would append summary for ${submissionId}.`);
      } else {
        console.log(`[DRY RUN] Would update summary row ${existingSummaryRowIndexes[0]} for ${submissionId}.`);
      }

      if (existingAnswerRowIndexes.length > 0) {
        console.log(
          `[DRY RUN] Would delete ${existingAnswerRowIndexes.length} existing answer row(s) for ${submissionId}.`
        );
      }

      if (answerRows.length > 0) {
        console.log(`[DRY RUN] Would append ${answerRows.length} answer row(s) for ${submissionId}.`);
      }

      continue;
    }

    if (summaryAction === 'updated') {
      await updateRow(sheets, SUMMARY_SHEET_NAME, SUMMARY_HEADERS, existingSummaryRowIndexes[0], summaryRow);
      summaryUpdated += 1;
    } else {
      await appendRowsToSheet(sheets, SUMMARY_SHEET_NAME, SUMMARY_HEADERS, [summaryRow]);
      summaryCreated += 1;
    }

    if (existingAnswerRowIndexes.length > 0) {
      await deleteRowsByIndexes(sheets, ANSWERS_SHEET_NAME, existingAnswerRowIndexes);
      totalAnswerRowsDeleted += existingAnswerRowIndexes.length;
    }

    if (answerRows.length > 0) {
      await appendRowsToSheet(sheets, ANSWERS_SHEET_NAME, ANSWER_HEADERS, answerRows);
      totalAnswerRowsAppended += answerRows.length;
    }

    await markSubmissionAsSynced(docSnapshot.ref);
    submissionsMarkedAsSynced += 1;
  }

  console.log('Backfill complete.');
  console.log({
    firestoreSubmissionsFound: snapshot.size,
    summaryCreated,
    summaryUpdated,
    totalAnswerRowsDeleted,
    totalAnswerRowsAppended,
    submissionsMarkedAsSynced: DRY_RUN ? 0 : submissionsMarkedAsSynced,
    dryRun: DRY_RUN,
  });
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
