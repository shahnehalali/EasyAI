// CommonJS port of @rit-services/feedback-server mailer resolution.
const nodemailer = require('nodemailer');

const noopLog = () => {};

function resolveMailer(option, log = { info: noopLog, warn: noopLog }) {
  if (option && typeof option.send === 'function') {
    return option.send;
  }

  if (option && option.transport) {
    const tx = option.transport;
    return async (args) => {
      await tx.sendMail({
        from: args.from,
        to: args.to.join(', '),
        subject: args.subject,
        html: args.html,
        text: args.text,
        attachments: args.attachments,
      });
    };
  }

  if (option && option.mode === 'console') {
    return async (args) => {
      log.info(
        `[feedback:console] to=${args.to.join(',')} subject="${args.subject}" attachments=${args.attachments.length}`,
      );
    };
  }

  const host = process.env.FEEDBACK_SMTP_HOST;
  if (!host) {
    throw new Error(
      'screenshot-feedback: no mailer configured. Pass `mailer.send`, `mailer.transport`, `mailer.mode = "console"`, or set FEEDBACK_SMTP_HOST/PORT/USER/PASS.',
    );
  }

  const port = Number(process.env.FEEDBACK_SMTP_PORT) || 587;
  const secure = process.env.FEEDBACK_SMTP_SECURE === 'true' || port === 465;
  const user = process.env.FEEDBACK_SMTP_USER;
  const pass = process.env.FEEDBACK_SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  return async (args) => {
    await transporter.sendMail({
      from: args.from,
      to: args.to.join(', '),
      subject: args.subject,
      html: args.html,
      text: args.text,
      attachments: args.attachments,
    });
  };
}

function resolveRecipients(configured) {
  if (configured && configured.length > 0) return configured;
  const env = process.env.FEEDBACK_RECIPIENTS;
  if (!env) return [];
  return env.split(',').map((s) => s.trim()).filter(Boolean);
}

function resolveFromAddress(configured) {
  return (
    configured ||
    process.env.FEEDBACK_FROM_ADDRESS ||
    process.env.SMTP_FROM ||
    'feedback@localhost'
  );
}

module.exports = { resolveMailer, resolveRecipients, resolveFromAddress };
