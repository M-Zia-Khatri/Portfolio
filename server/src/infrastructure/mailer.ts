import nodemailer from "nodemailer";
import { getConfig } from "../config/env.js";

const { mailer } = getConfig();

const transporter = nodemailer.createTransport({
  host: mailer.host,
  port: mailer.port,
  secure: mailer.secure,
  auth: {
    user: mailer.user,
    pass: mailer.pass,
  },
});

// ─── VERIFY CONNECTION ON STARTUP ────────────────────────────────────────────

export async function verifyMailer(): Promise<void> {
  await transporter.verify();
  console.log("✓ Mailer connected");
}

// ─── SEND OTP EMAIL ──────────────────────────────────────────────────────────

export async function sendOtpEmail(
  toEmail: string,
  fullName: string,
  otpCode: string,
): Promise<void> {
  await transporter.sendMail({
    from: `"Admin Portal" <${mailer.from}>`,
    to: toEmail,
    subject: "Your Admin Login OTP",
    text: `Hi ${fullName},\n\nYour one-time password is: ${otpCode}\n\nIt expires in 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Admin Portal</h2>
        <p>Hi <strong>${fullName}</strong>,</p>
        <p>Your one-time password is:</p>
        <div style="font-size:2rem;font-weight:700;letter-spacing:.3em;padding:16px 24px;background:#f0f4ff;border-radius:8px;display:inline-block">
          ${otpCode}
        </div>
        <p style="color:#888;font-size:.875rem;margin-top:16px">
          Expires in <strong>5 minutes</strong>. Do not share this with anyone.
        </p>
      </div>
    `,
  });
}

// ─── SEND CONTACT EMAIL ───────────────────────────────────────────────────────

export async function sendContactEmail(
  fullName: string,
  email: string,
  message: string,
  createdAt: Date,
): Promise<void> {
  await transporter.sendMail({
    from: `"Portfolio Contact" <${mailer.from}>`, // was: process.env.Seed
    to: mailer.adminEmail,
    replyTo: email,
    subject: `New message from ${fullName}`,
    text: `New contact form submission\n\nName:    ${fullName}\nEmail:   ${email}\nDate:    ${createdAt.toISOString()}\n\n${message}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="margin-bottom:4px">New Contact Message</h2>
        <p style="color:#888;font-size:.875rem;margin-top:0">
          Received on ${createdAt.toLocaleString()}
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr>
            <td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:80px;border-radius:4px 0 0 4px">Name</td>
            <td style="padding:8px 12px;background:#fafafa">${fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f5f5f5;font-weight:600;border-radius:4px 0 0 4px">Email</td>
            <td style="padding:8px 12px;background:#fafafa">
              <a href="mailto:${email}" style="color:#3b82f6">${email}</a>
            </td>
          </tr>
        </table>
        <div style="background:#fafafa;border-left:3px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;white-space:pre-wrap;line-height:1.6">
          ${message}
        </div>
        <p style="color:#aaa;font-size:.8rem;margin-top:24px">
          Hit reply to respond directly to ${fullName}.
        </p>
      </div>
    `,
  });
}
