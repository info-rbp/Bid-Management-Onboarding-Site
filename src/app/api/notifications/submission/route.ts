import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { businessName, submissionId } = await req.json();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // This is a placeholder link. In a real application, you'd link to an admin panel.
    const submissionLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/submissions/${submissionId}`;

    const mailOptions = {
        from: `"BidFlow Connect" <${process.env.SMTP_FROM_EMAIL}>`,
        to: "tenders@remotebusinesspartner.com.au",
        subject: "New Client Onboarding Submission - BidFlow Connect",
        html: `
            <h1>New Onboarding Submission!</h1>
            <p>A client has completed and submitted their onboarding form.</p>
            <h2>Submission Details:</h2>
            <ul>
                <li><strong>Business Name:</strong> ${businessName || "(Not provided)"}</li>
                <li><strong>Submission ID:</strong> ${submissionId}</li>
            </ul>
            <p>You can view the full submission in your admin dashboard.</p>
            <p>(Note: The link below is a placeholder and will need to be configured to point to your admin panel)</p>
            <a href="${submissionLink}">${submissionLink}</a>
            <hr>
            <p>This is an automated notification from the BidFlow Connect platform.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email", details: error.message }, { status: 500 });
    }
}
