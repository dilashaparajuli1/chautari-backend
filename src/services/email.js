import nodemailer from 'nodemailer';

let cachedTransporter = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const secure =
    typeof process.env.SMTP_SECURE === 'string'
      ? process.env.SMTP_SECURE.toLowerCase() === 'true'
      : undefined;

  return { host, port, user, pass, from, secure };
}

export function isEmailConfigured() {
  const { host, port, user, pass, from } = getSmtpConfig();
  return Boolean(host && port && user && pass && from);
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { host, port, user, pass, secure } = getSmtpConfig();
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: typeof secure === 'boolean' ? secure : port === 465,
    auth: { user, pass },
    // Avoid hanging requests if SMTP is unreachable/misconfigured.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cachedTransporter;
}

/**
 * Sends an email if SMTP is configured.
 * Returns { status: 'sent' | 'skipped' | 'failed', error?: string }
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    return { status: 'skipped', error: 'SMTP is not configured' };
  }

  const { from } = getSmtpConfig();

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return { status: 'sent', messageId: info.messageId };
  } catch (err) {
    return { status: 'failed', error: err?.message || String(err) };
  }
}

