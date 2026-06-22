const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');

function publicUser(u) {
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, emailVerified: Boolean(u.emailVerifiedAt) };
}

// PATCH /api/users/me
async function updateMe(req, res) {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { fullName: req.body.fullName },
  });
  res.json({ user: publicUser(user) });
}

async function countOwners(organizationId) {
  return prisma.user.count({ where: { organizationId, role: 'owner' } });
}

// PATCH /api/users/:id/role  (owner/admin within the same org)
async function updateRole(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.organizationId !== req.organizationId) {
    throw new ErrorResponse('User not found in your organization', 404);
  }
  // Only an owner may change an owner's role; never demote the last owner.
  if (target.role === 'owner' && req.user.role !== 'owner') {
    throw new ErrorResponse('Only an owner can change an owner', 403);
  }
  if (target.role === 'owner' && req.body.role !== 'owner' && (await countOwners(req.organizationId)) <= 1) {
    throw new ErrorResponse('Your organisation must have at least one owner', 422);
  }

  const user = await prisma.user.update({ where: { id: target.id }, data: { role: req.body.role } });
  await recordAudit({ req, action: 'user.update_role', entityType: 'User', entityId: user.id, after: { role: req.body.role } });
  res.json({ user: publicUser(user) });
}

// DELETE /api/users/:id  (owner/admin) -> remove a member from the org
async function removeMember(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.organizationId !== req.organizationId) {
    throw new ErrorResponse('User not found in your organization', 404);
  }
  if (target.id === req.user.id) throw new ErrorResponse('You cannot remove yourself', 422);
  if (target.role === 'owner' && req.user.role !== 'owner') {
    throw new ErrorResponse('Only an owner can remove an owner', 403);
  }
  if (target.role === 'owner' && (await countOwners(req.organizationId)) <= 1) {
    throw new ErrorResponse('Your organisation must have at least one owner', 422);
  }

  await prisma.user.delete({ where: { id: target.id } });
  await recordAudit({ req, action: 'member.removed', entityType: 'User', entityId: target.id });
  res.json({ message: 'Member removed' });
}

module.exports = { updateMe, updateRole, removeMember };
