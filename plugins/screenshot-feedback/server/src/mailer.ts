import nodemailer from 'nodemailer';
import type { MailerOption, MailerSendFn, SendMailArgs } from './types.js';

type MailerLogFn = (msg: string, meta?: unknown) => void;
const noopLog: MailerLogFn = () => {};

export function resolveMailer(
  option: MailerOption,
  log: { info: MailerLogFn; warn: MailerLogFn } = { info: noopLog, warn: noopLog },
): MailerSendFn {
  if (option && 'send' in option && typeof option.send === 'function') {
    return option.send;
  }

  if (option && 'transport' in option && option.transport) {
    const tx = option.transport;
    return async (args: SendMailArgs) => {
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

  if (option && 'mode' in option && option.mode === 'console') {
    return async (args: SendMailArgs) => {
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

  return async (args: SendMailArgs) => {
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

export function resolveRecipients(configured: string[] | undefined): string[] {
  if (configured && configured.length > 0) return configured;
  const env = process.env.FEEDBACK_RECIPIENTS;
  if (!env) return [];
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolveFromAddress(configured: string | undefined): string {
  return (
    configured ||
    process.env.FEEDBACK_FROM_ADDRESS ||
    process.env.SMTP_FROM ||
    'feedback@localhost'
  );
}
