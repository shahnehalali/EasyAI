const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { toCsv } = require('../../utils/csv');
const reportService = require('../../services/reports/reportService');
const { computeOrgSummary } = require('../../services/reports/aggregateService');
const { sendMonthlyReports } = require('../../services/reports/reportScheduler');

function attach(res, type, filename) {
  res.setHeader('Content-Type', type);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
}

// GET /api/reports/assessments/:id/pdf
async function assessmentPdf(req, res) {
  const owned = await prisma.assessment.findUnique({ where: { id: req.params.id } });
  if (!owned || owned.organizationId !== req.organizationId) throw new ErrorResponse('Assessment not found', 404);

  const assessment = await prisma.assessment.findUnique({
    where: { id: req.params.id },
    include: {
      framework: true,
      aiSystem: { select: { name: true, riskCategory: true } },
      responses: {
        orderBy: { templateItem: { sortOrder: 'asc' } },
        include: { templateItem: { include: { requirement: true } }, documents: true, assignee: { select: { fullName: true } }, comments: true },
      },
    },
  });
  const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
  attach(res, 'application/pdf', `assessment-${assessment.id.slice(0, 8)}.pdf`);
  reportService.renderAssessmentPdf(res, assessment, org?.name);
}

// GET /api/reports/organization/pdf
async function organizationPdf(req, res) {
  const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
  const data = await computeOrgSummary(req.organizationId);
  attach(res, 'application/pdf', 'organisation-compliance-report.pdf');
  reportService.renderOrganizationPdf(res, org, data);
}

// GET /api/reports/organization/csv  -> one row per checklist item
async function organizationCsv(req, res) {
  const responses = await prisma.checklistItemResponse.findMany({
    where: { assessment: { organizationId: req.organizationId } },
    include: {
      assessment: { include: { framework: { select: { name: true } } } },
      templateItem: { include: { requirement: { select: { severity: true } } } },
      assignee: { select: { fullName: true } },
    },
    orderBy: { assessmentId: 'asc' },
  });
  const headers = ['Framework', 'Assessment', 'Item', 'Status', 'Severity', 'Assignee', 'Documented', 'Updated'];
  const rows = responses.map((r) => [
    r.assessment.framework?.name || '',
    r.assessment.title,
    r.templateItem.title,
    reportService.STATUS_LABELS[r.status] || r.status,
    r.templateItem.requirement?.severity || '',
    r.assignee?.fullName || '',
    r.responseText && r.responseText.trim() ? 'Yes' : 'No',
    reportService.fmtDate(r.updatedAt),
  ]);
  attach(res, 'text/csv; charset=utf-8', 'organisation-compliance-export.csv');
  res.send(toCsv(headers, rows));
}

// GET /api/reports/audit/csv
async function auditCsv(req, res) {
  const logs = await prisma.auditLog.findMany({ where: { organizationId: req.organizationId }, orderBy: { createdAt: 'desc' }, take: 1000 });
  const actorIds = [...new Set(logs.map((l) => l.actorUserId).filter(Boolean))];
  const actors = actorIds.length ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, fullName: true } }) : [];
  const nameById = Object.fromEntries(actors.map((a) => [a.id, a.fullName]));
  const headers = ['Date', 'Actor', 'Action', 'Entity'];
  const rows = logs.map((l) => [
    reportService.fmtDate(l.createdAt),
    l.actorUserId ? nameById[l.actorUserId] || 'A teammate' : 'System',
    l.action,
    l.entityType || '',
  ]);
  attach(res, 'text/csv; charset=utf-8', 'audit-log.csv');
  res.send(toCsv(headers, rows));
}

// POST /api/reports/monthly/run -> send this organisation's monthly summary now
async function runMonthly(req, res) {
  const sent = await sendMonthlyReports(new Date(), req.organizationId);
  res.json({ sent });
}

module.exports = { assessmentPdf, organizationPdf, organizationCsv, auditCsv, runMonthly };
