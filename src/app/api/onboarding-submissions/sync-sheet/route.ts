import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { syncOnboardingSubmissionToSheet } from '@/lib/google-sheets/onboarding-submissions';
import {
  applyRateLimit,
  HttpError,
  jsonError,
  parseJsonBody,
  requireFirebaseUser,
  requireInternalSecret,
} from '@/lib/server/request';
import { syncSubmissionBodySchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let requestBody: { submissionId: string } | null = null;

  try {
    const authorization = request.headers.get('authorization') || '';
    const internalSecretHeader = request.headers.get('x-internal-sync-secret') || '';
    const internalSecret = process.env.ONBOARDING_SYNC_INTERNAL_SECRET;

    let decodedToken: { uid: string } | null = null;

    if (authorization.startsWith('Bearer ')) {
      decodedToken = await requireFirebaseUser(request);
      applyRateLimit({
        request,
        scope: 'onboarding-sync-sheet',
        subject: decodedToken.uid,
        limit: 10,
        windowMs: 60_000,
      });
    } else {
      requireInternalSecret({
        headerValue: internalSecretHeader,
        secret: internalSecret,
      });
      applyRateLimit({
        request,
        scope: 'onboarding-sync-sheet-internal',
        subject: 'internal',
        limit: 30,
        windowMs: 60_000,
      });
    }

    requestBody = await parseJsonBody(request, syncSubmissionBodySchema);
    const cleanSubmissionId = requestBody.submissionId.trim();

    const submissionRef = getAdminDb()
      .collection('onboardingSubmissions')
      .doc(cleanSubmissionId);

    const submissionSnapshot = await submissionRef.get();

    if (!submissionSnapshot.exists) {
      return jsonError('Onboarding submission not found.', 404);
    }

    const submissionData = submissionSnapshot.data();

    if (!submissionData) {
      return jsonError('Onboarding submission has no data.', 404);
    }

    if (decodedToken && submissionData.userId !== decodedToken.uid) {
      return jsonError('You do not have access to this onboarding submission.', 403);
    }

    const result = await syncOnboardingSubmissionToSheet({
      submissionId: cleanSubmissionId,
      data: submissionData,
    });

    if (result.skipped) {
      await submissionRef.update({
        sheetSyncStatus: 'error',
        sheetSyncError:
          result.reason || 'Google Sheets sync configuration missing.',
        sheetSyncUpdatedAt: new Date().toISOString(),
      });

      return jsonError(
        result.reason || 'Failed to sync onboarding submission to Google Sheets.',
        500
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
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }

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

    return jsonError('Failed to sync onboarding submission to Google Sheets.', 500);
  }
}