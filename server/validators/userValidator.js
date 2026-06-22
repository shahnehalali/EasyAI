const { z } = require('zod');

const updateMeSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
});

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member']),
});

module.exports = { updateMeSchema, updateRoleSchema };
