const cron = require('node-cron');
const config = require('../../config');
const logger = require('../../utils/logger');
const { runRetentionSweep } = require('./retentionService');

let task = null;

// Single daily in-process job, same shape as the reminder scheduler.
function startRetentionScheduler() {
  if (task) return task;
  if (!cron.validate(config.retention.cron)) {
    logger.warn('retention: invalid RETENTION_CRON, scheduler not started', config.retention.cron);
    return null;
  }
  task = cron.schedule(config.retention.cron, async () => {
    try {
      await runRetentionSweep(new Date());
    } catch (err) {
      logger.error('retention sweep failed', err.message);
    }
  });
  logger.info('retention: scheduler started with cron', config.retention.cron);
  return task;
}

module.exports = { startRetentionScheduler };
