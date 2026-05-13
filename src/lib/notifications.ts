import nodemailer from 'nodemailer';
import { getAdminDb } from './firebase-admin';

const GOOGLE_WORKSPACE_AUTH_EMAIL =
  process.env.GOOGLE_WORKSPACE_AUTH_EMAIL || 'info@remotebusinesspartner.com.au';
const GOOGLE_WORKSPACE_FROM_EMAIL =
  process.env.GOOGLE_WORKSPACE_FROM_EMAIL || 'tenders@remotebusinesspartner.com.au';
const GOOGLE_WORKSPACE_FROM_NAME =
  process.env.GOOGLE_WORKSPACE_FROM_NAME || 'Remote Business Partner Tenders';
const GOOGLE_WORKSPACE_APP_PASSWORD = process.env.GOOGLE_WORKSPACE_APP_PASSWORD;
const ONBOARDING_SUBMISSION_NOTIFICATION_TO =
  process.env.ONBOARDING_SUBMISSION_NOTIFICATION_TO || 'tenders@remotebusinesspartner.com.au';
const SIGNUP_NOTIFICATION_TO =
  process.env.SIGNUP_NOTIFICATION_TO || 'tenders@remotebusinesspartner.com.au';

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function cleanSingleLine(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export function formatOptionalValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return 'Not provided';
  }

  return String(value);
}

export function isSafeEmail(value: string) {
  const normalized = String(value || '').trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function createWorkspaceTransporter() {
  if (!GOOGLE_WORKSPACE_APP_PASSWORD) {
    throw new Error('Email service is not configured');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GOOGLE_WORKSPACE_AUTH_EMAIL,
      pass: GOOGLE_WORKSPACE_APP_PASSWORD,
    },
  });
}

export async function sendSignupNotification(params: {
  fullName: string;
  businessName: string;
  email: string;
  billingAddress?: string;
}) {
  const transporter = createWorkspaceTransporter();

  const plainFullName = cleanSingleLine(params.fullName);
  const plainBusinessName = cleanSingleLine(params.businessName);
  const plainEmail = cleanSingleLine(params.email);
  const plainBillingAddress = cleanSingleLine(
    formatOptionalValue(params.billingAddress)
  );

  const safeFullName = escapeHtml(plainFullName);
  const safeBusinessName = escapeHtml(plainBusinessName);
  const safeEmail = escapeHtml(plainEmail);
  const safeBillingAddress = escapeHtml(plainBillingAddress);

  if (!isSafeEmail(plainEmail)) {
    throw new Error('Invalid email address');
  }

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
        <tr><td><strong>Name</strong></td><td>${safeFullName}</td></tr>
        <tr><td><strong>Business</strong></td><td>${safeBusinessName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
        <tr><td><strong>Billing Address</strong></td><td>${safeBillingAddress}</td></tr>
      </table>
    `,
  });
}

export async function sendOnboardingSubmittedNotification(params: {
  submissionId: string;
}) {
  const db = getAdminDb();

  const submissionSnapshot = await db
    .collection('onboardingSubmissions')
    .doc(params.submissionId)
    .get();

  if (!submissionSnapshot.exists) {
    throw new Error('Onboarding submission not found');
  }

  const submissionData = submissionSnapshot.data() || {};
  const userId = String(submissionData.userId || '');

  if (!userId) {
    throw new Error('Submission does not specify a userId');
  }

  const userSnapshot = await db.collection('users').doc(userId).get();
  const userData = userSnapshot.data() || {};

  const fullName =
    String(userData.fullName || submissionData.fullName || 'Unknown User');
  const businessName =
    String(userData.businessName || submissionData.businessName || 'Unknown Business');
  const email = String(userData.email || submissionData.email || '');
  const billingAddress =
    String(userData.billingAddress || submissionData.billingAddress || 'Not provided');
  const onboardingStatus = String(submissionData.status || 'submitted');
  const submittedAt = String(submissionData.submittedAt || new Date().toISOString());
  const driveFolderUrl = String(submissionData.googleDriveFolderUrl || 'Not provided');

  if (!isSafeEmail(email)) {
    throw new Error('Submission owner email is not valid');
  }

  const plainFullName = cleanSingleLine(fullName);
  const plainBusinessName = cleanSingleLine(businessName);
  const plainEmail = cleanSingleLine(email);
  const plainBillingAddress = cleanSingleLine(formatOptionalValue(billingAddress));
  const plainOnboardingStatus = cleanSingleLine(onboardingStatus);
  const plainSubmittedAt = cleanSingleLine(submittedAt);
  const plainDriveFolderUrl = cleanSingleLine(driveFolderUrl);

  const safeFullName = escapeHtml(plainFullName);
  const safeBusinessName = escapeHtml(plainBusinessName);
  const safeEmail = escapeHtml(plainEmail);
  const safeBillingAddress = escapeHtml(plainBillingAddress);
  const safeOnboardingStatus = escapeHtml(plainOnboardingStatus);
  const safeSubmittedAt = escapeHtml(plainSubmittedAt);
  const safeDriveFolderUrl = escapeHtml(plainDriveFolderUrl);

  const transporter = createWorkspaceTransporter();

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
      `Onboarding Status: ${plainOnboardingStatus}`,
      `Submitted At: ${plainSubmittedAt}`,
      `Drive Folder: ${plainDriveFolderUrl}`,
    ].join('\n'),
    html: `
      <h2>Onboarding submitted</h2>
      <p>A user has completed and submitted their onboarding.</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
        <tr><td><strong>Name</strong></td><td>${safeFullName}</td></tr>
        <tr><td><strong>Business</strong></td><td>${safeBusinessName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
        <tr><td><strong>Billing Address</strong></td><td>${safeBillingAddress}</td></tr>
        <tr><td><strong>Onboarding Status</strong></td><td>${safeOnboardingStatus}</td></tr>
        <tr><td><strong>Submitted At</strong></td><td>${safeSubmittedAt}</td></tr>
        <tr><td><strong>Drive Folder</strong></td><td>${safeDriveFolderUrl}</td></tr>
      </table>
    `,
  });
}
