const { prisma } = require('../../db/db');
const { recordAudit } = require('../../utils/audit');
const { authorInclude, publicAuthor } = require('../../services/community/communityService');

// All endpoints below are guarded by requireRole('platform_admin').
// They let an administrator author a NEW area of law purely as data rows -
// the dashboard, Law Explorer, assessments and reminders pick it up generically.

// POST /api/admin/frameworks
async function createFramework(req, res) {
  const framework = await prisma.framework.create({ data: req.body });
  await recordAudit({ req, action: 'admin.framework.create', entityType: 'Framework', entityId: framework.id });
  res.status(201).json({ framework });
}

// POST /api/admin/frameworks/:key/requirements
async function createRequirement(req, res) {
  const framework = await prisma.framework.findUniqueOrThrow({ where: { key: req.params.key } });
  const requirement = await prisma.requirement.create({
    data: { ...req.body, frameworkId: framework.id },
  });
  res.status(201).json({ requirement });
}

// POST /api/admin/frameworks/:key/templates
async function createTemplate(req, res) {
  const framework = await prisma.framework.findUniqueOrThrow({ where: { key: req.params.key } });
  const { items = [], ...templateData } = req.body;
  const template = await prisma.checklistTemplate.create({
    data: {
      ...templateData,
      // Admin-authored checklists are manual (sector) by default, so they are
      // NOT auto-attached to every classified AI system across all tenants.
      autoActivate: req.body.autoActivate ?? false,
      frameworkId: framework.id,
      items: {
        create: items.map((it, idx) => ({
          title: it.title,
          guidanceText: it.guidanceText,
          inputType: it.inputType || 'longtext',
          isRequired: Boolean(it.isRequired),
          sortOrder: it.sortOrder ?? idx,
        })),
      },
    },
    include: { items: true },
  });
  await recordAudit({ req, action: 'admin.template.create', entityType: 'ChecklistTemplate', entityId: template.id });
  res.status(201).json({ template });
}

// GET /api/admin/overview  -> counts to confirm catalog state.
async function overview(req, res) {
  const [frameworks, requirements, templates, items] = await Promise.all([
    prisma.framework.count(),
    prisma.requirement.count(),
    prisma.checklistTemplate.count(),
    prisma.templateItem.count(),
  ]);
  res.json({ counts: { frameworks, requirements, templates, items } });
}

// GET /api/admin/reports  -> open community reports, grouped by the reported
// thread/post, each with a content preview, author, and every reason submitted.
async function listReports(req, res) {
  const rows = await prisma.threadReport.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { reporter: authorInclude },
  });

  // Group reports by their target so the same post reported 5 times is one row.
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.targetType}:${r.targetId}`;
    if (!groups.has(key)) groups.set(key, { targetType: r.targetType, targetId: r.targetId, reports: [] });
    groups.get(key).reports.push(r);
  }

  const reports = await Promise.all([...groups.values()].map(async (g) => {
    let content = null; let threadId = null; let deleted = false; let author = null;
    if (g.targetType === 'thread') {
      const th = await prisma.thread.findUnique({ where: { id: g.targetId }, include: { author: authorInclude } });
      if (th) { content = [th.title, th.body].filter(Boolean).join(' — '); threadId = th.id; deleted = !!th.deletedAt; author = publicAuthor(th.author); }
    } else {
      const p = await prisma.threadPost.findUnique({ where: { id: g.targetId }, include: { author: authorInclude } });
      if (p) { content = p.body; threadId = p.threadId; deleted = !!p.deletedAt; author = publicAuthor(p.author); }
    }
    return {
      targetType: g.targetType,
      targetId: g.targetId,
      threadId,
      exists: content !== null,
      deleted,
      content,
      author,
      count: g.reports.length,
      lastReportedAt: g.reports[0].createdAt,
      reports: g.reports.map((r) => ({ id: r.id, reason: r.reason, reporter: publicAuthor(r.reporter), createdAt: r.createdAt })),
    };
  }));

  // Most-reported first, then most recent.
  reports.sort((a, b) => b.count - a.count || new Date(b.lastReportedAt) - new Date(a.lastReportedAt));
  res.json({ reports });
}

// POST /api/admin/reports/resolve  { targetType, targetId, action }
// action 'remove' soft-deletes the content; 'dismiss' keeps it. Either way every
// open report for that target is marked resolved so it leaves the queue.
async function resolveReport(req, res) {
  const { targetType, targetId, action } = req.body;
  await prisma.threadReport.updateMany({
    where: { targetType, targetId, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
  if (action === 'remove') {
    const model = targetType === 'thread' ? prisma.thread : prisma.threadPost;
    await model.update({ where: { id: targetId }, data: { deletedAt: new Date() } }).catch(() => {});
  }
  await recordAudit({
    req,
    action: action === 'remove' ? 'admin.report.removed' : 'admin.report.dismissed',
    entityType: targetType === 'thread' ? 'Thread' : 'ThreadPost',
    entityId: targetId,
  });
  res.json({ message: 'Resolved' });
}

module.exports = { createFramework, createRequirement, createTemplate, overview, listReports, resolveReport };
