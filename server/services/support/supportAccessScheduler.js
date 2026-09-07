const cron = require('node-cron');
const config = require('../../config');
const logger = require('../../utils/logger');
const { expireDueGrants } = require('./supportAccessService');

let task = null;

// Frequent tick (every 15 minutes by default): support access grants are
// short-lived (hours, not days), so a daily cron like the other schedulers
// would leave a grant looking "active" long after its window actually closed.
function startSupportAccessScheduler() {
  if (task) return task;
  if (!cron.validate(config.supportAccess.cron)) {
    logger.warn('support access: invalid SUPPORT_ACCESS_CRON, scheduler not started', config.supportAccess.cron);
    return null;
  }
  task = cron.schedule(config.supportAccess.cron, async () => {
    try {
      await expireDueGrants(new Date());
    } catch (err) {
      logger.error('support access scheduler tick failed', err.message);
    }
  });
  logger.info('support access: scheduler started with cron', config.supportAccess.cron);
  return task;
}

module.exports = { startSupportAccessScheduler };
