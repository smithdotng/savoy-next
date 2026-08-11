import nodemailer from 'nodemailer';

let transporter;

// Lazily builds the SMTP transporter from env vars so importing this file
// doesn't throw when env vars aren't set yet (e.g. during `next build`).
// Resolves the SMTP password, preferring SMTP_PASS_B64.
//
// Why base64: .env is not plain text - `#` starts a comment and `$NAME` is
// expanded as a variable. Passwords containing those characters get silently
// truncated, which surfaces as a misleading "535 authentication failed" from
// the mail server. Base64 output is only [A-Za-z0-9+/=], so it survives .env
// parsing untouched no matter what the real password contains.
function resolvePassword() {
  const { SMTP_PASS_B64, SMTP_PASS } = process.env;

  if (SMTP_PASS_B64) {
    return Buffer.from(SMTP_PASS_B64, 'base64').toString('utf8');
  }

  // Fail loudly on the truncation case rather than letting the mail server
  // reject a 1-2 character password with an opaque error.
  if (SMTP_PASS && SMTP_PASS.length < 4) {
    throw new Error(
      `SMTP_PASS loaded as only ${SMTP_PASS.length} character(s) - it was almost certainly ` +
        'truncated by .env parsing (an unquoted "#" starts a comment). Either single-quote it ' +
        'and escape every "$" as "\\$", or set SMTP_PASS_B64 to the base64 of your password. ' +
        'See README.'
    );
  }

  return SMTP_PASS;
}

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER } = process.env;
  const SMTP_PASS = resolvePassword();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS ' +
        '(or SMTP_PASS_B64) in .env'
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465 (implicit TLS), false for 587/25 (STARTTLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  return mailer.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo
  });
}
