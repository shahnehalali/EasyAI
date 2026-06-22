const { prisma } = require('../../db/db');
const { recordAudit } = require('../../utils/audit');

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

module.exports = { createFramework, createRequirement, createTemplate, overview };
