import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { syncOnboardingSubmissionToSheet } from '@/lib/google-sheets/onboarding-submissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let requestBody: any = null;

  try {
    const authorization = request.headers.get('authorization') || '';
    const internalSecretHeader = request.headers.get('x-internal-sync-secret') || '';
    const internalSecret = process.env.ONBOARDING_SYNC_INTERNAL_SECRET;
    const isInternalSync = internalSecret && internalSecretHeader === internalSecret;

    let decodedToken: { uid: string } | null = null;

    if (authorization.startsWith('Bearer ')) {
      const idToken = authorization.replace('Bearer ', '').trim();

      if (!idToken) {
        return NextResponse.json({ error: 'Empty Firebase ID token.' }, { status: 401 });
      }

      decodedToken = await getAdminAuth().verifyIdToken(idToken);
    } else if (!isInternalSync) {
      return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 401 });
    }

    requestBody = await request.json().catch(() => null);
    const submissionId = requestBody?.submissionId;

    if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
      return NextResponse.json({ error: 'Missing submissionId.' }, { status: 400 });
    }

    const cleanSubmissionId = submissionId.trim();

    const submissionRef = getAdminDb()
      .collection('onboardingSubmissions')
      .doc(cleanSubmissionId);

    const submissionSnapshot = await submissionRef.get();

    if (!submissionSnapshot.exists) {
      return NextResponse.json({ error: 'Onboarding submission not found.' }, { status: 404 });
    }

    const submissionData = submissionSnapshot.data();

    if (!submissionData) {
      return NextResponse.json({ error: 'Onboarding submission has no data.' }, { status: 404 });
    }

    if (decodedToken && submissionData.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'You do not have access to this onboarding submission.' },
        { status: 403 }
      );
    }

    const result = await syncOnboardingSubmissionToSheet({
      submissionId: cleanSubmissionId,
      data: submissionData,
    });

    if (result.skipped) {
      await submissionRef.update({
        sheetSyncStatus: 'error',
        sheetSyncError: result.reason || 'Google Sheets sync configuration missing.',
        sheetSyncUpdatedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: result.reason || 'Failed to sync onboarding submission to Google Sheets.' },
        { status: 500 }
      );
    }

    await submissionRef.update({
      sheetSyncedAt: new Date().toISOString(),
      sheetSyncStatus: 'synced',
      sheetSyncUpdatedAt: new Date().toISOString(),
      sheetSummaryAction: result.summaryAction,
      sheetAnswerRowsDeleted: result.answerRowsDeleted,
      sheetAnswerRowsAppended: result.answerRowsAppended,
      sheetSyncVersion: FieldValue.increment(1),
    });

    return NextResponse.json({
      ok: true,
      submissionId: cleanSubmissionId,
      summaryAction: result.summaryAction,
      answerRowsDeleted: result.answerRowsDeleted,
      answerRowsAppended: result.answerRowsAppended,
    });
  } catch (error) {
    console.error('Failed to sync onboarding submission to Google Sheets:', error);

    try {
      const submissionId = requestBody?.submissionId;

      if (typeof submissionId === 'string' && submissionId.trim().length > 0) {
        await getAdminDb()
          .collection('onboardingSubmissions')
          .doc(submissionId.trim())
          .update({
            sheetSyncStatus: 'error',
            sheetSyncError: String(error instanceof Error ? error.message : error),
            sheetSyncUpdatedAt: new Date().toISOString(),
          });
      }
    } catch (innerError) {
      console.error('Failed to update sheet sync error metadata:', innerError);
    }

    return NextResponse.json(
      { error: 'Failed to sync onboarding submission to Google Sheets.' },
      { status: 500 }
    );
  }
}
