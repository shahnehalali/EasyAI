const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');

// GET /api/frameworks
async function list(req, res) {
  const frameworks = await prisma.framework.findMany({
    where: { status: 'published' },
    orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { requirements: true, templates: true } } },
  });
  res.json({ frameworks });
}

// GET /api/frameworks/:key
async function getByKey(req, res) {
  const framework = await prisma.framework.findUnique({
    where: { key: req.params.key },
    include: {
      requirements: { orderBy: { sortOrder: 'asc' } },
      templates: {
        where: { status: 'published' },
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  if (!framework) throw new ErrorResponse('Framework not found', 404);
  res.json({ framework });
}

// GET /api/frameworks/:key/requirements
async function getRequirements(req, res) {
  const framework = await prisma.framework.findUnique({ where: { key: req.params.key } });
  if (!framework) throw new ErrorResponse('Framework not found', 404);
  const requirements = await prisma.requirement.findMany({
    where: { frameworkId: framework.id },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ requirements });
}

// GET /api/frameworks/:key/templates
async function getTemplates(req, res) {
  const framework = await prisma.framework.findUnique({ where: { key: req.params.key } });
  if (!framework) throw new ErrorResponse('Framework not found', 404);
  const templates = await prisma.checklistTemplate.findMany({
    where: { frameworkId: framework.id, status: 'published' },
    orderBy: { sortOrder: 'asc' },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  res.json({ templates });
}

module.exports = { list, getByKey, getRequirements, getTemplates };
