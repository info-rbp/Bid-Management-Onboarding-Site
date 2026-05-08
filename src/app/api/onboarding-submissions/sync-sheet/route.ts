import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { appendOnboardingSubmissionToSheet } from '@/lib/google-sheets/onboarding-submissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization') || '';

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

    const body = await request.json().catch(() => null);
    const submissionId = body?.submissionId;

    if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing submissionId.' },
        { status: 400 }
      );
    }

    const cleanSubmissionId = submissionId.trim();

    const submissionRef = getAdminDb()
      .collection('onboardingSubmissions')
      .doc(cleanSubmissionId);

    const submissionSnapshot = await submissionRef.get();

    if (!submissionSnapshot.exists) {
      return NextResponse.json(
        { error: 'Onboarding submission not found.' },
        { status: 404 }
      );
    }

    const submissionData = submissionSnapshot.data();

    if (!submissionData) {
      return NextResponse.json(
        { error: 'Onboarding submission has no data.' },
        { status: 404 }
      );
    }

    if (submissionData.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'You do not have access to this onboarding submission.' },
        { status: 403 }
      );
    }

    const result = await appendOnboardingSubmissionToSheet({
      submissionId: cleanSubmissionId,
      data: submissionData,
    });

    return NextResponse.json({
      ok: true,
      submissionId: cleanSubmissionId,
      ...result,
    });
  } catch (error) {
    console.error('Failed to sync onboarding submission to Google Sheets:', error);

    return NextResponse.json(
      { error: 'Failed to sync onboarding submission to Google Sheets.' },
      { status: 500 }
    );
  }
}
