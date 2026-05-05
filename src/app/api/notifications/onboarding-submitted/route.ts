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

const ONBOARDING_SUBMISSION_NOTIFICATION_TO =
  process.env.ONBOARDING_SUBMISSION_NOTIFICATION_TO ||
  'tenders@remotebusinesspartner.com.au';

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

function formatOptionalValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'Not provided';
  }

  return String(value);
}

export async function POST(req: Request) {
  try {
    const {
      fullName,
      businessName,
      email,
      billingAddress,
      userId,
      onboardingStatus,
      submittedAt,
      driveFolderUrl,
    } = await req.json();

    if (!fullName || !businessName || !email) {
      return NextResponse.json(
        { error: 'Missing required onboarding submission notification fields' },
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

    const plainFullName = cleanSingleLine(String(fullName));
    const plainBusinessName = cleanSingleLine(String(businessName));
    const plainEmail = cleanSingleLine(String(email));
    const plainBillingAddress = cleanSingleLine(formatOptionalValue(billingAddress));
    const plainUserId = cleanSingleLine(formatOptionalValue(userId));
    const plainOnboardingStatus = cleanSingleLine(
      formatOptionalValue(onboardingStatus || 'submitted')
    );
    const plainSubmittedAt = cleanSingleLine(
      formatOptionalValue(submittedAt || new Date().toISOString())
    );
    const plainDriveFolderUrl = cleanSingleLine(formatOptionalValue(driveFolderUrl));

    const safeFullName = escapeHtml(plainFullName);
    const safeBusinessName = escapeHtml(plainBusinessName);
    const safeEmail = escapeHtml(plainEmail);
    const safeBillingAddress = escapeHtml(plainBillingAddress);
    const safeUserId = escapeHtml(plainUserId);
    const safeOnboardingStatus = escapeHtml(plainOnboardingStatus);
    const safeSubmittedAt = escapeHtml(plainSubmittedAt);
    const safeDriveFolderUrl = escapeHtml(plainDriveFolderUrl);

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
      to: ONBOARDING_SUBMISSION_NOTIFICATION_TO,
      replyTo: plainEmail,
      subject: `Onboarding submitted: ${plainBusinessName}`,
      text: [
        'A user has completed and submitted their onboarding.',
        '',
        `Name: ${plainFullName}`,
        `Business: ${plainBusinessName}`,
        `Email: ${plainEmail}`,
        `Billing Address: ${plainBillingAddress}`,
        `User ID: ${plainUserId}`,
        `Onboarding Status: ${plainOnboardingStatus}`,
        `Submitted At: ${plainSubmittedAt}`,
        `Drive Folder: ${plainDriveFolderUrl}`,
      ].join('\n'),
      html: `
        <h2>Onboarding submitted</h2>

        <p>A user has completed and submitted their onboarding.</p>

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
          <tr>
            <td><strong>User ID</strong></td>
            <td>${safeUserId}</td>
          </tr>
          <tr>
            <td><strong>Onboarding Status</strong></td>
            <td>${safeOnboardingStatus}</td>
          </tr>
          <tr>
            <td><strong>Submitted At</strong></td>
            <td>${safeSubmittedAt}</td>
          </tr>
          <tr>
            <td><strong>Drive Folder</strong></td>
            <td>${safeDriveFolderUrl}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding submission notification email failed:', error);

    return NextResponse.json(
      { error: 'Failed to send onboarding submission notification' },
      { status: 500 }
    );
  }
}
