const { prisma } = require('../db/db');
const logger = require('./logger');
const { clientIp } = require('./clientIp');

// Append-only audit logging. Never throws into the request path.
async function recordAudit({ req, action, entityType, entityId, before, after }) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: req?.organizationId || null,
        actorUserId: req?.user?.id || null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        before: before ?? undefined,
        after: after ?? undefined,
        // null unless the address is genuinely the subject's — see clientIp.
        ip: req ? clientIp(req) : null,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  } catch (err) {
    logger.warn('audit log failed', action, err.message);
  }
}

module.exports = { recordAudit };
