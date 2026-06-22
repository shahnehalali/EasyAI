const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const config = require('./config');
const logger = require('./utils/logger');
const { connectDb } = require('./db/db');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const ErrorResponse = require('./utils/errorResponse');
const routes = require('./routes');
const { authHandler } = require('./middlewares/authHandler');
const { buildFeedbackRouter } = require('./integrations/feedback');
const { startReminderScheduler } = require('./services/reminders/reminderScheduler');
const { startSnapshotScheduler } = require('./services/trends/snapshotService');
const { startMonthlyReportScheduler } = require('./services/reports/reportScheduler');

const app = express();

// Behind a reverse proxy in production so client IPs (and rate limiting) work.
if (config.env === 'production') app.set('trust proxy', 1);

// Security headers. CSP is disabled here because the SPA is served separately
// (by Vite/static host), and uploads are allowed cross-origin for downloads.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: config.clientUrl, credentials: true }));
// Feedback screenshots are several MB, so parse this route with a larger limit
// BEFORE the global 2mb parser (which then skips the already-parsed body).
app.use('/api/feedback', express.json({ limit: '15mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Serve uploaded documents (dev local storage).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Screenshot-feedback plugin: authenticated so the email shows who submitted.
app.use('/api/feedback', authHandler, buildFeedbackRouter());

app.use('/api', routes);

// 404 for unmatched API routes.
app.use((req, res, next) => next(new ErrorResponse(`Route not found: ${req.originalUrl}`, 404)));

app.use(errorHandler);

async function start() {
  await connectDb();
  startReminderScheduler();
  startSnapshotScheduler();
  startMonthlyReportScheduler();
  app.listen(config.port, () => {
    logger.info(`server listening on http://localhost:${config.port} (${config.env})`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('failed to start server', err.message);
    process.exit(1);
  });
}

module.exports = app;
