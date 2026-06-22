const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../utils/logger');

let transporterPromise = null;

// Lazily build a transporter. If no SMTP_HOST is configured (dev), create an
// Ethereal test account so every email gets a preview URL in the logs.
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (config.email.host) {
      logger.info('email: using configured SMTP host', config.email.host);
      return nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined,
      });
    }
    // Opt-in Ethereal preview inbox (set EMAIL_PREVIEW=true). Network-dependent.
    if (process.env.EMAIL_PREVIEW === 'true') {
      try {
        const testAccount = await nodemailer.createTestAccount();
        logger.info('email: using Ethereal test account', testAccount.user);
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email', port: 587, secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
      } catch (err) {
        logger.warn('email: Ethereal unavailable, using console transport', err.message);
      }
    }
    // Default dev transport: instant and offline-safe. Links are printed to logs.
    logger.info('email: using console transport (set EMAIL_PREVIEW=true for Ethereal preview URLs)');
    return nodemailer.createTransport({ jsonTransport: true });
  })();

  return transporterPromise;
}

async function sendMail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    logger.info(`email sent to ${to} - preview: ${preview}`);
  } else {
    // Console transport: surface the plain-text body so dev can copy any link.
    logger.info(`email to ${to} (${subject})${text ? ` :: ${text}` : ''}`);
  }

  return { messageId: info.messageId, previewUrl: preview || null };
}

// ---- Templated emails ----

async function sendVerificationEmail(user, verifyUrl) {
  return sendMail({
    to: user.email,
    subject: 'Verify your email - Easy AI',
    text: `Welcome to Easy AI. Confirm your email: ${verifyUrl}`,
    html: emailShell(
      'Confirm your email address',
      `<p>Welcome to <strong>Easy AI</strong>. Please confirm your email address to activate your account.</p>
       <p style="margin:24px 0;"><a href="${verifyUrl}" style="background:#0b2545;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:600;">Verify email</a></p>
       <p style="color:#5b6b7b;font-size:13px;">Or paste this link into your browser:<br>${verifyUrl}</p>
       <p style="color:#5b6b7b;font-size:13px;">This link expires in 24 hours.</p>`,
    ),
  });
}

async function sendPasswordResetEmail(user, resetUrl) {
  return sendMail({
    to: user.email,
    subject: 'Reset your password - Easy AI',
    text: `Reset your password: ${resetUrl}`,
    html: emailShell(
      'Reset your password',
      `<p>We received a request to reset your password.</p>
       <p style="margin:24px 0;"><a href="${resetUrl}" style="background:#0b2545;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:600;">Reset password</a></p>
       <p style="color:#5b6b7b;font-size:13px;">If you did not request this, you can safely ignore this email. The link expires in 1 hour.</p>`,
    ),
  });
}

async function sendReviewReminderEmail(user, assessment, link) {
  return sendMail({
    to: user.email,
    subject: `Annual review due: ${assessment.title}`,
    text: `Your compliance assessment "${assessment.title}" is due for its annual review. Open it here: ${link}`,
    html: emailShell(
      'A compliance review is due',
      `<p>Your assessment <strong>${assessment.title}</strong> is due for its annual review.</p>
       <p style="margin:24px 0;"><a href="${link}" style="background:#0b2545;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:600;">Review now</a></p>
       <p style="color:#5b6b7b;font-size:13px;">Keeping reviews current is part of demonstrating ongoing compliance.</p>`,
    ),
  });
}

async function sendInvitationEmail(email, url, orgName, inviterName) {
  return sendMail({
    to: email,
    subject: `You are invited to join ${orgName} on Easy AI`,
    text: `${inviterName || 'A colleague'} invited you to join ${orgName} on Easy AI. Accept here: ${url}`,
    html: emailShell(
      `Join ${orgName} on Easy AI`,
      `<p>${inviterName || 'A colleague'} has invited you to collaborate on AI compliance for <strong>${orgName}</strong>.</p>
       <p style="margin:24px 0;"><a href="${url}" style="background:#5b5bd6;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Accept invitation</a></p>
       <p style="color:#5b6373;font-size:13px;">Or paste this link into your browser:<br>${url}</p>
       <p style="color:#5b6373;font-size:13px;">This invitation expires in 7 days.</p>`,
    ),
  });
}

async function sendMonthlyReportEmail(user, org, summary, link) {
  const rows = (summary.activeFrameworks || []).map((f) => `<li>${f.name}: ${f.progressPct}%</li>`).join('');
  return sendMail({
    to: user.email,
    subject: `Monthly compliance summary - ${org.name}`,
    text: `Monthly compliance summary for ${org.name}. Overall standing ${summary.overall}%. Reviews due: ${summary.counts.reviewsDue}. Open items: ${summary.counts.openItems}. Open the dashboard: ${link}`,
    html: emailShell(
      `Monthly compliance summary`,
      `<p>Here is this month's compliance standing for <strong>${org.name}</strong>.</p>
       <p style="font-size:30px;font-weight:700;color:#5b5bd6;margin:14px 0;">${summary.overall}% <span style="font-size:13px;color:#5b6373;font-weight:400;">overall</span></p>
       <p style="color:#5b6373;font-size:13px;">AI systems: ${summary.counts.aiSystems} · Assessments: ${summary.counts.assessments} · Reviews due: ${summary.counts.reviewsDue} · Open items: ${summary.counts.openItems}</p>
       ${rows ? `<p style="font-size:13px;color:#16181d;margin-bottom:4px;"><strong>By framework</strong></p><ul style="color:#16181d;font-size:13px;">${rows}</ul>` : ''}
       <p style="margin:22px 0;"><a href="${link}" style="background:#5b5bd6;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Open the dashboard</a></p>`,
    ),
  });
}

function emailShell(heading, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c2733;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #d8d0c4;border-top:4px solid #0b2545;">
        <tr><td style="padding:28px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#0b2545;font-weight:700;margin-bottom:8px;">Easy AI</div>
          <hr style="border:none;border-top:1px solid #d8d0c4;margin:0 0 20px;">
          <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#0b2545;margin:0 0 12px;">${heading}</h1>
          ${bodyHtml}
        </td></tr>
      </table>
      <div style="color:#8a96a3;font-size:11px;margin-top:16px;">This is an automated message for orientation only and is not legal advice.</div>
    </td></tr></table>
  </body></html>`;
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReviewReminderEmail,
  sendInvitationEmail,
  sendMonthlyReportEmail,
};
