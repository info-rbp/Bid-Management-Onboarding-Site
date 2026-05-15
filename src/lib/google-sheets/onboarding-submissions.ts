import { google, sheets_v4 } from 'googleapis';

type OnboardingSubmissionData = Record<string, unknown>;

type SheetAppendResult = {
  skipped: boolean;
  summaryRowsAppended?: number;
  answerRowsAppended?: number;
  reason?: string;
};

const SUMMARY_SHEET_NAME =
  process.env.ONBOARDING_SUBMISSIONS_SHEET_NAME || 'OnboardingSubmissions';

const ANSWERS_SHEET_NAME =
  process.env.ONBOARDING_ANSWERS_SHEET_NAME || 'OnboardingAnswers';

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

const SECTION_TITLES: Record<string, string> = {
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

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !hasToDate(value);
}

function toPlainJson(value: unknown): unknown {
  if (hasToDate(value)) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainJson);
  }

  if (isPlainObject(value)) {
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

function getAnswerType(value: unknown): string {
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

function getEnabledModules(value: unknown): string {
  if (!isPlainObject(value)) {
    return '';
  }

  return Object.entries(value)
    .filter(([, enabled]) => enabled === true)
    .map(([moduleName]) => moduleName)
    .join(', ');
}

function getSelectedServices(data: OnboardingSubmissionData): string {
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

function getSubmittedAt(data: OnboardingSubmissionData): string {
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

function getSectionTitle(sectionKey: string): string {
  return SECTION_TITLES[sectionKey] || toReadableLabel(sectionKey);
}

function toReadableLabel(value: string): string {
  const withoutArrayIndexes = value.replace(/\[\d+\]/g, '');
  const finalSegment = withoutArrayIndexes.split('.').pop() || withoutArrayIndexes;

  return finalSegment
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function columnLetter(columnNumber: number): string {
  let dividend = columnNumber;
  let columnName = '';

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
}

export function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

async function ensureSheetExists(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
}) {
  const { sheets, spreadsheetId, sheetName } = params;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const existingSheetTitles =
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter(Boolean) || [];

  if (existingSheetTitles.includes(sheetName)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
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
}

async function ensureHeaders(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
  headers: string[];
}) {
  const { sheets, spreadsheetId, sheetName, headers } = params;

  await ensureSheetExists({
    sheets,
    spreadsheetId,
    sheetName,
  });

  const lastColumn = columnLetter(headers.length);
  const headerRange = `${quoteSheetName(sheetName)}!A1:${lastColumn}1`;

  const existingHeaderResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });

  const existingHeaderRow = existingHeaderResponse.data.values?.[0] || [];

  const headersAlreadyMatch =
    existingHeaderRow.length >= headers.length &&
    headers.every((header, index) => existingHeaderRow[index] === header);

  if (headersAlreadyMatch) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: headerRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [headers],
    },
  });
}

export function buildSummaryRow(params: {
  submissionId: string;
  data: OnboardingSubmissionData;
}): string[] {
  const { submissionId, data } = params;

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

function flattenAnswerValue(params: {
  rows: string[][];
  baseRow: string[];
  sectionKey: string;
  sectionTitle: string;
  fieldPath: string;
  value: unknown;
}) {
  const { rows, baseRow, sectionKey, sectionTitle, fieldPath, value } = params;

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

export function buildAnswerRows(params: {
  submissionId: string;
  data: OnboardingSubmissionData;
}): string[][] {
  const { submissionId, data } = params;

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

  const rows: string[][] = [];

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

export function sortRowIndexesDescending(rowIndexes: number[]) {
  return [...rowIndexes].sort((a, b) => b - a);
}

async function getSheetId(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
}) {
  const { sheets, spreadsheetId, sheetName } = params;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
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

export async function findRowsByColumnValue(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
  columnIndex: number;
  value: string;
  startRow?: number;
}) {
  const {
    sheets,
    spreadsheetId,
    sheetName,
    columnIndex,
    value,
    startRow = 2,
  } = params;

  await ensureSheetExists({
    sheets,
    spreadsheetId,
    sheetName,
  });

  const columnLetterValue = columnLetter(columnIndex);
  const range = `${quoteSheetName(sheetName)}!${columnLetterValue}${startRow}:${columnLetterValue}`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
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

export async function updateRow(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
  headers: string[];
  rowIndex: number;
  rowValues: string[];
}) {
  const { sheets, spreadsheetId, sheetName, headers, rowIndex, rowValues } = params;
  const lastColumn = columnLetter(headers.length);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetName(sheetName)}!A${rowIndex}:${lastColumn}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowValues],
    },
  });
}

export async function deleteRowsByIndexes(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
  rowIndexes: number[];
}) {
  const { sheets, spreadsheetId, sheetName, rowIndexes } = params;

  if (rowIndexes.length === 0) {
    return;
  }

  const sheetId = await getSheetId({
    sheets,
    spreadsheetId,
    sheetName,
  });

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

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests,
    },
  });
}

async function appendRows(params: {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
}) {
  const { sheets, spreadsheetId, sheetName, headers, rows } = params;

  if (rows.length === 0) {
    return;
  }

  await ensureHeaders({
    sheets,
    spreadsheetId,
    sheetName,
    headers,
  });

  const lastColumn = columnLetter(headers.length);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quoteSheetName(sheetName)}!A:${lastColumn}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });
}

export async function syncOnboardingSubmissionToSheet(params: {
  submissionId: string;
  data: OnboardingSubmissionData;
}) {
  const spreadsheetId = process.env.ONBOARDING_SUBMISSIONS_SPREADSHEET_ID;

  if (!spreadsheetId) {
    return {
      skipped: true,
      reason: 'ONBOARDING_SUBMISSIONS_SPREADSHEET_ID is not configured',
    };
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return {
      skipped: true,
      reason: 'Google service account credentials are not configured',
    };
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({
    version: 'v4',
    auth,
  });

  const summaryRow = buildSummaryRow(params);
  const answerRows = buildAnswerRows(params);

  await ensureHeaders({
    sheets,
    spreadsheetId,
    sheetName: SUMMARY_SHEET_NAME,
    headers: SUMMARY_HEADERS,
  });

  await ensureHeaders({
    sheets,
    spreadsheetId,
    sheetName: ANSWERS_SHEET_NAME,
    headers: ANSWER_HEADERS,
  });

  const existingSummaryRows = await findRowsByColumnValue({
    sheets,
    spreadsheetId,
    sheetName: SUMMARY_SHEET_NAME,
    columnIndex: 3,
    value: params.submissionId,
    startRow: 2,
  });

  const summaryAction = existingSummaryRows.length > 0 ? 'updated' : 'created';

  if (existingSummaryRows.length > 0) {
    await updateRow({
      sheets,
      spreadsheetId,
      sheetName: SUMMARY_SHEET_NAME,
      headers: SUMMARY_HEADERS,
      rowIndex: existingSummaryRows[0],
      rowValues: summaryRow,
    });
  } else {
    await appendRows({
      sheets,
      spreadsheetId,
      sheetName: SUMMARY_SHEET_NAME,
      headers: SUMMARY_HEADERS,
      rows: [summaryRow],
    });
  }

  const existingAnswerRows = await findRowsByColumnValue({
    sheets,
    spreadsheetId,
    sheetName: ANSWERS_SHEET_NAME,
    columnIndex: 3,
    value: params.submissionId,
    startRow: 2,
  });

  await deleteRowsByIndexes({
    sheets,
    spreadsheetId,
    sheetName: ANSWERS_SHEET_NAME,
    rowIndexes: existingAnswerRows,
  });

  await appendRows({
    sheets,
    spreadsheetId,
    sheetName: ANSWERS_SHEET_NAME,
    headers: ANSWER_HEADERS,
    rows: answerRows,
  });

  return {
    skipped: false,
    summaryAction,
    answerRowsDeleted: existingAnswerRows.length,
    answerRowsAppended: answerRows.length,
  };
}

export async function appendOnboardingSubmissionToSheet(params: {
  submissionId: string;
  data: OnboardingSubmissionData;
}): Promise<SheetAppendResult> {
  const result = await syncOnboardingSubmissionToSheet(params);

  if (result.skipped) {
    return result;
  }

  return {
    skipped: false,
    summaryRowsAppended: result.summaryAction === 'created' ? 1 : 0,
    answerRowsAppended: result.answerRowsAppended,
  };
}
