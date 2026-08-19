// GDPR Art. 5(1)(e) — storage limitation.
//
// Personal data may not be kept in an identifiable form for longer than is
// necessary for the purpose it was collected for. Nothing in this app deleted
// anything, so audit entries, used verification tokens, dead invitations and
// read notifications accumulated indefinitely. This job bounds each of them.
//
// Deliberately NOT pruned here:
//   - compliance content (assessments, responses, AI systems) — the customer's
//     own records, retained until they delete their account/organisation;
//   - unread notifications and pending invitations — still serving a purpose.
const { prisma } = require('../../db/db');
const config = require('../../config');
const logger = require('../../utils/logger');

const daysAgo = (n, now) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

// One sweep. Idempotent and safe to run repeatedly; returns per-store counts so
// the caller (and the tests) can assert on what was removed.
async function runRetentionSweep(now = new Date()) {
  const r = config.retention;

  const [auditLogs, emailTokens, invitations, notifications] = await Promise.all([
    prisma.auditLog.deleteMany({
      where: { createdAt: { lt: daysAgo(r.auditLogDays, now) } },
    }),
    // Only tokens that can no longer be used: already consumed, or expired.
    // A pending, unexpired token is still needed to verify an email.
    prisma.emailToken.deleteMany({
      where: {
        OR: [
          { consumedAt: { not: null, lt: daysAgo(r.emailTokenDays, now) } },
          { expiresAt: { lt: daysAgo(r.emailTokenDays, now) } },
        ],
      },
    }),
    prisma.invitation.deleteMany({
      where: {
        status: { in: ['accepted', 'revoked'] },
        createdAt: { lt: daysAgo(r.invitationDays, now) },
      },
    }),
    prisma.notification.deleteMany({
      where: {
        readAt: { not: null },
        createdAt: { lt: daysAgo(r.notificationDays, now) },
      },
    }),
  ]);

  const counts = {
    auditLogs: auditLogs.count,
    emailTokens: emailTokens.count,
    invitations: invitations.count,
    notifications: notifications.count,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total > 0) logger.info('retention sweep removed', JSON.stringify(counts));
  return counts;
}

module.exports = { runRetentionSweep };
