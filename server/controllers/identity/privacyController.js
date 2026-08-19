// Data-subject rights (GDPR Chapter III).
//
//   GET    /api/privacy/export        Art. 15 access + Art. 20 portability
//   DELETE /api/privacy/me            Art. 17 erasure of the requesting account
//   DELETE /api/privacy/organization  Art. 17 erasure of the whole tenant
//
// Both deletions are irreversible and require the account password, because a
// stolen session should not be able to destroy a tenant's compliance record.
const bcrypt = require('bcryptjs');
const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const { decryptField, decryptJson, shredOrgKey } = require('../../services/crypto/fieldCrypto');

async function verifyPassword(userId, password) {
  if (!password) throw new ErrorResponse('Your password is required to confirm this action', 422);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ErrorResponse('Password is incorrect', 401);
  }
  return user;
}

const countOwners = (organizationId) =>
  prisma.user.count({ where: { organizationId, role: 'owner' } });

// GET /api/privacy/export
// Everything held about the caller, in a structured, machine-readable form
// (Art. 20 requires exactly that). Org-encrypted free text is decrypted on the
// way out — it is the subject's own data.
async function exportMe(req, res) {
  const userId = req.user.id;
  const orgId = req.organizationId || null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, fullName: true, role: true,
      emailVerifiedAt: true, lastLoginAt: true, mfaEnabled: true,
      createdAt: true, updatedAt: true, organizationId: true,
    },
  });

  const organization = orgId
    ? await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, legalForm: true, industry: true, country: true, sizeBand: true, createdAt: true },
    })
    : null;

  const [notifications, comments, threads, posts, votes, reports, invitationsSent, assignedResponses, auditLog, documents] =
    await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        select: { id: true, type: true, title: true, body: true, link: true, readAt: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        select: { id: true, body: true, assessmentId: true, organizationId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.thread.findMany({
        where: { authorId: userId },
        select: { id: true, title: true, body: true, visibility: true, frameworkId: true, createdAt: true, deletedAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.threadPost.findMany({
        where: { authorId: userId },
        select: { id: true, threadId: true, body: true, createdAt: true, deletedAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.threadVote.findMany({
        where: { userId },
        select: { targetType: true, targetId: true, value: true, createdAt: true },
      }),
      prisma.threadReport.findMany({
        where: { reporterId: userId },
        select: { targetType: true, targetId: true, reason: true, createdAt: true },
      }),
      prisma.invitation.findMany({
        where: { invitedById: userId },
        select: { id: true, email: true, role: true, status: true, createdAt: true },
      }),
      prisma.checklistItemResponse.findMany({
        where: { assigneeId: userId },
        select: { id: true, assessmentId: true, status: true, responseText: true, updatedAt: true },
      }),
      prisma.auditLog.findMany({
        where: { actorUserId: userId },
        select: { action: true, entityType: true, entityId: true, ip: true, userAgent: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.document.findMany({
        where: { uploadedById: userId },
        select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
      }),
    ]);

  // Free-text fields are stored under the org key; decrypt for the subject.
  for (const c of comments) c.body = await decryptField(orgId, c.body);
  for (const r of assignedResponses) r.responseText = await decryptField(orgId, r.responseText);
  for (const n of notifications) n.body = await decryptField(orgId, n.body);

  // AI systems the user created — metadata plus their decrypted free text.
  const aiSystems = orgId
    ? await prisma.aiSystem.findMany({
      where: { organizationId: orgId, createdById: userId },
      select: { id: true, name: true, description: true, purpose: true, riskCategory: true, dataProfile: true, createdAt: true },
    })
    : [];
  for (const s of aiSystems) {
    s.description = await decryptField(orgId, s.description);
    s.purpose = await decryptField(orgId, s.purpose);
    s.dataProfile = await decryptJson(orgId, s.dataProfile);
  }

  await recordAudit({ req, action: 'privacy.export', entityType: 'User', entityId: userId });

  const payload = {
    exportedAt: new Date().toISOString(),
    subject: user,
    organization,
    aiSystems,
    assignedResponses,
    comments,
    community: { threads, posts, votes, reports },
    notifications,
    invitationsSent,
    documents,
    auditLog,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="my-data-${userId}.json"`);
  res.send(JSON.stringify(payload, null, 2));
}

// Strip the caller's id from rows that reference a user without a foreign key,
// so no identifier survives the delete. Audit rows keep the event but lose the
// actor: the accountability record stays intact and stops being personal data.
async function detachUserReferences(userId) {
  await Promise.all([
    prisma.auditLog.updateMany({ where: { actorUserId: userId }, data: { actorUserId: null } }),
    prisma.aiSystem.updateMany({ where: { createdById: userId }, data: { createdById: null } }),
    prisma.assessment.updateMany({ where: { createdById: userId }, data: { createdById: null } }),
    prisma.document.updateMany({ where: { uploadedById: userId }, data: { uploadedById: null } }),
    prisma.checklistItemResponse.updateMany({ where: { updatedById: userId }, data: { updatedById: null } }),
  ]);
}

// DELETE /api/privacy/me
async function deleteMe(req, res) {
  const user = await verifyPassword(req.user.id, req.body?.password);
  const orgId = user.organizationId;

  if (orgId) {
    const members = await prisma.user.count({ where: { organizationId: orgId } });
    // Sole member: the organisation has no reason to exist without them, so the
    // whole tenant goes (and its key is shredded). Otherwise a last owner must
    // hand over first, or the tenant would be left with nobody who can run it.
    if (members === 1) return deleteOrganizationFor(req, res, orgId, user.id);
    if (user.role === 'owner' && (await countOwners(orgId)) <= 1) {
      throw new ErrorResponse(
        'You are the last owner. Transfer ownership to another member first, or delete the whole organisation.',
        422,
      );
    }
  }

  await detachUserReferences(user.id);
  await prisma.user.delete({ where: { id: user.id } });
  // Audited without an actor id — the actor no longer exists.
  await recordAudit({ req: { organizationId: orgId }, action: 'privacy.account_deleted', entityType: 'User' });

  res.clearCookie(require('../../config').jwt.cookieName);
  res.json({ message: 'Your account and personal data have been deleted' });
}

// Shared by deleteMe (sole member) and deleteOrganization.
async function deleteOrganizationFor(req, res, orgId, actorId) {
  // Crypto-shred first: even if a backup taken before this moment is restored,
  // the org's encrypted content is unreadable without the wrapped data key.
  await shredOrgKey(orgId);
  await detachUserReferences(actorId);
  // Cascades to users, AI systems, assessments, documents, community content,
  // audit rows, notifications, reminders, invitations and snapshots.
  await prisma.organization.delete({ where: { id: orgId } });

  res.clearCookie(require('../../config').jwt.cookieName);
  res.json({ message: 'The organisation and all its data have been deleted' });
}

// DELETE /api/privacy/organization  (owner only)
async function deleteOrganization(req, res) {
  const user = await verifyPassword(req.user.id, req.body?.password);
  if (!req.organizationId) throw new ErrorResponse('No organization for this account', 404);
  if (user.role !== 'owner') throw new ErrorResponse('Only an owner can delete the organisation', 403);
  return deleteOrganizationFor(req, res, req.organizationId, user.id);
}

module.exports = { exportMe, deleteMe, deleteOrganization };
