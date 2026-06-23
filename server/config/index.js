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

  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'JurisAI <no-reply@aicompliance.local>',
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
};

module.exports = config;
