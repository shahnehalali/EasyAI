const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');

// GET /api/organizations/current
async function getCurrent(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
  res.json({ organization: org });
}

// PATCH /api/organizations/current
async function updateCurrent(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const org = await prisma.organization.update({
    where: { id: req.organizationId },
    data: req.body,
  });
  await recordAudit({ req, action: 'organization.update', entityType: 'Organization', entityId: org.id, after: req.body });
  res.json({ organization: org });
}

// PATCH /api/organizations/current/functions
// Saves the "what does your company do?" answers from the Law Explorer.
// Any member may set this (it drives their personalised applicability view).
async function updateFunctions(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const org = await prisma.organization.update({
    where: { id: req.organizationId },
    data: { selectedFunctions: req.body.selectedFunctions },
  });
  res.json({ organization: org });
}

// GET /api/organizations/current/members
async function listMembers(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const members = await prisma.user.findMany({
    where: { organizationId: req.organizationId },
    select: { id: true, fullName: true, email: true, role: true, emailVerifiedAt: true, lastLoginAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ members });
}

module.exports = { getCurrent, updateCurrent, updateFunctions, listMembers };
