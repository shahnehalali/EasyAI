const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const supportAccessService = require('../../services/support/supportAccessService');

// GET /api/organizations/current/support-access
async function list(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const grants = await prisma.supportAccessGrant.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      grantedBy: { select: { id: true, fullName: true } },
      revokedBy: { select: { id: true, fullName: true } },
    },
  });
  res.json({ grants });
}

// POST /api/organizations/current/support-access
async function create(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const { caseReference, durationHours, requestedByStaff } = req.body;
  const grant = await supportAccessService.createGrant({
    req,
    organizationId: req.organizationId,
    grantedByUserId: req.user.id,
    caseReference,
    durationHours,
    requestedByStaff,
  });
  res.status(201).json({ grant });
}

// POST /api/organizations/current/support-access/:id/revoke
async function revoke(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const grant = await supportAccessService.revokeGrant({
    req,
    organizationId: req.organizationId,
    grantId: req.params.id,
    revokedByUserId: req.user.id,
  });
  if (!grant) throw new ErrorResponse('Support access grant not found', 404);
  res.json({ grant });
}

module.exports = { list, create, revoke };
