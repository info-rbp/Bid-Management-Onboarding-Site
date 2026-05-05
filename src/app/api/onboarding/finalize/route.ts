import { NextResponse } from 'next/server';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { createFolder } from '@/lib/google-drive';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { submissionId, userId, finalSubmission } = await req.json();

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

    if (submissionData.status === 'submitted' && !submissionData.adminReopened) {
      return NextResponse.json({ error: 'Submission is locked' }, { status: 409 });
    }

    const folder = await createFolder(`Onboarding - ${submissionData.businessName}`);

    const submittedAt = new Date().toISOString();
    const immutableSnapshot = {
      ...(finalSubmission?.submissionSnapshot || {}),
      generatedAt: submittedAt,
      sourceStatus: submissionData.status || 'in_progress',
    };

    await submissionDoc.ref.update({
      status: 'submitted',
      submittedAt,
      completedAt: submittedAt,
      googleDriveFolderId: folder.id,
      googleDriveFolderUrl: folder.webViewLink,
      updatedAt: submittedAt,
      adminReopened: false,
      'sections.final_submission.acknowledgements': finalSubmission?.acknowledgements || {},
      'sections.final_submission.finalComments': finalSubmission?.finalComments || '',
      'sections.final_submission.submittedAt': submittedAt,
      'sections.final_submission.completedAt': submittedAt,
      'sections.final_submission.submissionSnapshot': immutableSnapshot,
      submissionSnapshot: immutableSnapshot,
      submissionSnapshotLockedAt: submittedAt,
      submissionSnapshotVersion: FieldValue.increment(1),
    });

    await db.collection('users').doc(userId).update({
      onboardingStatus: 'submitted',
      updatedAt: submittedAt,
    });

    return NextResponse.json({ success: true, driveFolderUrl: folder.webViewLink });
  } catch (error: any) {
    console.error('Finalize onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
