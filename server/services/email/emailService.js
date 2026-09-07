const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const config = require('../../config');
const logger = require('../../utils/logger');

let transporterPromise = null;

// Resend is the primary transport. Built lazily so the app still runs without it.
let resendClient = null;
function getResend() {
  if (resendClient === null && config.email.resendApiKey) {
    resendClient = new Resend(config.email.resendApiKey);
    logger.info('email: using Resend transport');
  }
  return resendClient;
}

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

// `attachments`, when given, is an array of { filename, content: Buffer }.
// Resend wants base64 content; nodemailer accepts a Buffer directly.
async function sendMail({ to, subject, html, text, attachments }) {
  // Primary path: Resend.
  const resend = getResend();
  if (resend) {
    const { data, error } = await resend.emails.send({
      from: config.email.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content.toString('base64') })),
    });
    if (error) {
      logger.error(`email: Resend failed for ${to} (${subject})`, error.message || error);
      throw new Error(error.message || 'Failed to send email');
    }
    logger.info(`email sent to ${to} via Resend (${subject}) id=${data && data.id}`);
    return { messageId: (data && data.id) || null, previewUrl: null };
  }

  // Fallback: nodemailer (SMTP host, or console/Ethereal in dev).
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
    attachments,
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
    subject: 'Verify your email - Compliance Check',
    text: `Welcome to Compliance Check. Confirm your email: ${verifyUrl}`,
    html: emailShell(
      'Confirm your email address',
      `<p>Welcome to <strong>Compliance Check</strong>. Please confirm your email address to activate your account.</p>
       <p style="margin:24px 0;"><a href="${verifyUrl}" style="background:#0b2545;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:600;">Verify email</a></p>
       <p style="color:#5b6b7b;font-size:13px;">Or paste this link into your browser:<br>${verifyUrl}</p>
       <p style="color:#5b6b7b;font-size:13px;">This link expires in 24 hours.</p>`,
    ),
  });
}

async function sendPasswordResetEmail(user, resetUrl) {
  return sendMail({
    to: user.email,
    subject: 'Reset your password - Compliance Check',
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
    subject: `You are invited to join ${orgName} on Compliance Check`,
    text: `${inviterName || 'A colleague'} invited you to join ${orgName} on Compliance Check. Accept here: ${url}`,
    html: emailShell(
      `Join ${orgName} on Compliance Check`,
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

// AVV Section 5.2: "Nach Abschluss uebermittelt der Anbieter dem Kunden
// zusaetzlich ein vollstaendiges Exemplar (einschliesslich aller Anlagen) an
// die E-Mail-Adresse der abschliessenden Person." The PDF is the static,
// versioned template file (see reportService's AVV_VERSIONS), attached
// as-is; nothing about it is customer-specific, the acceptance record
// (who, when, on behalf of which company) lives in the database, not in
// the document body.
async function sendAvvSignedEmail(user, org, version, pdfBuffer) {
  return sendMail({
    to: user.email,
    subject: `Your Data Processing Agreement (AVV) - Compliance Check`,
    text: `Thank you for accepting the Art. 28 GDPR Data Processing Agreement (AVV) for Compliance Check on behalf of ${org.name}, version ${version}. A full copy is attached to this email, and you can download it again at any time from Settings.`,
    html: emailShell(
      'Your Data Processing Agreement (AVV)',
      `<p>Thank you for accepting the Art. 28 GDPR Data Processing Agreement (AVV) for Compliance Check on behalf of <strong>${org.name}</strong>.</p>
       <p style="color:#5b6373;font-size:13px;">Version ${version}. A full copy, including all annexes, is attached to this email as a PDF, and you can download it again at any time from your organisation's Settings page.</p>`,
    ),
    attachments: [{ filename: `avv-compliance-check-v${version}.pdf`, content: pdfBuffer }],
  });
}

async function sendSupportAccessGrantedEmail(user, org, grant) {
  return sendMail({
    to: user.email,
    subject: `Support access granted - ${org.name}`,
    text: `A support access grant was created for ${org.name}: "${grant.caseReference}", active until ${grant.expiresAt.toISOString()}. You can revoke it at any time from Settings.`,
    html: emailShell(
      'Support access granted',
      `<p>A support access grant was created for <strong>${org.name}</strong>.</p>
       <p style="color:#5b6373;font-size:13px;">Case: ${grant.caseReference}<br>Active until: ${grant.expiresAt.toUTCString()}</p>
       <p style="color:#5b6373;font-size:13px;">You can revoke this grant at any time from Settings.</p>`,
    ),
  });
}

async function sendSupportAccessReportEmail(user, org, grant) {
  const statusLabel = grant.status === 'revoked' ? 'revoked' : 'expired';
  return sendMail({
    to: user.email,
    subject: `Support access ${statusLabel} - ${org.name}`,
    text: `The support access grant for ${org.name} ("${grant.caseReference}") has ${statusLabel}. It was active from ${grant.createdAt.toISOString()} to ${(grant.revokedAt || grant.expiresAt).toISOString()}.`,
    html: emailShell(
      `Support access ${statusLabel}`,
      `<p>The support access grant for <strong>${org.name}</strong> has ${statusLabel}.</p>
       <p style="color:#5b6373;font-size:13px;">Case: ${grant.caseReference}<br>Active: ${grant.createdAt.toUTCString()} to ${(grant.revokedAt || grant.expiresAt).toUTCString()}</p>`,
    ),
  });
}

// AVV Section 15.3: a sub-processor change must be notified in advance, by
// email, to every Owner-role user, naming the firm, address, task and
// transfer basis. Sent by an operator running scripts/notifySubprocessorChange.js
// when a real change happens, not triggered automatically by product code.
async function sendSubprocessorChangeEmail(user, details) {
  return sendMail({
    to: user.email,
    subject: 'Upcoming change to a Compliance Check sub-processor',
    text: `We are ${details.action} a sub-processor: ${details.name}, ${details.address}. Task: ${details.task}. Location: ${details.location}. This takes effect on ${details.effectiveDate} unless you object within 28 days by replying to this email.`,
    html: emailShell(
      'Upcoming sub-processor change',
      `<p>We are ${details.action} a sub-processor used to run Compliance Check.</p>
       <p style="color:#5b6373;font-size:13px;">
         Firm: ${details.name}<br>Address: ${details.address}<br>Task: ${details.task}<br>
         Location: ${details.location}<br>Transfer basis: ${details.transferBasis || 'n/a'}
       </p>
       <p>This takes effect on <strong>${details.effectiveDate}</strong>. Under Section 15.4 of the Data Processing Agreement, you may object within 28 days of this notice by replying to this email.</p>`,
    ),
  });
}

// AVV Section 11.2 / Art. 33-34 GDPR: sent by an operator running
// scripts/notifyBreach.js for a specific, real incident, not automated.
async function sendBreachNotificationEmail(user, org, details) {
  return sendMail({
    to: user.email,
    subject: `Data breach notification - ${org.name}`,
    text: `We are notifying you, as required by Art. 33/34 GDPR, of a personal data breach affecting ${org.name}. Nature: ${details.nature}. Likely consequences: ${details.consequences}. Measures taken: ${details.measures}.`,
    html: emailShell(
      'Data breach notification',
      `<p>We are notifying you, as required by Art. 33 and 34 GDPR, of a personal data breach affecting <strong>${org.name}</strong>.</p>
       <p style="color:#5b6373;font-size:13px;">
         Nature of the breach: ${details.nature}<br>
         Likely consequences: ${details.consequences}<br>
         Measures taken or proposed: ${details.measures}
       </p>
       <p>Contact info@rit.services with any questions.</p>`,
    ),
  });
}

function emailShell(heading, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c2733;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #d8d0c4;border-top:4px solid #0b2545;">
        <tr><td style="padding:28px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#0b2545;font-weight:700;margin-bottom:8px;">Compliance Check</div>
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
  sendAvvSignedEmail,
  sendSupportAccessGrantedEmail,
  sendSupportAccessReportEmail,
  sendSubprocessorChangeEmail,
  sendBreachNotificationEmail,
};
