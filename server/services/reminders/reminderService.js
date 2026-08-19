const { prisma } = require('../../db/db');
const logger = require('../../utils/logger');
const emailService = require('../email/emailService');
const config = require('../../config');
const { encryptField } = require('../crypto/fieldCrypto');

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Process every reminder whose nextRunAt has passed: notify + email + advance.
// `now` is injectable so tests can force a due date.
async function processDueReminders(now = new Date()) {
  const due = await prisma.reminderSchedule.findMany({
    where: { active: true, nextRunAt: { lte: now } },
    include: {
      assessment: true,
      organization: { include: { users: { where: { role: { in: ['owner', 'admin'] } } } } },
    },
  });

  let fired = 0;
  for (const schedule of due) {
    const { assessment, organization } = schedule;
    if (!assessment) continue;

    const link = `${config.clientUrl}/assessments/${assessment.id}`;
    const recipients = organization.users.length ? organization.users : [];

    // In-app notification for each owner/admin.
    for (const user of recipients) {
      const notification = await prisma.notification.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          type: 'review_due',
          title: 'Annual review due',
          // Carries the customer's assessment title, so encrypted like other
          // tenant free text (the title itself stays generic).
          body: await encryptField(organization.id, `"${assessment.title}" is due for its annual compliance review.`),
          link: `/assessments/${assessment.id}`,
        },
      });
      try {
        const result = await emailService.sendReviewReminderEmail(user, assessment, link);
        await prisma.notification.update({
          where: { id: notification.id },
          data: { emailSentAt: new Date() },
        });
        if (result.previewUrl) logger.info('reminder email preview', result.previewUrl);
      } catch (err) {
        logger.warn('reminder email failed (will retry next tick)', err.message);
      }
    }

    // Flag the assessment and advance the schedule by one interval.
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { status: 'needs_review' },
    });
    await prisma.reminderSchedule.update({
      where: { id: schedule.id },
      data: {
        lastFiredAt: now,
        nextRunAt: addDays(now, schedule.intervalDays),
      },
    });
    fired += 1;
  }

  if (fired) logger.info(`reminders: fired ${fired} review reminder(s)`);
  return fired;
}

module.exports = { processDueReminders, addDays };
