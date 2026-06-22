const { z } = require('zod');

// Treat empty form strings as "not provided" for optional enums.
const optionalEnum = (values) => z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.enum(values).optional(),
);

const createAiSystemSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(160),
  description: z.string().trim().max(2000).nullish(),
  purpose: z.string().trim().max(2000).nullish(),
  vendor: optionalEnum(['in_house', 'third_party']),
  lifecycleStage: optionalEnum(['planning', 'deployed', 'retired']),
});

const updateAiSystemSchema = createAiSystemSchema.partial();

const classifySchema = z.object({
  answers: z.record(z.any()),
});

module.exports = { createAiSystemSchema, updateAiSystemSchema, classifySchema };
