import type { Transporter } from 'nodemailer';

export interface FeedbackAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendMailArgs {
  to: string[];
  from: string;
  subject: string;
  html: string;
  text: string;
  attachments: FeedbackAttachment[];
}

export interface MailerSendFn {
  (args: SendMailArgs): Promise<void>;
}

export type MailerOption =
  | { send: MailerSendFn }
  | { transport: Transporter }
  | { mode: 'console' }
  | undefined;

export interface FeedbackRouterOptions {
  recipients?: string[];
  fromAddress?: string;
  subjectPrefix?: string;
  mailer?: MailerOption;
  rateLimit?: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
  };
  logger?: {
    info: (msg: string, meta?: unknown) => void;
    warn: (msg: string, meta?: unknown) => void;
    error: (msg: string, meta?: unknown) => void;
  };
}

export interface FeedbackPayload {
  title: string;
  description: string;
  screenshot: string;
  pageUrl?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  meta?: Record<string, string | number | boolean>;
}

export interface FeedbackSubmitter {
  id: string;
  email: string;
  name: string;
}
