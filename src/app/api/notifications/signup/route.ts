import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { fullName, businessName, email, billingAddress } = await req.json();

    // IMPORTANT: Replace with actual SMTP credentials in environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // Your SMTP username
            pass: process.env.SMTP_PASS, // Your SMTP password
        },
    });

    const mailOptions = {
        from: `"BidFlow Connect" <${process.env.SMTP_FROM_EMAIL}>`, // sender address
        to: "tenders@remotebusinesspartner.com.au", // list of receivers
        subject: "New Client Signup - BidFlow Connect", // Subject line
        html: `
            <h1>New Client Signup!</h1>
            <p>A new user has just created an account. Please prepare the invoice.</p>
            <h2>User Details:</h2>
            <ul>
                <li><strong>Full Name:</strong> ${fullName}</li>
                <li><strong>Business Name:</strong> ${businessName}</li>
                <li><strong>Email Address:</strong> ${email}</li>
                <li><strong>Billing Address:</strong> <pre>${billingAddress}</pre></li>
            </ul>
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
