const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const {
  visibilityWhere, canSeeThread, canModerate, setVote, myVotes,
  publicThread, authorInclude, ensureThreadTitles, ensureThreadDetail,
} = require('../../services/community/communityService');

const SORTS = {
  new: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  top: [{ pinned: 'desc' }, { score: 'desc' }, { createdAt: 'desc' }],
  hot: [{ pinned: 'desc' }, { lastActivityAt: 'desc' }],
};

// GET /api/community/threads?frameworkKey=&scope=&sort=&q=
async function list(req, res) {
  const { frameworkKey, scope, sort, q } = req.query;
  const lang = req.query.lang === 'de' ? 'de' : 'en';
  // AND the visibility clause with an optional full-text-ish search so the two
  // OR groups do not collide.
  const and = [visibilityWhere(req.user, scope)];
  if (q) {
    and.push({ OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { body: { contains: q, mode: 'insensitive' } },
    ] });
  }
  const where = { deletedAt: null, AND: and };
  if (frameworkKey) {
    const fw = await prisma.framework.findUnique({ where: { key: frameworkKey }, select: { id: true } });
    where.frameworkId = fw ? fw.id : '__none__';
  }
  const threads = await prisma.thread.findMany({
    where,
    orderBy: SORTS[sort] || SORTS.hot,
    take: 100,
    include: { author: authorInclude, framework: { select: { key: true, name: true, shortName: true } } },
  });
  const votes = await myVotes(req.user.id, 'thread', threads.map((t) => t.id));
  await ensureThreadTitles(threads, lang);
  res.json({
    threads: threads.map((t) => publicThread(t, {
      myVote: votes[t.id] || 0,
      canModerate: canModerate(t, req.user),
    }, lang)),
  });
}

// GET /api/community/threads/:id  -> the thread plus its posts.
async function getById(req, res) {
  const lang = req.query.lang === 'de' ? 'de' : 'en';
  const thread = await prisma.thread.findUnique({
    where: { id: req.params.id },
    include: { author: authorInclude, framework: { select: { key: true, name: true, shortName: true } } },
  });
  if (!thread || (thread.deletedAt && !canModerate(thread, req.user))) throw new ErrorResponse('Discussion not found', 404);
  if (!canSeeThread(thread, req.user)) throw new ErrorResponse('Discussion not found', 404);

  const posts = await prisma.threadPost.findMany({
    where: { threadId: thread.id },
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    include: { author: authorInclude },
  });
  const tVote = await myVotes(req.user.id, 'thread', [thread.id]);
  const pVotes = await myVotes(req.user.id, 'post', posts.map((p) => p.id));
  const mod = canModerate(thread, req.user);
  const { publicPost } = require('../../services/community/communityService');

  await ensureThreadDetail(thread, posts, lang);
  res.json({
    thread: publicThread(thread, { myVote: tVote[thread.id] || 0, canModerate: mod }, lang),
    posts: posts.map((p) => publicPost(p, {
      myVote: pVotes[p.id] || 0,
      canModerate: mod || p.authorId === req.user.id,
    }, lang)),
  });
}

// POST /api/community/threads  { title, body, visibility, frameworkKey?, requirementCode? }
async function create(req, res) {
  const { title, body, visibility, frameworkKey, requirementCode } = req.body;
  let frameworkId = null;
  if (frameworkKey) {
    const fw = await prisma.framework.findUnique({ where: { key: frameworkKey }, select: { id: true } });
    if (!fw) throw new ErrorResponse('Framework not found', 404);
    frameworkId = fw.id;
  }
  const thread = await prisma.thread.create({
    data: {
      organizationId: req.organizationId,
      authorId: req.user.id,
      visibility,
      frameworkId,
      requirementCode: requirementCode || null,
      title,
      body,
    },
    include: { author: authorInclude, framework: { select: { key: true, name: true, shortName: true } } },
  });
  await recordAudit({ req, action: 'thread.created', entityType: 'Thread', entityId: thread.id });
  res.status(201).json({ thread: publicThread(thread, { canModerate: canModerate(thread, req.user) }) });
}

// POST /api/community/threads/:id/vote  { value }
async function vote(req, res) {
  const thread = await prisma.thread.findUnique({ where: { id: req.params.id } });
  if (!thread || thread.deletedAt) throw new ErrorResponse('Discussion not found', 404);
  if (!canSeeThread(thread, req.user)) throw new ErrorResponse('Discussion not found', 404);
  const result = await setVote({ userId: req.user.id, targetType: 'thread', targetId: thread.id, value: req.body.value });
  res.json(result);
}

// POST /api/community/threads/:id/lock  (moderators) — toggles open/locked.
async function lock(req, res) {
  const thread = await prisma.thread.findUnique({ where: { id: req.params.id } });
  if (!thread) throw new ErrorResponse('Discussion not found', 404);
  if (!canModerate(thread, req.user)) throw new ErrorResponse('Only a moderator can lock this discussion', 403);
  const updated = await prisma.thread.update({
    where: { id: thread.id },
    data: { status: thread.status === 'locked' ? 'open' : 'locked' },
  });
  await recordAudit({ req, action: `thread.${updated.status}`, entityType: 'Thread', entityId: thread.id });
  res.json({ status: updated.status });
}

// DELETE /api/community/threads/:id  (author or moderator) — soft delete.
async function remove(req, res) {
  const thread = await prisma.thread.findUnique({ where: { id: req.params.id } });
  if (!thread || thread.deletedAt) throw new ErrorResponse('Discussion not found', 404);
  if (thread.authorId !== req.user.id && !canModerate(thread, req.user)) {
    throw new ErrorResponse('You can only delete your own discussions', 403);
  }
  await prisma.thread.update({ where: { id: thread.id }, data: { deletedAt: new Date() } });
  await recordAudit({ req, action: 'thread.deleted', entityType: 'Thread', entityId: thread.id });
  res.json({ message: 'Discussion deleted' });
}

module.exports = { list, getById, create, vote, lock, remove };
