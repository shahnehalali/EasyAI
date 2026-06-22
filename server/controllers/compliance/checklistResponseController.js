const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recomputeProgress } = require('./assessmentController');
const { recordAudit } = require('../../utils/audit');

// PATCH /api/checklist-responses/:id  -> update status, text, and/or assignee.
async function update(req, res) {
  const response = await prisma.checklistItemResponse.findUnique({
    where: { id: req.params.id },
    include: { assessment: true, templateItem: true },
  });
  if (!response || response.assessment.organizationId !== req.organizationId) {
    throw new ErrorResponse('Checklist item not found', 404);
  }

  const nextStatus = req.body.status ?? response.status;
  const nextText = req.body.responseText !== undefined ? req.body.responseText : response.responseText;

  // A required item cannot be marked done without documentation text.
  if (
    response.templateItem.isRequired
    && nextStatus === 'done'
    && response.templateItem.inputType !== 'none'
    && (!nextText || !nextText.trim())
  ) {
    throw new ErrorResponse('This item requires documentation before it can be marked done', 422);
  }

  // If an assignee is provided, it must be a member of the same organisation.
  let assigneeId = response.assigneeId;
  if (req.body.assigneeId !== undefined) {
    if (req.body.assigneeId) {
      const member = await prisma.user.findFirst({
        where: { id: req.body.assigneeId, organizationId: req.organizationId },
      });
      if (!member) throw new ErrorResponse('Assignee must be a member of your organisation', 422);
      assigneeId = member.id;
    } else {
      assigneeId = null;
    }
  }

  const updated = await prisma.checklistItemResponse.update({
    where: { id: response.id },
    data: { status: nextStatus, responseText: nextText, assigneeId, updatedById: req.user.id },
    include: { assignee: { select: { id: true, fullName: true } } },
  });

  // Record activity against the assessment so it surfaces in the activity feed.
  await recordAudit({
    req, action: 'checklist_item.updated', entityType: 'Assessment', entityId: response.assessmentId,
    after: { item: response.templateItem.title, status: nextStatus },
  });

  const progress = await recomputeProgress(response.assessmentId);
  res.json({ response: updated, assessmentProgress: progress });
}

module.exports = { update };
