const { z } = require('zod');

const createSupportAccessGrantSchema = z.object({
  caseReference: z.string().trim().min(3, 'A case reference is required').max(200),
  durationHours: z.number().int().min(1).max(336).optional(), // AVV Anlage 2: default 72h, max 14 days
  requestedByStaff: z.string().trim().max(160).optional(),
});

module.exports = { createSupportAccessGrantSchema };
