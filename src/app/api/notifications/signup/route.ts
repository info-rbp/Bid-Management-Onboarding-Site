import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendSignupNotification } from '@/lib/notifications';
import {
  applyRateLimit,
  HttpError,
  jsonError,
  parseJsonBody,
  requireFirebaseUser,
  requireInternalSecret,
} from '@/lib/server/request';
import { internalSignupNotificationSchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization') || '';
    const internalSecret = process.env.SIGNUP_NOTIFICATION_INTERNAL_SECRET;
    const providedSecret = req.headers.get('x-internal-notification-secret');

    let userId: string | null = null;

    if (authorization.startsWith('Bearer ')) {
      const decodedToken = await requireFirebaseUser(req);
      userId = decodedToken.uid;

      applyRateLimit({
        request: req,
        scope: 'signup-notification',
        subject: userId,
        limit: 5,
        windowMs: 60_000,
      });
    } else {
      requireInternalSecret({
        headerValue: providedSecret,
        secret: internalSecret,
      });

      applyRateLimit({
        request: req,
        scope: 'signup-notification-internal',
        subject: 'internal',
        limit: 20,
        windowMs: 60_000,
      });

      const body = await parseJsonBody(req, internalSignupNotificationSchema);
      userId = body.userId.trim();
    }

    if (!userId) {
      return jsonError('Unable to determine user for notification.', 400);
    }

    const db = getAdminDb();
    const userSnapshot = await db.collection('users').doc(userId).get();

    if (!userSnapshot.exists) {
      return jsonError('User not found.', 404);
    }

    const userData = userSnapshot.data() || {};
    const fullName = String(userData.fullName || '');
    const businessName = String(userData.businessName || '');
    const email = String(userData.email || '');
    const billingAddress = String(userData.billingAddress || 'Not provided');

    if (!fullName || !businessName || !email) {
      return jsonError(
        'User profile is missing required notification fields.',
        400
      );
    }

    await sendSignupNotification({
      fullName,
      businessName,
      email,
      billingAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }

    console.error('Signup notification email failed:', error);

    return jsonError('Failed to send signup notification.', 500);
  }
}