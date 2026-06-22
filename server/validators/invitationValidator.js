const { z } = require('zod');

const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  role: z.enum(['admin', 'member']).default('member'),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(10, 'Invitation token is required'),
  fullName: z.string().trim().min(2, 'Your name is required').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

module.exports = { createInvitationSchema, acceptInvitationSchema };
