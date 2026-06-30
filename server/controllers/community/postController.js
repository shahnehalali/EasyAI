const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const {
  canSeeThread, canModerate, setVote, publicPost, authorInclude,
} = require('../../services/community/communityService');

// POST /api/community/threads/:id/posts  { body, parentPostId? }
async function create(req, res) {
  const thread = await prisma.thread.findUnique({ where: { id: req.params.id } });
  if (!thread || thread.deletedAt) throw new ErrorResponse('Discussion not found', 404);
  if (!canSeeThread(thread, req.user)) throw new ErrorResponse('Discussion not found', 404);
  if (thread.status === 'locked') throw new ErrorResponse('This discussion is locked', 403);

  const { body, parentPostId } = req.body;
  if (parentPostId) {
    const parent = await prisma.threadPost.findUnique({ where: { id: parentPostId } });
    if (!parent || parent.threadId !== thread.id) throw new ErrorResponse('Reply target not found', 404);
    // Keep nesting to one level: a reply to a reply attaches to the top reply.
    if (parent.parentPostId) req.body.parentPostId = parent.parentPostId;
  }

  const post = await prisma.threadPost.create({
    data: {
      threadId: thread.id,
      organizationId: req.organizationId,
      authorId: req.user.id,
      parentPostId: req.body.parentPostId || null,
      body,
    },
    include: { author: authorInclude },
  });
  await prisma.thread.update({
    where: { id: thread.id },
    data: { replyCount: { increment: 1 }, lastActivityAt: new Date() },
  });
  await recordAudit({ req, action: 'thread.replied', entityType: 'Thread', entityId: thread.id });
  res.status(201).json({ post: publicPost(post, { canModerate: true }) });
}

// POST /api/community/posts/:id/vote  { value }
async function vote(req, res) {
  const post = await prisma.threadPost.findUnique({ where: { id: req.params.id }, include: { thread: true } });
  if (!post || post.deletedAt) throw new ErrorResponse('Reply not found', 404);
  if (!canSeeThread(post.thread, req.user)) throw new ErrorResponse('Reply not found', 404);
  const result = await setVote({ userId: req.user.id, targetType: 'post', targetId: post.id, value: req.body.value });
  res.json(result);
}

// DELETE /api/community/posts/:id  (author or moderator) — soft delete.
async function remove(req, res) {
  const post = await prisma.threadPost.findUnique({ where: { id: req.params.id }, include: { thread: true } });
  if (!post || post.deletedAt) throw new ErrorResponse('Reply not found', 404);
  if (post.authorId !== req.user.id && !canModerate(post.thread, req.user)) {
    throw new ErrorResponse('You can only delete your own replies', 403);
  }
  await prisma.threadPost.update({ where: { id: post.id }, data: { deletedAt: new Date() } });
  await recordAudit({ req, action: 'thread.reply_deleted', entityType: 'Thread', entityId: post.threadId });
  res.json({ message: 'Reply deleted' });
}

// POST /api/community/report  { targetType, targetId, reason }
async function report(req, res) {
  const { targetType, targetId, reason } = req.body;
  const exists = targetType === 'thread'
    ? await prisma.thread.findUnique({ where: { id: targetId } })
    : await prisma.threadPost.findUnique({ where: { id: targetId } });
  if (!exists) throw new ErrorResponse('Content not found', 404);
  await prisma.threadReport.create({
    data: { reporterId: req.user.id, targetType, targetId, reason },
  });
  await recordAudit({ req, action: 'thread.reported', entityType: targetType === 'thread' ? 'Thread' : 'ThreadPost', entityId: targetId });
  res.status(201).json({ message: 'Thank you. A moderator will review this.' });
}

module.exports = { create, vote, remove, report };
