// Central config loader. Reads from process.env (populated by dotenv in index.js).
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.COOKIE_NAME || 'aic_session',
  },

  // Master key for per-organization field encryption (base64-encoded 32 bytes).
  // When unset (dev), field encryption runs in passthrough mode (data stored as-is).
  // MUST be stable in production and backed up, or encrypted data becomes unreadable.
  dataEncKey: process.env.DATA_ENC_KEY || '',

  email: {
    // Resend is the primary transport. When RESEND_API_KEY is set it is used;
    // otherwise the app falls back to SMTP / console (see emailService).
    resendApiKey: process.env.RESEND_API_KEY || '',
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Compliance Check <no-reply@aicompliance.local>',
  },

  reminders: {
    cron: process.env.REMINDER_CRON || '0 7 * * *',
    leadDays: parseInt(process.env.REMINDER_LEAD_DAYS || '30', 10),
  },

  snapshots: {
    cron: process.env.SNAPSHOT_CRON || '0 1 * * *', // daily 01:00
  },

  monthlyReport: {
    cron: process.env.MONTHLY_REPORT_CRON || '0 8 1 * *', // 1st of month, 08:00
  },

  // GDPR Art. 5(1)(e) storage limitation: personal data must not be kept in an
  // identifiable form for longer than necessary. These bound the two stores
  // that would otherwise grow forever. Run daily by the retention scheduler.
  retention: {
    cron: process.env.RETENTION_CRON || '30 2 * * *', // daily 02:30
    // Audit entries are the accountability record (Art. 5(2)); 12 months is the
    // shortest period that still covers an annual compliance review cycle.
    auditLogDays: parseInt(process.env.RETENTION_AUDIT_LOG_DAYS || '365', 10),
    // Consumed/expired verification + reset tokens have no purpose once used.
    emailTokenDays: parseInt(process.env.RETENTION_EMAIL_TOKEN_DAYS || '7', 10),
    // Invitations that were never accepted.
    invitationDays: parseInt(process.env.RETENTION_INVITATION_DAYS || '90', 10),
    // Read notifications the user has already seen.
    notificationDays: parseInt(process.env.RETENTION_NOTIFICATION_DAYS || '180', 10),
  },
};

module.exports = config;
