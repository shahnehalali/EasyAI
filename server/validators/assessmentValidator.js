const { z } = require('zod');

const startChecklistSchema = z.object({
  checklistTemplateId: z.string().uuid(),
  aiSystemId: z.string().uuid().nullish(),
});

const startFrameworksSchema = z.object({
  frameworkKeys: z.array(z.string().max(60)).min(1).max(50),
});

module.exports = { startChecklistSchema, startFrameworksSchema };
