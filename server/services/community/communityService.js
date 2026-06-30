const { prisma } = require('../../db/db');

// ---- Visibility ---------------------------------------------------------
// Global threads are visible to everyone; org threads only to the author's org.
// Returns a Prisma `where` fragment for the threads a user may see.
function visibilityWhere(user, scope = 'all') {
  const orgClause = { visibility: 'org', organizationId: user.organizationId };
  const globalClause = { visibility: 'global' };
  if (scope === 'global') return globalClause;
  if (scope === 'org') return orgClause;
  return { OR: [globalClause, orgClause] };
}

function canSeeThread(thread, user) {
  if (thread.visibility === 'global') return true;
  return thread.organizationId === user.organizationId;
}

// Moderation: platform admins moderate everything; for org threads the org's
// owner/admin can moderate too. Authors can always remove their own content.
function canModerate(thread, user) {
  if (user.role === 'platform_admin') return true;
  if (thread.visibility === 'org'
    && thread.organizationId === user.organizationId
    && ['owner', 'admin'].includes(user.role)) return true;
  return false;
}

// ---- Scoring ------------------------------------------------------------
// Set a user's vote on a target and recompute the cached score. value 0 clears.
async function setVote({ userId, targetType, targetId, value }) {
  if (value === 0) {
    await prisma.threadVote.deleteMany({ where: { userId, targetType, targetId } });
  } else {
    await prisma.threadVote.upsert({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
      update: { value },
      create: { userId, targetType, targetId, value },
    });
  }
  const agg = await prisma.threadVote.aggregate({ where: { targetType, targetId }, _sum: { value: true } });
  const score = agg._sum.value || 0;
  if (targetType === 'thread') await prisma.thread.update({ where: { id: targetId }, data: { score } });
  else await prisma.threadPost.update({ where: { id: targetId }, data: { score } });
  return { score, myVote: value };
}

// Attach the current user's vote to a set of thread/post ids in one query.
async function myVotes(userId, targetType, ids) {
  if (!ids.length) return {};
  const votes = await prisma.threadVote.findMany({
    where: { userId, targetType, targetId: { in: ids } },
    select: { targetId: true, value: true },
  });
  return Object.fromEntries(votes.map((v) => [v.targetId, v.value]));
}

// ---- Serializers --------------------------------------------------------
// Author identity is always Name + Company (the chosen identity model).
function publicAuthor(u) {
  if (!u) return null;
  return { id: u.id, fullName: u.fullName, company: u.organization?.name || null };
}

function publicThread(t, { myVote = 0, canModerate: mod = false } = {}) {
  return {
    id: t.id,
    title: t.title,
    body: t.deletedAt ? null : t.body,
    deleted: !!t.deletedAt,
    visibility: t.visibility,
    status: t.status,
    pinned: t.pinned,
    score: t.score,
    replyCount: t.replyCount,
    frameworkKey: t.framework?.key || null,
    frameworkName: t.framework?.shortName || t.framework?.name || null,
    requirementCode: t.requirementCode || null,
    author: publicAuthor(t.author),
    myVote,
    canModerate: mod,
    lastActivityAt: t.lastActivityAt,
    createdAt: t.createdAt,
  };
}

function publicPost(p, { myVote = 0, canModerate: mod = false } = {}) {
  return {
    id: p.id,
    threadId: p.threadId,
    parentPostId: p.parentPostId,
    body: p.deletedAt ? null : p.body,
    deleted: !!p.deletedAt,
    score: p.score,
    author: publicAuthor(p.author),
    myVote,
    canModerate: mod,
    createdAt: p.createdAt,
  };
}

// Author include used across queries (name + company).
const authorInclude = { select: { id: true, fullName: true, organization: { select: { name: true } } } };

module.exports = {
  visibilityWhere,
  canSeeThread,
  canModerate,
  setVote,
  myVotes,
  publicAuthor,
  publicThread,
  publicPost,
  authorInclude,
};
