import { google } from 'googleapis';

type OnboardingSubmissionData = Record<string, unknown>;

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

function toPlainJson(value: unknown): unknown {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }

  if (typeof value === 'object' && value !== null) {
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = toPlainJson(nestedValue);
    }

    return output;
  }

  return value;
}

function toSheetDate(value: unknown): string {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function toText(value: unknown): string {
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

function getEnabledModules(value: unknown): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return '';
  }

  return Object.entries(value)
    .filter(([, enabled]) => enabled === true)
    .map(([moduleName]) => moduleName)
    .join(', ');
}

export async function appendOnboardingSubmissionToSheet(params: {
  submissionId: string;
  data: OnboardingSubmissionData;
}) {
  const spreadsheetId = process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID;
  const sheetName = process.env.ONBOARDING_SUBMISSIONS_SHEET_NAME || 'OnboardingSubmissions';

  if (!spreadsheetId) {
    return {
      skipped: true,
      reason: 'ONBOARDING_SUBMISSIONS_SPREADSHEET_ID is not configured',
    };
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({
    version: 'v4',
    auth,
  });

  const { submissionId, data } = params;

  const row = [
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

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:J`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });

  return {
    skipped: false,
  };
}
