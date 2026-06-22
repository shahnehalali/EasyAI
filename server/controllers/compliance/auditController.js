const { prisma } = require('../../db/db');

// GET /api/audit?action=&limit=  -> recent activity for the organisation
async function list(req, res) {
  const take = Math.min(parseInt(req.query.limit || '100', 10), 500);
  const where = { organizationId: req.organizationId };
  if (req.query.action) where.action = { contains: String(req.query.action) };

  const logs = await prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take });
  const actorIds = [...new Set(logs.map((l) => l.actorUserId).filter(Boolean))];
  const actors = actorIds.length
    ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, fullName: true } })
    : [];
  const nameById = Object.fromEntries(actors.map((a) => [a.id, a.fullName]));

  // Distinct action names for the filter dropdown.
  const actions = [...new Set(logs.map((l) => l.action))].sort();

  res.json({
    actions,
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      actor: l.actorUserId ? nameById[l.actorUserId] || 'A teammate' : 'System',
      entityType: l.entityType,
      createdAt: l.createdAt,
    })),
  });
}

module.exports = { list };
