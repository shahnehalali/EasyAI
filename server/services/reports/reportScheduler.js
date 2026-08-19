const cron = require('node-cron');
const { prisma } = require('../../db/db');
const config = require('../../config');
const logger = require('../../utils/logger');
const emailService = require('../email/emailService');
const { computeOrgSummary } = require('./aggregateService');
const { encryptField } = require('../crypto/fieldCrypto');

// Send the monthly compliance summary to org owners/admins. `onlyOrgId` limits
// it to a single organisation (used by the forced-run endpoint and tests).
async function sendMonthlyReports(now = new Date(), onlyOrgId = null) {
  const orgs = await prisma.organization.findMany({
    where: onlyOrgId ? { id: onlyOrgId } : {},
    include: { users: { where: { role: { in: ['owner', 'admin'] } } } },
  });

  let sent = 0;
  for (const org of orgs) {
    const summary = await computeOrgSummary(org.id);
    const link = `${config.clientUrl}/`;
    for (const user of org.users) {
      try {
        await emailService.sendMonthlyReportEmail(user, org, summary, link);
        await prisma.notification.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            type: 'system',
            title: 'Monthly compliance summary',
            body: await encryptField(org.id, `Overall standing ${summary.overall}%. ${summary.counts.reviewsDue} review(s) due.`),
            link: '/',
            emailSentAt: new Date(),
          },
        });
        sent += 1;
      } catch (err) {
        logger.warn('monthly report email failed', err.message);
      }
    }
    await prisma.organization.update({ where: { id: org.id }, data: { lastMonthlyReportAt: now } });
  }
  logger.info(`monthly reports: sent ${sent} summary email(s)`);
  return sent;
}

let task = null;
function startMonthlyReportScheduler() {
  if (task) return task;
  if (!cron.validate(config.monthlyReport.cron)) {
    logger.warn('monthly reports: invalid MONTHLY_REPORT_CRON, scheduler not started', config.monthlyReport.cron);
    return null;
  }
  task = cron.schedule(config.monthlyReport.cron, async () => {
    try { await sendMonthlyReports(new Date()); } catch (err) { logger.error('monthly report tick failed', err.message); }
  });
  logger.info('monthly reports: scheduler started with cron', config.monthlyReport.cron);
  return task;
}

module.exports = { sendMonthlyReports, startMonthlyReportScheduler };
