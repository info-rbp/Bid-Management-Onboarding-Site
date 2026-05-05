import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const GOOGLE_WORKSPACE_AUTH_EMAIL =
  process.env.GOOGLE_WORKSPACE_AUTH_EMAIL || 'info@remotebusinesspartner.com.au';

const GOOGLE_WORKSPACE_FROM_EMAIL =
  process.env.GOOGLE_WORKSPACE_FROM_EMAIL || 'tenders@remotebusinesspartner.com.au';

const GOOGLE_WORKSPACE_FROM_NAME =
  process.env.GOOGLE_WORKSPACE_FROM_NAME || 'Remote Business Partner Tenders';

const GOOGLE_WORKSPACE_APP_PASSWORD =
  process.env.GOOGLE_WORKSPACE_APP_PASSWORD;

const SIGNUP_NOTIFICATION_TO =
  process.env.SIGNUP_NOTIFICATION_TO || 'tenders@remotebusinesspartner.com.au';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cleanSingleLine(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export async function POST(req: Request) {
  try {
    const { fullName, businessName, email, billingAddress } = await req.json();

    if (!fullName || !businessName || !email) {
      return NextResponse.json(
        { error: 'Missing required signup notification fields' },
        { status: 400 }
      );
    }

    if (!GOOGLE_WORKSPACE_APP_PASSWORD) {
      console.error('Missing GOOGLE_WORKSPACE_APP_PASSWORD environment variable');

      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    const safeFullName = escapeHtml(String(fullName));
    const safeBusinessName = escapeHtml(String(businessName));
    const safeEmail = escapeHtml(String(email));
    const safeBillingAddress = escapeHtml(
      billingAddress ? String(billingAddress) : 'Not provided'
    );

    const plainFullName = cleanSingleLine(String(fullName));
    const plainBusinessName = cleanSingleLine(String(businessName));
    const plainEmail = cleanSingleLine(String(email));
    const plainBillingAddress = billingAddress
      ? cleanSingleLine(String(billingAddress))
      : 'Not provided';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GOOGLE_WORKSPACE_AUTH_EMAIL,
        pass: GOOGLE_WORKSPACE_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${GOOGLE_WORKSPACE_FROM_NAME}" <${GOOGLE_WORKSPACE_FROM_EMAIL}>`,
      to: SIGNUP_NOTIFICATION_TO,
      replyTo: plainEmail,
      subject: `New onboarding signup: ${plainBusinessName}`,
      text: [
        'A new user has created an account.',
        '',
        `Name: ${plainFullName}`,
        `Business: ${plainBusinessName}`,
        `Email: ${plainEmail}`,
        `Billing Address: ${plainBillingAddress}`,
      ].join('\n'),
      html: `
        <h2>New onboarding signup</h2>

        <p>A new user has created an account.</p>

        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td><strong>Name</strong></td>
            <td>${safeFullName}</td>
          </tr>
          <tr>
            <td><strong>Business</strong></td>
            <td>${safeBusinessName}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>${safeEmail}</td>
          </tr>
          <tr>
            <td><strong>Billing Address</strong></td>
            <td>${safeBillingAddress}</td>
          </tr>
        </table>
      `,
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
