const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const { avvPdfPath } = require('../../services/avv/avvService');

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

// GET /api/organizations/current/avv
// The AVV (Art. 28 GDPR data processing agreement) accepted at registration.
// Any org member may view this, it is a record of the organisation's own
// agreement, not sensitive in the way member/billing data is.
async function getAvv(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const acceptance = await prisma.avvAcceptance.findFirst({
    where: { organizationId: req.organizationId, supersededAt: null },
    orderBy: { acceptedAt: 'desc' },
  });
  if (!acceptance) throw new ErrorResponse('No Data Processing Agreement acceptance found for this organization', 404);
  res.json({
    avv: {
      version: acceptance.version,
      acceptedAt: acceptance.acceptedAt,
      acceptedByName: acceptance.acceptedByName,
      acceptedByRole: acceptance.acceptedByRole,
    },
  });
}

// GET /api/organizations/current/avv/pdf
// Section 5.2: "Der Kunde kann die Vereinbarung ... jederzeit vollstaendig
// als PDF-Datei aus den Organisationseinstellungen der Plattform
// herunterladen." Always serves the version this organisation actually
// accepted, not necessarily the latest one published, so an older
// acceptance stays exactly reconstructable (Section 18a).
async function avvPdf(req, res) {
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  const acceptance = await prisma.avvAcceptance.findFirst({
    where: { organizationId: req.organizationId, supersededAt: null },
    orderBy: { acceptedAt: 'desc' },
  });
  if (!acceptance) throw new ErrorResponse('No Data Processing Agreement acceptance found for this organization', 404);
  const filePath = avvPdfPath(acceptance.version);
  if (!filePath) throw new ErrorResponse('The accepted Data Processing Agreement version is no longer available', 404);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="avv-compliance-check-v${acceptance.version}.pdf"`);
  res.sendFile(filePath);
}

module.exports = {
  getCurrent, updateCurrent, updateFunctions, listMembers, getAvv, avvPdf,
};
