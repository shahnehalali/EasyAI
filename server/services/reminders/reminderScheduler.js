const cron = require('node-cron');
const config = require('../../config');
const logger = require('../../utils/logger');
const { processDueReminders } = require('./reminderService');

let task = null;

// Single daily in-process job. Idempotent and cheap (one indexed query per tick).
function startReminderScheduler() {
  if (task) return task;
  if (!cron.validate(config.reminders.cron)) {
    logger.warn('reminders: invalid REMINDER_CRON, scheduler not started', config.reminders.cron);
    return null;
  }
  task = cron.schedule(config.reminders.cron, async () => {
    try {
      await processDueReminders(new Date());
    } catch (err) {
      logger.error('reminder scheduler tick failed', err.message);
    }
  });
  logger.info('reminders: scheduler started with cron', config.reminders.cron);
  return task;
}

module.exports = { startReminderScheduler };
