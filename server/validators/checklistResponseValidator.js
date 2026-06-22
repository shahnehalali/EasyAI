const { z } = require('zod');

const updateResponseSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'done', 'not_applicable']).optional(),
  responseText: z.string().max(20000).nullish(),
  assigneeId: z.string().uuid().nullish(),
}).refine((v) => v.status !== undefined || v.responseText !== undefined || v.assigneeId !== undefined, {
  message: 'Provide a status, response text, or assignee',
});

module.exports = { updateResponseSchema };
