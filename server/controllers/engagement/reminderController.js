const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { processDueReminders } = require('../../services/reminders/reminderService');

// GET /api/reminders
async function list(req, res) {
  const reminders = await prisma.reminderSchedule.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { nextRunAt: 'asc' },
    include: { assessment: { select: { id: true, title: true, status: true, nextReviewDueAt: true } } },
  });
  res.json({ reminders });
}

async function findOwned(id, organizationId) {
  const reminder = await prisma.reminderSchedule.findUnique({ where: { id } });
  if (!reminder || reminder.organizationId !== organizationId) throw new ErrorResponse('Reminder not found', 404);
  return reminder;
}

// PATCH /api/reminders/:id
async function update(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const reminder = await prisma.reminderSchedule.update({ where: { id: req.params.id }, data: req.body });
  res.json({ reminder });
}

// POST /api/reminders/run-due  -> manual trigger (used by tests and admins).
// Accepts an optional ISO `now` to force due reminders.
async function runDue(req, res) {
  const now = req.body?.now ? new Date(req.body.now) : new Date();
  const fired = await processDueReminders(now);
  res.json({ fired });
}

module.exports = { list, update, runDue };
