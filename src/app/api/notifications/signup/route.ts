import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { sendSignupNotification } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization') || '';
    const internalSecret = process.env.SIGNUP_NOTIFICATION_INTERNAL_SECRET;
    const providedSecret = req.headers.get('x-internal-notification-secret');

    let userId: string | null = null;

    if (authorization.startsWith('Bearer ')) {
      const idToken = authorization.replace('Bearer ', '').trim();

      if (!idToken) {
        return NextResponse.json({ error: 'Empty Firebase ID token.' }, { status: 401 });
      }

      const decodedToken = await getAdminAuth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } else if (internalSecret && providedSecret === internalSecret) {
      const body = await req.json().catch(() => null);
      if (!body?.userId) {
        return NextResponse.json({ error: 'Missing userId for internal notification.' }, { status: 400 });
      }

      userId = String(body.userId).trim();
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to determine user for notification.' }, { status: 400 });
    }

    const db = getAdminDb();
    const userSnapshot = await db.collection('users').doc(userId).get();

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userData = userSnapshot.data() || {};
    const fullName = String(userData.fullName || '');
    const businessName = String(userData.businessName || '');
    const email = String(userData.email || '');
    const billingAddress = String(userData.billingAddress || 'Not provided');

    if (!fullName || !businessName || !email) {
      return NextResponse.json(
        { error: 'User profile is missing required notification fields.' },
        { status: 400 }
      );
    }

    await sendSignupNotification({
      fullName,
      businessName,
      email,
      billingAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup notification email failed:', error);

    return NextResponse.json(
      { error: 'Failed to send signup notification' },
      { status: 500 }
    );
  }
}
