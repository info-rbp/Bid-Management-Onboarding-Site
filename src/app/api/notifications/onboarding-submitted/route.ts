import { NextResponse } from 'next/server';
import { sendOnboardingSubmittedNotification } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const internalSecret = process.env.ONBOARDING_NOTIFICATION_INTERNAL_SECRET;
    const providedSecret = req.headers.get('x-internal-notification-secret');

    if (!internalSecret) {
      return NextResponse.json(
        { error: 'Onboarding submission notifications are not available.' },
        { status: 405 }
      );
    }

    if (providedSecret !== internalSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const submissionId = body?.submissionId;

    if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
      return NextResponse.json({ error: 'Missing submissionId.' }, { status: 400 });
    }

    await sendOnboardingSubmittedNotification({ submissionId: submissionId.trim() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding submission notification failed:', error);

    return NextResponse.json(
      { error: 'Failed to send onboarding submission notification' },
      { status: 500 }
    );
  }
}
