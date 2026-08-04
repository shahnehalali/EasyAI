const bcrypt = require('bcryptjs');
const config = require('../../config');
const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const logger = require('../../utils/logger');
const { recordAudit } = require('../../utils/audit');
const { signSession, signMfaChallenge, createOpaqueToken, hashToken } = require('../../services/auth/tokenService');
const emailService = require('../../services/email/emailService');
const { permissionsFor } = require('../../utils/permissions');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    organizationId: user.organizationId,
    emailVerified: Boolean(user.emailVerifiedAt),
    mfaEnabled: Boolean(user.mfaEnabled),
    permissions: permissionsFor(user.role),
  };
}

function setSessionCookie(res, user) {
  const token = signSession(user);
  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function issueVerification(user) {
  const { raw, hash } = createOpaqueToken();
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      purpose: 'verify_email',
      expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });
  const url = `${config.clientUrl}/verify-email?token=${raw}`;
  try {
    await emailService.sendVerificationEmail(user, url);
  } catch (err) {
    logger.warn('verification email failed to send', err.message);
  }
  return url;
}

// POST /api/auth/register
async function register(req, res) {
  const { fullName, email, password, organizationName } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ErrorResponse('An account with that email already exists', 409);

  const passwordHash = await bcrypt.hash(password, 12);

  // First user owns a new organization (or one they named).
  const org = await prisma.organization.create({
    data: { name: organizationName?.trim() || `${fullName.split(' ')[0]}'s Organization` },
  });

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: 'owner',
      organizationId: org.id,
    },
  });

  await issueVerification(user);
  await recordAudit({ req, action: 'auth.register', entityType: 'User', entityId: user.id });

  res.status(201).json({
    message: 'Account created. Check your email to verify your address before logging in.',
    user: publicUser(user),
  });
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  const { token } = req.body;
  const tokenHash = hashToken(token);

  const record = await prisma.emailToken.findUnique({ where: { tokenHash } });
  if (!record || record.purpose !== 'verify_email' || record.consumedAt || record.expiresAt < new Date()) {
    throw new ErrorResponse('This verification link is invalid or has expired', 400);
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.emailToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

  await recordAudit({ req, action: 'auth.verify_email', entityType: 'User', entityId: user.id });
  setSessionCookie(res, user);
  res.json({ message: 'Email verified. You are now signed in.', user: publicUser(user) });
}

// POST /api/auth/resend-verification
async function resendVerification(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond the same way to avoid leaking which emails exist.
  if (user && !user.emailVerifiedAt) {
    await issueVerification(user);
  }
  res.json({ message: 'If that account exists and is unverified, a new verification email has been sent.' });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ErrorResponse('Invalid email or password', 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ErrorResponse('Invalid email or password', 401);

  if (!user.emailVerifiedAt) {
    throw new ErrorResponse('Please verify your email address before signing in', 403);
  }

  // MFA on: the password was correct, but withhold the session until a second
  // factor is verified. Hand back a short-lived challenge token instead.
  if (user.mfaEnabled) {
    await recordAudit({ req, action: 'auth.login.mfa_challenge', entityType: 'User', entityId: user.id });
    return res.json({ mfaRequired: true, mfaToken: signMfaChallenge(user) });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await recordAudit({ req, action: 'auth.login', entityType: 'User', entityId: user.id });

  setSessionCookie(res, user);
  return res.json({ message: 'Signed in', user: publicUser(user) });
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie(config.jwt.cookieName);
  res.json({ message: 'Signed out' });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const { raw, hash } = createOpaqueToken();
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        purpose: 'reset_password',
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    const url = `${config.clientUrl}/reset-password?token=${raw}`;
    await emailService.sendPasswordResetEmail(user, url);
  }
  res.json({ message: 'If that account exists, a password reset email has been sent.' });
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  const { token, password } = req.body;
  const tokenHash = hashToken(token);

  const record = await prisma.emailToken.findUnique({ where: { tokenHash } });
  if (!record || record.purpose !== 'reset_password' || record.consumedAt || record.expiresAt < new Date()) {
    throw new ErrorResponse('This reset link is invalid or has expired', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.emailToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

  await recordAudit({ req, action: 'auth.reset_password', entityType: 'User', entityId: record.userId });
  logger.info('password reset for user', record.userId);
  res.json({ message: 'Password updated. You can now sign in.' });
}

// POST /api/auth/dev/verification-token  (development/testing only)
// Issues a fresh verification token and returns the raw value + link, since the
// raw token is normally only emailed. Disabled when NODE_ENV is production.
async function devVerificationToken(req, res) {
  if (config.env === 'production') throw new ErrorResponse('Not available', 404);
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ErrorResponse('No such user', 404);
  const { raw, hash } = createOpaqueToken();
  await prisma.emailToken.create({
    data: { userId: user.id, tokenHash: hash, purpose: 'verify_email', expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
  });
  res.json({ token: raw, url: `${config.clientUrl}/verify-email?token=${raw}` });
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  devVerificationToken,
  // Shared with mfaController so it can complete a login.
  publicUser,
  setSessionCookie,
};
