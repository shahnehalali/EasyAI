const { z } = require('zod');

const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  legalForm: z.string().trim().max(80).nullish(),
  industry: z.string().trim().max(120).nullish(),
  country: z.string().trim().max(2).optional(),
  sizeBand: z.string().trim().max(40).nullish(),
});

const updateFunctionsSchema = z.object({
  selectedFunctions: z.array(z.string().max(60)).max(100),
});

module.exports = { updateOrganizationSchema, updateFunctionsSchema };
