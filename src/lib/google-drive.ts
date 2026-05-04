import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const getDriveService = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
};

export const createFolder = async (folderName: string, parentId?: string) => {
  const drive = getDriveService();
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : [],
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  return file.data;
};

export const uploadFileToDrive = async (fileName: string, mimeType: string, body: any, folderId: string) => {
  const drive = getDriveService();
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  const media = {
    mimeType,
    body,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  return file.data;
};
