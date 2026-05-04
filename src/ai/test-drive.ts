import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

async function testDrive() {
  console.log('Testing Google Drive API Connection...');
  
  const client_email = process.env.GOOGLE_CLIENT_EMAIL;
  const private_key = process.env.GOOGLE_PRIVATE_KEY;

  if (!client_email || !private_key) {
    console.error('Error: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY is missing in .env.local');
    return;
  }

  console.log('Client Email:', client_email);
  // Do not log private key for safety, just check if it looks like a key
  console.log('Private Key length:', private_key.length);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: client_email,
        private_key: private_key.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log('Attempting to list files (testing authentication)...');
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    });

    console.log('Successfully connected to Google Drive API!');
    console.log('Files found:', response.data.files?.length || 0);
    
    if (response.data.files && response.data.files.length > 0) {
      console.log('First file found:', response.data.files[0].name);
    }

  } catch (error: any) {
    console.error('Google Drive API Test Failed:');
    if (error.message.includes('403')) {
      console.error('Error 403: Permission denied. Make sure the Google Drive API is ENABLED in the Google Cloud Console.');
    } else if (error.message.includes('invalid_grant')) {
      console.error('Error: Invalid Grant. Check if your private key or client email is correct.');
    } else {
      console.error(error);
    }
  }
}

testDrive();
