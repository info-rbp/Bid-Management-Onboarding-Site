import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import {
  buildOnboardingDriveFolderName,
  getOrCreateFolder,
} from '@/lib/google-drive';
import { sendOnboardingSubmittedNotification } from '@/lib/notifications';
import { syncOnboardingSubmissionToSheet } from '@/lib/google-sheets/onboarding-submissions';

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
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        driveFolderId: submissionData.googleDriveFolderId || null,
        driveFolderUrl: submissionData.googleDriveFolderUrl || null,
        driveWorkspaceStatus: submissionData.driveWorkspaceStatus || 'pending',
        submittedAt: submissionData.submittedAt || null,
        sheetSyncStatus: submissionData.sheetSyncStatus || 'unknown',
      });
    }

    const existingFolderId = submissionData.googleDriveFolderId;
    const existingFolderUrl = submissionData.googleDriveFolderUrl;
    let googleDriveFolderId = existingFolderId;
    let googleDriveFolderUrl = existingFolderUrl;

    let driveWorkspaceStatus: 'created' | 'pending' | 'failed' =
      existingFolderId && existingFolderUrl ? 'created' : 'pending';
    let driveWorkspaceError: string | null = null;

    if (!existingFolderId || !existingFolderUrl) {
      try {
        const folderName = buildOnboardingDriveFolderName(
          submissionData.businessName,
          cleanSubmissionId
        );
        const parentId = process.env.GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID;
        const folder = await getOrCreateFolder(folderName, parentId);

        googleDriveFolderId = folder.id;
        googleDriveFolderUrl = folder.webViewLink;
        driveWorkspaceStatus = 'created';
      } catch (driveError) {
        driveWorkspaceStatus = 'failed';
        driveWorkspaceError =
          driveError instanceof Error ? driveError.message : String(driveError);
        if (!existingFolderId) googleDriveFolderId = null;
        if (!existingFolderUrl) googleDriveFolderUrl = null;
      }
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
      completionPercentage: 100,
      currentStep: 'final_submission',
      googleDriveFolderId,
      googleDriveFolderUrl,
      driveWorkspaceStatus,
      driveWorkspaceError,
      driveWorkspaceUpdatedAt: submittedAt,
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
      activeOnboardingSubmissionId: null,
      updatedAt: submittedAt,
    });

    let sheetSyncStatus: 'synced' | 'skipped' | 'error' | 'not_run' = 'not_run';
    let sheetSyncResult: any = null;

    try {
      const updatedSubmissionSnap = await submissionDoc.ref.get();
      const updatedSubmissionData = updatedSubmissionSnap.data();

      if (updatedSubmissionData) {
        sheetSyncResult = await syncOnboardingSubmissionToSheet({
          submissionId: cleanSubmissionId,
          data: updatedSubmissionData,
        });

        if (sheetSyncResult.skipped) {
          sheetSyncStatus = 'skipped';
          await submissionDoc.ref.update({
            sheetSyncStatus: 'error',
            sheetSyncError: sheetSyncResult.reason || 'Google Sheets sync skipped.',
            sheetSyncUpdatedAt: new Date().toISOString(),
          });
        } else {
          sheetSyncStatus = 'synced';
          await submissionDoc.ref.update({
            sheetSyncStatus: 'synced',
            sheetSyncedAt: new Date().toISOString(),
            sheetSyncUpdatedAt: new Date().toISOString(),
            sheetSummaryAction: sheetSyncResult.summaryAction,
            sheetAnswerRowsDeleted: sheetSyncResult.answerRowsDeleted,
            sheetAnswerRowsAppended: sheetSyncResult.answerRowsAppended,
            sheetSyncVersion: FieldValue.increment(1),
          });
        }
      }
    } catch (sheetSyncError) {
      sheetSyncStatus = 'error';
      console.error('Google Sheets sync failed:', sheetSyncError);
      await submissionDoc.ref.update({
        sheetSyncStatus: 'error',
        sheetSyncError:
          sheetSyncError instanceof Error ? sheetSyncError.message : String(sheetSyncError),
        sheetSyncUpdatedAt: new Date().toISOString(),
      });
    }

    try {
      await sendOnboardingSubmittedNotification({ submissionId: cleanSubmissionId });
    } catch (notificationError) {
      console.error('Onboarding submitted notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      driveFolderId: googleDriveFolderId,
      driveFolderUrl: googleDriveFolderUrl,
      driveWorkspaceStatus,
      submittedAt,
      sheetSyncStatus,
      sheetSyncResult: sheetSyncResult
        ? {
            skipped: sheetSyncResult.skipped,
            summaryAction: sheetSyncResult.summaryAction,
            answerRowsDeleted: sheetSyncResult.answerRowsDeleted,
            answerRowsAppended: sheetSyncResult.answerRowsAppended,
            reason: sheetSyncResult.reason,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Finalize onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
