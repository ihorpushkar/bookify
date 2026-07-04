import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;
let etherealAccountLogged = false;

async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  if (env.smtpHost) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser && env.smtpPass
        ? { user: env.smtpUser, pass: env.smtpPass }
        : undefined,
    });
    return transporter;
  }

  const account = await nodemailer.createTestAccount();

  if (!etherealAccountLogged) {
    console.log(`Ethereal email (dev): ${account.user}`);
    etherealAccountLogged = true;
  }

  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  return transporter;
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`Email preview: ${previewUrl}`);
  }
}

export function sendEmailSafe(options: SendEmailOptions): void {
  sendEmail(options).catch((error) => {
    console.error('Failed to send email:', error);
  });
}
