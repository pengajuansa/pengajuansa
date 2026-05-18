import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    let transporter;

    // Jika tidak ada pengaturan email di .env.local, gunakan akun tester Ethereal
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('No EMAIL_USER found in .env.local. Creating test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"Polimdo Academic" <${process.env.EMAIL_USER || 'testing@pansgarage.com'}>`,
      to,
      subject,
      html,
    });

    if (!process.env.EMAIL_USER) {
      console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
