// CommonJS port of @ritjira/feedback-server createFeedbackRouter.
// Same contract as the plugin: POST / accepts a feedback payload, validates it
// with zod, renders an email and hands it to the configured mailer.
const { Router } = require('express');
const { feedbackSchema } = require('./validators');
const { resolveMailer, resolveRecipients, resolveFromAddress } = require('./mailer');
const { renderFeedbackEmail } = require('./template');
const { createRateLimiter } = require('./rateLimiter');

const noopLog = () => {};
const defaultLogger = {
  info: (msg) => console.log(`[feedback] ${msg}`),
  warn: (msg) => console.warn(`[feedback] ${msg}`),
  error: (msg, meta) => console.error(`[feedback] ${msg}`, meta ?? ''),
};

function dataUrlToAttachment(dataUrl) {
  const match = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('invalid data URL');
  const [, contentType, ext, b64] = match;
  const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
  return {
    filename: `feedback-screenshot.${cleanExt}`,
    content: Buffer.from(b64, 'base64'),
    contentType,
  };
}

// Adapts the host app's user object ({ id, email, fullName }) to the plugin's
// submitter shape. Anonymous submissions return undefined and still work.
function getSubmitter(req) {
  const u = req.user;
  if (!u || !u.id || !u.email) return undefined;
  return { id: u.id, email: u.email, name: u.name || u.fullName || u.email };
}

function createFeedbackRouter(options = {}) {
  const log = options.logger ?? defaultLogger;
  const recipients = resolveRecipients(options.recipients);
  const fromAddress = resolveFromAddress(options.fromAddress);
  const subjectPrefix = options.subjectPrefix ?? '[Feedback]';

  if (recipients.length === 0) {
    log.warn(
      'no recipients configured. Set `recipients: [...]` on createFeedbackRouter() or FEEDBACK_RECIPIENTS env var. Submissions will fail with 503.',
    );
  }

  const send = resolveMailer(options.mailer, { info: log.info, warn: log.warn ?? noopLog });

  const router = Router();

  const isProd = process.env.NODE_ENV === 'production';
  const rateLimitEnabled = options.rateLimit?.enabled ?? isProd;

  if (rateLimitEnabled) {
    router.use(
      createRateLimiter({
        windowMs: options.rateLimit?.windowMs ?? 10 * 60 * 1000,
        max: options.rateLimit?.max ?? 5,
        keyFn: (req) => {
          const submitter = getSubmitter(req);
          if (submitter) return `user:${submitter.id}`;
          return `ip:${req.ip ?? req.socket?.remoteAddress ?? 'unknown'}`;
        },
      }),
    );
  }

  router.post('/', async (req, res, next) => {
    try {
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.flatten() });
      }

      if (recipients.length === 0) {
        return res.status(503).json({
          error: 'no_recipients_configured',
          message: 'Feedback plugin has no recipients configured.',
        });
      }

      const payload = parsed.data;
      const submitter = getSubmitter(req);
      const receivedAt = new Date();

      const attachment = dataUrlToAttachment(payload.screenshot);
      const { html, text } = renderFeedbackEmail({ payload, submitter, receivedAt });

      const subject = `${subjectPrefix} ${payload.title}`.slice(0, 250);

      await send({
        to: recipients,
        from: fromAddress,
        subject,
        html,
        text,
        attachments: [attachment],
      });

      log.info(`sent to ${recipients.length} recipient(s) — title="${payload.title}"`);

      // After the email (order matters: never lose feedback to a ticketing
      // outage), optionally open a ticket. Failures here are logged, not fatal.
      let ticket = null;
      if (typeof options.createTicket === 'function') {
        try {
          ticket = await options.createTicket({ payload, submitter, receivedAt });
          if (ticket) log.info(`ticket created: ${ticket.key || ticket.id}`);
        } catch (err) {
          log.error('ticket creation failed', err);
        }
      }

      res.status(202).json({ ok: true, ticket: ticket ? { id: ticket.id, key: ticket.key } : null });
    } catch (err) {
      log.error('feedback send failed', err);
      next(err);
    }
  });

  return router;
}

module.exports = { createFeedbackRouter };
