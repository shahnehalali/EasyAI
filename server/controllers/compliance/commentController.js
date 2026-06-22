const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');

function publicComment(c) {
  return {
    id: c.id,
    assessmentId: c.assessmentId,
    checklistItemResponseId: c.checklistItemResponseId,
    body: c.body,
    author: c.author ? { id: c.author.id, fullName: c.author.fullName } : null,
    createdAt: c.createdAt,
  };
}

// POST /api/comments  { assessmentId, checklistItemResponseId?, body }
async function create(req, res) {
  const { assessmentId, checklistItemResponseId, body } = req.body;

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment || assessment.organizationId !== req.organizationId) {
    throw new ErrorResponse('Assessment not found', 404);
  }
  if (checklistItemResponseId) {
    const item = await prisma.checklistItemResponse.findUnique({ where: { id: checklistItemResponseId } });
    if (!item || item.assessmentId !== assessmentId) throw new ErrorResponse('Checklist item not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      organizationId: req.organizationId,
      assessmentId,
      checklistItemResponseId: checklistItemResponseId || null,
      authorId: req.user.id,
      body,
    },
    include: { author: { select: { id: true, fullName: true } } },
  });

  await recordAudit({ req, action: 'comment.added', entityType: 'Assessment', entityId: assessmentId });
  res.status(201).json({ comment: publicComment(comment) });
}

// GET /api/comments?assessmentId=...
async function listByAssessment(req, res) {
  const assessmentId = req.query.assessmentId;
  if (!assessmentId) throw new ErrorResponse('assessmentId is required', 422);
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment || assessment.organizationId !== req.organizationId) {
    throw new ErrorResponse('Assessment not found', 404);
  }
  const comments = await prisma.comment.findMany({
    where: { assessmentId },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, fullName: true } } },
  });
  res.json({ comments: comments.map(publicComment) });
}

// DELETE /api/comments/:id  (author or an org manager)
async function remove(req, res) {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment || comment.organizationId !== req.organizationId) throw new ErrorResponse('Comment not found', 404);
  const canManage = ['owner', 'admin'].includes(req.user.role);
  if (comment.authorId !== req.user.id && !canManage) {
    throw new ErrorResponse('You can only delete your own comments', 403);
  }
  await prisma.comment.delete({ where: { id: comment.id } });
  res.json({ message: 'Comment deleted' });
}

module.exports = { create, listByAssessment, remove };
