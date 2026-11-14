import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Without SMTP settings we just print the email, which is perfect for local development.
const transport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export async function sendMail({ to, subject, text }) {
  await transport.sendMail({ from: env.MAIL_FROM, to, subject, text });
  if (!env.SMTP_HOST) console.log(`[mail:dev] to=${to} | ${subject}\n  ${text}`);
}
