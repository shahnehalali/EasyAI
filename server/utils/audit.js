const { prisma } = require('../db/db');
const logger = require('./logger');

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
        ip: req?.ip,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  } catch (err) {
    logger.warn('audit log failed', action, err.message);
  }
}

module.exports = { recordAudit };
