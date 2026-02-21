function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildWelcomeEmail({ name }) {
  const safeName = escapeHtml(name || 'there');
  const subject = 'Welcome to Chautari';
  const text = `Hi ${name || 'there'},\n\nYour Chautari account was created successfully.\n\nIf you didn’t create this account, you can ignore this email.\n`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Welcome to Chautari</h2>
      <p style="margin: 0 0 12px;">Hi ${safeName},</p>
      <p style="margin: 0 0 12px;">Your account was created successfully.</p>
      <p style="margin: 0; color: #555;">If you didn’t create this account, you can ignore this email.</p>
    </div>
  `.trim();

  return { subject, text, html };
}

