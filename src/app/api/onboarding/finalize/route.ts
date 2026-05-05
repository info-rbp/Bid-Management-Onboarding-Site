import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { createFolder } from '@/lib/google-drive';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { submissionId, userId } = await req.json();

    if (!submissionId || !userId) {
      return NextResponse.json({ error: 'Missing submissionId or userId' }, { status: 400 });
    }

    const submissionDoc = await db.collection('onboardingSubmissions').doc(submissionId).get();
    
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionDoc.data();
    
    if (!submissionData) {
      return NextResponse.json({ error: 'Submission data is missing' }, { status: 404 });
    }

    if (submissionData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Create Google Drive Folder
    const folder = await createFolder(`Onboarding - ${submissionData.businessName}`);
    
    // 2. Update Submission with Drive Info
    await submissionDoc.ref.update({
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      googleDriveFolderId: folder.id,
      googleDriveFolderUrl: folder.webViewLink,
      updatedAt: new Date().toISOString(),
    });

    // 3. Update User Status
    await db.collection('users').doc(userId).update({
      onboardingStatus: 'submitted',
      updatedAt: new Date().toISOString(),
    });

    // TODO: In a real app, you would trigger a background job to export all documents 
    // and data to the newly created Drive folder.

    return NextResponse.json({ 
        success: true, 
        driveFolderUrl: folder.webViewLink 
    });

  } catch (error: any) {
    console.error('Finalize onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
