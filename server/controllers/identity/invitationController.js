const bcrypt = require('bcryptjs');
const config = require('../../config');
const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const { signSession, createOpaqueToken, hashToken } = require('../../services/auth/tokenService');
const emailService = require('../../services/email/emailService');
const { permissionsFor } = require('../../utils/permissions');

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function publicUser(user) {
  return {
    id: user.id, email: user.email, fullName: user.fullName, role: user.role,
    organizationId: user.organizationId, emailVerified: Boolean(user.emailVerifiedAt),
    permissions: permissionsFor(user.role),
  };
}

function setSessionCookie(res, user) {
  res.cookie(config.jwt.cookieName, signSession(user), {
    httpOnly: true, secure: config.env === 'production', sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/invitations  (members.manage)
async function create(req, res) {
  const email = req.body.email.toLowerCase();
  const role = req.body.role;

  const existingMember = await prisma.user.findFirst({ where: { email, organizationId: req.organizationId } });
  if (existingMember) throw new ErrorResponse('That person is already a member of your organisation', 409);

  // Replace any prior pending invite for the same email in this org.
  await prisma.invitation.updateMany({
    where: { organizationId: req.organizationId, email, status: 'pending' },
    data: { status: 'revoked' },
  });

  const { raw, hash } = createOpaqueToken();
  const invitation = await prisma.invitation.create({
    data: {
      organizationId: req.organizationId,
      email,
      role,
      tokenHash: hash,
      invitedById: req.user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
  const url = `${config.clientUrl}/accept-invite?token=${raw}`;
  try {
    await emailService.sendInvitationEmail(email, url, org?.name || 'your organisation', req.user.fullName);
  } catch (err) {
    // Non-fatal: the inviter can still copy the link returned below.
  }
  await recordAudit({ req, action: 'member.invited', entityType: 'Invitation', entityId: invitation.id, after: { email, role } });

  // The inviter is allowed to know the link (useful when email is console-only in dev).
  res.status(201).json({ invitation: publicInvite(invitation), inviteUrl: url });
}

function publicInvite(i) {
  return { id: i.id, email: i.email, role: i.role, status: i.status, expiresAt: i.expiresAt, createdAt: i.createdAt };
}

// GET /api/invitations  (members.manage) -> pending invites for the org
async function list(req, res) {
  const invitations = await prisma.invitation.findMany({
    where: { organizationId: req.organizationId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ invitations: invitations.map(publicInvite) });
}

// DELETE /api/invitations/:id  (members.manage)
async function revoke(req, res) {
  const invite = await prisma.invitation.findUnique({ where: { id: req.params.id } });
  if (!invite || invite.organizationId !== req.organizationId) throw new ErrorResponse('Invitation not found', 404);
  await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'revoked' } });
  res.json({ message: 'Invitation revoked' });
}

// GET /api/invitations/lookup/:token  (public) -> context for the accept page
async function lookup(req, res) {
  const invite = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(req.params.token) },
    include: { organization: true },
  });
  if (!invite || invite.status !== 'pending' || invite.expiresAt < new Date()) {
    throw new ErrorResponse('This invitation is invalid or has expired', 400);
  }
  res.json({ invitation: { email: invite.email, role: invite.role, organizationName: invite.organization?.name } });
}

// POST /api/invitations/accept  (public)
async function accept(req, res) {
  const { token, fullName, password } = req.body;
  const invite = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invite || invite.status !== 'pending' || invite.expiresAt < new Date()) {
    throw new ErrorResponse('This invitation is invalid or has expired', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    throw new ErrorResponse('An account with this email already exists. Please sign in instead.', 409);
  }

  const user = await prisma.user.create({
    data: {
      email: invite.email,
      fullName,
      passwordHash: await bcrypt.hash(password, 12),
      role: invite.role,
      organizationId: invite.organizationId,
      emailVerifiedAt: new Date(), // they arrived via the invite email
    },
  });
  await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'accepted', acceptedAt: new Date() } });
  await recordAudit({
    req: { ...req, organizationId: invite.organizationId, user },
    action: 'member.joined', entityType: 'User', entityId: user.id,
  });

  setSessionCookie(res, user);
  res.status(201).json({ message: 'Welcome aboard', user: publicUser(user) });
}

module.exports = { create, list, revoke, lookup, accept };
