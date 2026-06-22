const { z } = require('zod');

const createCommentSchema = z.object({
  assessmentId: z.string().uuid(),
  checklistItemResponseId: z.string().uuid().nullish(),
  body: z.string().trim().min(1, 'Comment cannot be empty').max(4000),
});

module.exports = { createCommentSchema };
