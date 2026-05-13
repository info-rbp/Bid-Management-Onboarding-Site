import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import {
  buildOnboardingDriveFolderName,
  getOrCreateFolder,
} from '@/lib/google-drive';
import { sendOnboardingSubmittedNotification } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization') || '';

    if (!authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing Firebase ID token.' },
        { status: 401 }
      );
    }

    const idToken = authorization.replace('Bearer ', '').trim();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Empty Firebase ID token.' },
        { status: 401 }
      );
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    const body = await req.json().catch(() => null);
    const submissionId = body?.submissionId;
    const finalSubmission = body?.finalSubmission;

    if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing submissionId.' },
        { status: 400 }
      );
    }

    if (typeof finalSubmission !== 'object' || finalSubmission === null) {
      return NextResponse.json(
        { error: 'Missing finalSubmission.' },
        { status: 400 }
      );
    }

    const cleanSubmissionId = submissionId.trim();
    const db = getAdminDb();
    const submissionDoc = await db
      .collection('onboardingSubmissions')
      .doc(cleanSubmissionId)
      .get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionDoc.data();

    if (!submissionData) {
      return NextResponse.json(
        { error: 'Submission data is missing' },
        { status: 404 }
      );
    }

    if (submissionData.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (submissionData.status === 'submitted' && !submissionData.adminReopened) {
      return NextResponse.json({ error: 'Submission is locked' }, { status: 409 });
    }

    const existingFolderId = submissionData.googleDriveFolderId;
    const existingFolderUrl = submissionData.googleDriveFolderUrl;
    let googleDriveFolderId = existingFolderId;
    let googleDriveFolderUrl = existingFolderUrl;

    if (!existingFolderId || !existingFolderUrl) {
      const folderName = buildOnboardingDriveFolderName(
        submissionData.businessName,
        cleanSubmissionId
      );
      const parentId = process.env.GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID;
      const folder = await getOrCreateFolder(folderName, parentId);

      googleDriveFolderId = folder.id;
      googleDriveFolderUrl = folder.webViewLink;
    }

    const submittedAt = new Date().toISOString();
    const immutableSnapshot = {
      ...(finalSubmission?.submissionSnapshot || {}),
      generatedAt: submittedAt,
      sourceStatus: submissionData.status || 'in_progress',
    };

    const updateData: Record<string, unknown> = {
      status: 'submitted',
      submittedAt,
      completedAt: submittedAt,
      updatedAt: submittedAt,
      adminReopened: false,
      googleDriveFolderId,
      googleDriveFolderUrl,
      'sections.final_submission.acknowledgements':
        finalSubmission?.acknowledgements || {},
      'sections.final_submission.finalComments':
        finalSubmission?.finalComments || '',
      'sections.final_submission.submittedAt': submittedAt,
      'sections.final_submission.completedAt': submittedAt,
      'sections.final_submission.submissionSnapshot': immutableSnapshot,
      submissionSnapshot: immutableSnapshot,
      submissionSnapshotLockedAt: submittedAt,
      submissionSnapshotVersion: FieldValue.increment(1),
    };

    await submissionDoc.ref.update(updateData);

    await db.collection('users').doc(decodedToken.uid).update({
      onboardingStatus: 'submitted',
      updatedAt: submittedAt,
    });

    try {
      await sendOnboardingSubmittedNotification({ submissionId: cleanSubmissionId });
    } catch (notificationError) {
      console.error('Onboarding submitted notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      driveFolderId: googleDriveFolderId,
      driveFolderUrl: googleDriveFolderUrl,
      submittedAt,
    });
  } catch (error: any) {
    console.error('Finalize onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
