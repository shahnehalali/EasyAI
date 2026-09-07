const { prisma } = require('../../db/db');
const logger = require('../../utils/logger');
const config = require('../../config');
const emailService = require('../email/emailService');
const { recordAudit } = require('../../utils/audit');

// This models the AUTHORISATION RECORD the AVV requires before RIT support
// staff may access an organisation's data for a named case (Anlage 2,
// "Support-Zugriff"): who approved it, for how long, and that it is fully
// revocable and audited. It is deliberately self-service, granted by the
// organisation's own Owner/Admin, exactly as the AVV describes, not a
// platform-staff "request" workflow (no such cross-tenant surface exists
// anywhere else in this codebase). The actual pseudonymised support gateway
// described in the AVV (Anlage 3 Nr. 5) is separate infrastructure outside
// this application; what this gives the customer is exactly what the AVV
// promises them: visibility into whether support access is currently open,
// for what, until when, and a one-click way to revoke it.

function ownerAdminUsers(organizationId) {
  return prisma.user.findMany({ where: { organizationId, role: { in: ['owner', 'admin'] } } });
}

async function createGrant({ req, organizationId, grantedByUserId, caseReference, durationHours, requestedByStaff }) {
  const hours = Math.min(Math.max(durationHours || config.supportAccess.defaultHours, 1), config.supportAccess.maxHours);
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  const grant = await prisma.supportAccessGrant.create({
    data: {
      organizationId,
      caseReference,
      requestedByStaff: requestedByStaff || null,
      grantedByUserId,
      expiresAt,
    },
  });

  await recordAudit({
    req, action: 'support_access.granted', entityType: 'SupportAccessGrant', entityId: grant.id,
    after: { caseReference, expiresAt: expiresAt.toISOString() },
  });

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  const recipients = await ownerAdminUsers(organizationId);
  for (const user of recipients) {
    try {
      await emailService.sendSupportAccessGrantedEmail(user, org, grant);
    } catch (err) {
      logger.warn('support access granted email failed', err.message);
    }
  }

  return grant;
}

async function revokeGrant({ req, organizationId, grantId, revokedByUserId }) {
  const grant = await prisma.supportAccessGrant.findFirst({ where: { id: grantId, organizationId } });
  if (!grant) return null;
  if (grant.status !== 'active') return grant;

  const updated = await prisma.supportAccessGrant.update({
    where: { id: grantId },
    data: { status: 'revoked', revokedAt: new Date(), revokedByUserId },
  });

  await recordAudit({ req, action: 'support_access.revoked', entityType: 'SupportAccessGrant', entityId: grant.id });
  await sendReport(updated);
  return updated;
}

async function sendReport(grant) {
  const org = await prisma.organization.findUnique({ where: { id: grant.organizationId } });
  const recipients = await ownerAdminUsers(grant.organizationId);
  for (const user of recipients) {
    try {
      await emailService.sendSupportAccessReportEmail(user, org, grant);
    } catch (err) {
      logger.warn('support access report email failed', err.message);
    }
  }
  await prisma.supportAccessGrant.update({ where: { id: grant.id }, data: { reportSentAt: new Date() } });
}

// Flips any grant whose expiresAt has passed to "expired" and sends the
// report email, same shape as reminderService.processDueReminders. `now` is
// injectable so tests can force a due date without waiting on the clock.
async function expireDueGrants(now = new Date()) {
  const due = await prisma.supportAccessGrant.findMany({
    where: { status: 'active', expiresAt: { lte: now } },
  });

  let expired = 0;
  for (const grant of due) {
    const updated = await prisma.supportAccessGrant.update({
      where: { id: grant.id },
      data: { status: 'expired' },
    });
    await recordAudit({ req: { organizationId: grant.organizationId }, action: 'support_access.expired', entityType: 'SupportAccessGrant', entityId: grant.id });
    await sendReport(updated);
    expired += 1;
  }

  if (expired) logger.info(`support access: expired ${expired} grant(s)`);
  return expired;
}

module.exports = { createGrant, revokeGrant, expireDueGrants };
