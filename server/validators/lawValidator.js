const { z } = require('zod');

const analyzeSchema = z.object({
  text: z.string().trim().min(1, 'Describe what your company does').max(4000),
});

module.exports = { analyzeSchema };
