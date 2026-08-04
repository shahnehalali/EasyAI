const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  organizationName: z.string().trim().min(2).max(160).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

const verifySchema = z.object({
  token: z.string().min(10, 'Verification token is required'),
});

const resetSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

// MFA: a code is a 6-digit TOTP or a backup code like "a1b2-c3d4".
const mfaCodeSchema = z.object({
  code: z.string().trim().min(4, 'Enter the code from your authenticator app').max(20),
});
const mfaDisableSchema = z.object({
  password: z.string().min(1, 'Your password is required'),
});
const mfaVerifySchema = z.object({
  mfaToken: z.string().min(10, 'Verification session is required'),
  code: z.string().trim().min(4, 'Enter your code').max(20),
});

module.exports = {
  registerSchema, loginSchema, emailOnlySchema, verifySchema, resetSchema,
  mfaCodeSchema, mfaDisableSchema, mfaVerifySchema,
};
