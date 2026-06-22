const { prisma } = require('../../db/db');
const config = require('../../config');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const { addDays } = require('../../services/classification/classificationService');

// Recompute progressPct + status from the assessment's responses.
async function recomputeProgress(assessmentId) {
  const responses = await prisma.checklistItemResponse.findMany({ where: { assessmentId } });
  const counted = responses.filter((r) => r.status !== 'not_applicable');
  const done = counted.filter((r) => r.status === 'done').length;
  const progressPct = counted.length ? Math.round((done / counted.length) * 100) : 0;

  let status;
  if (progressPct === 100) status = 'completed';
  else if (responses.some((r) => r.status === 'in_progress' || r.status === 'done')) status = 'in_progress';
  else status = 'not_started';

  // Do not override a needs_review flag set by the reminder job unless work resumed.
  const current = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (current?.status === 'needs_review' && status === 'not_started') status = 'needs_review';

  await prisma.assessment.update({ where: { id: assessmentId }, data: { progressPct, status } });
  return { progressPct, status };
}

async function findOwned(id, organizationId) {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment || assessment.organizationId !== organizationId) {
    throw new ErrorResponse('Assessment not found', 404);
  }
  return assessment;
}

// GET /api/assessments
async function list(req, res) {
  const assessments = await prisma.assessment.findMany({
    where: { organizationId: req.organizationId },
    orderBy: [{ aiSystemId: 'asc' }, { framework: { sortOrder: 'asc' } }, { updatedAt: 'desc' }],
    include: {
      framework: { select: { key: true, name: true, shortName: true, tier: true } },
      template: { select: { name: true } },
      aiSystem: { select: { id: true, name: true, riskCategory: true } },
      _count: { select: { responses: true } },
    },
  });
  res.json({ assessments });
}

// GET /api/assessments/:id
async function getById(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const assessment = await prisma.assessment.findUnique({
    where: { id: req.params.id },
    include: {
      framework: true,
      template: true,
      aiSystem: { select: { id: true, name: true, riskCategory: true } },
      responses: {
        orderBy: { templateItem: { sortOrder: 'asc' } },
        include: {
          templateItem: { include: { requirement: true } },
          documents: true,
          assignee: { select: { id: true, fullName: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, fullName: true } } },
          },
        },
      },
    },
  });
  res.json({ assessment });
}

// GET /api/assessments/:id/activity -> who changed what, when.
async function getActivity(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const logs = await prisma.auditLog.findMany({
    where: { organizationId: req.organizationId, entityType: 'Assessment', entityId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  // Resolve actor names in one query.
  const actorIds = [...new Set(logs.map((l) => l.actorUserId).filter(Boolean))];
  const actors = actorIds.length
    ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, fullName: true } })
    : [];
  const nameById = Object.fromEntries(actors.map((a) => [a.id, a.fullName]));

  res.json({
    activity: logs.map((l) => ({
      id: l.id,
      action: l.action,
      actor: l.actorUserId ? nameById[l.actorUserId] || 'A teammate' : 'System',
      detail: l.after || null,
      createdAt: l.createdAt,
    })),
  });
}

// POST /api/assessments/start  { checklistTemplateId, aiSystemId? }
// Manually start a checklist (used for sector frameworks that do not auto-attach).
async function start(req, res) {
  const { checklistTemplateId, aiSystemId } = req.body;

  const template = await prisma.checklistTemplate.findUnique({
    where: { id: checklistTemplateId },
    include: { items: true, framework: true },
  });
  if (!template || template.status !== 'published' || template.framework.status !== 'published') {
    throw new ErrorResponse('Checklist not found', 404);
  }

  // If tied to an AI system, it must belong to the organisation.
  if (aiSystemId) {
    const system = await prisma.aiSystem.findFirst({ where: { id: aiSystemId, organizationId: req.organizationId } });
    if (!system) throw new ErrorResponse('AI system not found', 404);
  }

  // Avoid duplicates: one assessment per org + template + (system or org-level).
  const existing = await prisma.assessment.findFirst({
    where: {
      organizationId: req.organizationId,
      checklistTemplateId: template.id,
      aiSystemId: aiSystemId || null,
    },
  });
  if (existing) return res.json({ assessment: existing, created: false });

  const nextReviewDueAt = addDays(new Date(), 365);
  const assessment = await prisma.assessment.create({
    data: {
      organizationId: req.organizationId,
      aiSystemId: aiSystemId || null,
      frameworkId: template.frameworkId,
      checklistTemplateId: template.id,
      templateVersion: template.version,
      title: `${template.framework.shortName || template.framework.name}: ${template.name}`,
      status: 'not_started',
      nextReviewDueAt,
      createdById: req.user.id,
      responses: { create: template.items.map((item) => ({ templateItemId: item.id, status: item.defaultStatus || 'not_started' })) },
    },
  });

  await prisma.reminderSchedule.create({
    data: {
      organizationId: req.organizationId,
      assessmentId: assessment.id,
      cadence: 'annual',
      intervalDays: 365,
      leadTimeDays: config.reminders.leadDays,
      nextRunAt: addDays(nextReviewDueAt, -config.reminders.leadDays),
      active: true,
    },
  });

  await recordAudit({ req, action: 'assessment.started', entityType: 'Assessment', entityId: assessment.id });
  res.status(201).json({ assessment, created: true });
}

// POST /api/assessments/start-frameworks  { frameworkKeys: [...] }
// Bulk-starts an organisation-level checklist for each given framework, using its
// general (appliesToRiskCategory = null) published templates. De-duplicated.
async function startFrameworks(req, res) {
  const keys = req.body.frameworkKeys || [];
  const templates = await prisma.checklistTemplate.findMany({
    where: {
      status: 'published',
      appliesToRiskCategory: null,
      framework: { key: { in: keys }, status: 'published' },
    },
    include: { items: true, framework: true },
  });

  let created = 0;
  for (const template of templates) {
    const exists = await prisma.assessment.findFirst({
      where: { organizationId: req.organizationId, checklistTemplateId: template.id, aiSystemId: null },
    });
    if (exists) continue;

    const nextReviewDueAt = addDays(new Date(), 365);
    const assessment = await prisma.assessment.create({
      data: {
        organizationId: req.organizationId,
        frameworkId: template.frameworkId,
        checklistTemplateId: template.id,
        templateVersion: template.version,
        title: `${template.framework.shortName || template.framework.name}: ${template.name}`,
        status: 'not_started',
        nextReviewDueAt,
        createdById: req.user.id,
        responses: { create: template.items.map((item) => ({ templateItemId: item.id, status: item.defaultStatus || 'not_started' })) },
      },
    });
    await prisma.reminderSchedule.create({
      data: {
        organizationId: req.organizationId,
        assessmentId: assessment.id,
        cadence: 'annual', intervalDays: 365, leadTimeDays: config.reminders.leadDays,
        nextRunAt: addDays(nextReviewDueAt, -config.reminders.leadDays), active: true,
      },
    });
    created += 1;
  }

  await recordAudit({ req, action: 'assessment.bulk_started', entityType: 'Assessment', after: { frameworks: keys.length, created } });
  res.status(201).json({ created });
}

// POST /api/assessments/:id/mark-reviewed
async function markReviewed(req, res) {
  const assessment = await findOwned(req.params.id, req.organizationId);
  const now = new Date();
  const nextReviewDueAt = addDays(now, 365);

  const updated = await prisma.assessment.update({
    where: { id: assessment.id },
    data: { lastReviewedAt: now, nextReviewDueAt, status: assessment.progressPct === 100 ? 'completed' : 'in_progress' },
  });

  // Advance the reminder schedule too.
  const reminder = await prisma.reminderSchedule.findUnique({ where: { assessmentId: assessment.id } });
  if (reminder) {
    await prisma.reminderSchedule.update({
      where: { id: reminder.id },
      data: { nextRunAt: addDays(nextReviewDueAt, -reminder.leadTimeDays) },
    });
  }

  await recordAudit({ req, action: 'assessment.mark_reviewed', entityType: 'Assessment', entityId: assessment.id });
  res.json({ assessment: updated });
}

module.exports = { list, getById, start, startFrameworks, markReviewed, getActivity, recomputeProgress, findOwned };
