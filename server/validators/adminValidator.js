const { z } = require('zod');

const createFrameworkSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores').max(60),
  name: z.string().trim().min(2).max(200),
  shortName: z.string().trim().max(60).nullish(),
  tier: z.number().int().min(1).max(3).optional(),
  jurisdiction: z.enum(['EU', 'DE']).optional(),
  category: z.string().trim().max(60).optional(),
  shortDescription: z.string().trim().max(2000).nullish(),
  regulator: z.string().trim().max(200).nullish(),
  reference: z.string().trim().max(200).nullish(),
  lawReferenceUrl: z.string().trim().url().nullish(),
  appliesTo: z.string().trim().max(2000).nullish(),
  keySections: z.string().trim().max(2000).nullish(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sortOrder: z.number().int().optional(),
});

const createRequirementSchema = z.object({
  code: z.string().trim().min(1).max(60),
  title: z.string().trim().min(2).max(300),
  guidanceText: z.string().trim().min(2).max(8000),
  lawReferenceUrl: z.string().trim().url().nullish(),
  lawReferenceLabel: z.string().trim().max(200).nullish(),
  severity: z.enum(['informational', 'recommended', 'mandatory']).optional(),
  sortOrder: z.number().int().optional(),
});

const templateItemSchema = z.object({
  title: z.string().trim().min(2).max(300),
  guidanceText: z.string().trim().max(8000).nullish(),
  inputType: z.enum(['text', 'longtext', 'boolean', 'none']).optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const createTemplateSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9_]+$/).max(60),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).nullish(),
  appliesToRiskCategory: z.enum(['prohibited', 'high', 'limited', 'minimal']).nullish(),
  autoActivate: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sortOrder: z.number().int().optional(),
  items: z.array(templateItemSchema).optional(),
});

module.exports = { createFrameworkSchema, createRequirementSchema, createTemplateSchema };
