const { z } = require('zod');

const updateReminderSchema = z.object({
  cadence: z.enum(['annual', 'semiannual', 'quarterly', 'custom']).optional(),
  intervalDays: z.number().int().min(1).max(3650).optional(),
  leadTimeDays: z.number().int().min(0).max(365).optional(),
  active: z.boolean().optional(),
});

const runDueSchema = z.object({
  now: z.string().datetime().optional(),
});

module.exports = { updateReminderSchema, runDueSchema };
