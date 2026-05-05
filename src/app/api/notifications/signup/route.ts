import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { fullName, businessName, email, billingAddress } = await req.json();

    if (!fullName || !businessName || !email) {
      return NextResponse.json(
        { error: 'Missing required signup notification fields' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SIGNUP_NOTIFICATION_TO || 'info@donmassimocoffee.com.au',
      subject: `New onboarding signup: ${businessName}`,
      text: [
        'A new user has created an account.',
        '',
        `Name: ${fullName}`,
        `Business: ${businessName}`,
        `Email: ${email}`,
        `Billing Address: ${billingAddress || 'Not provided'}`,
      ].join('\n'),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Signup notification email failed:', error);

    return NextResponse.json(
      { error: 'Failed to send signup notification' },
      { status: 500 }
    );
  }
}
