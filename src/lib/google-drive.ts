import { google, drive_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME_MAX_LENGTH = 120;
const DEFAULT_BUSINESS_NAME = 'Unknown Business';

type DriveFileResponse = { data: drive_v3.Schema$File };

export const getDriveService = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  google.options({ auth });

  return google.drive('v3');
};

export function sanitizeDriveFolderName(value: string): string {
  const cleaned = String(value || '')
    .replace(/[\u0000-\u001F\u007F-\u009F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || DEFAULT_BUSINESS_NAME;
}

export function buildOnboardingDriveFolderName(
  businessName: string | undefined,
  submissionId: string
): string {
  const safeBusinessName = sanitizeDriveFolderName(businessName || DEFAULT_BUSINESS_NAME);
  const prefix = 'Onboarding - ';
  const suffix = ` - ${submissionId}`;
  const maxBusinessNameLength = FOLDER_NAME_MAX_LENGTH - prefix.length - suffix.length;
  const truncatedBusinessName =
    safeBusinessName.length > maxBusinessNameLength
      ? safeBusinessName.slice(0, Math.max(0, maxBusinessNameLength)).trim()
      : safeBusinessName;

  const folderName = `${prefix}${truncatedBusinessName}${suffix}`.trim();

  return folderName.length > FOLDER_NAME_MAX_LENGTH
    ? folderName.slice(0, FOLDER_NAME_MAX_LENGTH).trim()
    : folderName;
}

export const findFolderByName = async (folderName: string, parentId?: string) => {
  const drive = getDriveService();

  const queryParts = [
    `name = '${folderName.replace(/'/g, "''")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ];

  if (parentId) {
    queryParts.push(`'${parentId}' in parents`);
  }

  const response = await drive.files.list({
    q: queryParts.join(' and '),
    fields: 'files(id,name,webViewLink,parents)',
    spaces: 'drive',
    pageSize: 10,
  });

  return response.data.files?.[0] || null;
};

export const getOrCreateFolder = async (folderName: string, parentId?: string) => {
  const existingFolder = await findFolderByName(folderName, parentId);

  if (existingFolder) {
    return existingFolder;
  }

  return createFolder(folderName, parentId);
};

export const createFolder = async (folderName: string, parentId?: string) => {
  const drive = getDriveService();
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : [],
  };

  const file = await (drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  } as any) as unknown as Promise<DriveFileResponse>);

  return file.data;
};

export const uploadFileToDrive = async (
  fileName: string,
  mimeType: string,
  body: any,
  folderId: string
) => {
  const drive = getDriveService();
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  const media = {
    mimeType,
    body,
  };

  const file = await (drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  } as any) as unknown as Promise<DriveFileResponse>);

  return file.data;
};
