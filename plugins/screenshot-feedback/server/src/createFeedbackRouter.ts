import { Router, type Request, type Response, type NextFunction } from 'express';
import { feedbackSchema } from './validators.js';
import { resolveMailer, resolveRecipients, resolveFromAddress } from './mailer.js';
import { renderFeedbackEmail } from './template.js';
import { createRateLimiter } from './rateLimiter.js';
import type { FeedbackRouterOptions, FeedbackAttachment, FeedbackSubmitter } from './types.js';

const noopLog = (..._args: unknown[]) => {};
const defaultLogger = {
  info: (msg: string) => console.log(`[feedback] ${msg}`),
  warn: (msg: string) => console.warn(`[feedback] ${msg}`),
  error: (msg: string, meta?: unknown) => console.error(`[feedback] ${msg}`, meta ?? ''),
};

function dataUrlToAttachment(dataUrl: string): FeedbackAttachment {
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

function getSubmitter(req: Request): FeedbackSubmitter | undefined {
  const u = (req as Request & { user?: { id?: string; email?: string; name?: string } }).user;
  if (!u || !u.id || !u.email) return undefined;
  return { id: u.id, email: u.email, name: u.name || u.email };
}

export function createFeedbackRouter(options: FeedbackRouterOptions = {}): Router {
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
          return `ip:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`;
        },
      }),
    );
  }

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = feedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'invalid_payload',
          issues: parsed.error.flatten(),
        });
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
      res.status(202).json({ ok: true });
    } catch (err) {
      log.error('feedback send failed', err);
      next(err);
    }
  });

  return router;
}
