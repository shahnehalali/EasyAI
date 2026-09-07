const { z } = require('zod');

const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  legalForm: z.string().trim().max(80).nullish(),
  address: z.string().trim().max(300).nullish(),
  industry: z.string().trim().max(120).nullish(),
  country: z.string().trim().max(2).optional(),
  sizeBand: z.string().trim().max(40).nullish(),
  // AVV Section 16.2: whether RIT's non-EU support team (Anlage 3 Nr. 5) may
  // ever be given pseudonymised access for a support case. Default false.
  allowNonEuSupportAccess: z.boolean().optional(),
});

const updateFunctionsSchema = z.object({
  selectedFunctions: z.array(z.string().max(60)).max(100),
});

module.exports = { updateOrganizationSchema, updateFunctionsSchema };
