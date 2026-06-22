const path = require('path');
const fs = require('fs');
const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { uploadDir } = require('../../config/upload');
const { recordAudit } = require('../../utils/audit');

// POST /api/documents  (multipart: file + optional assessmentId / checklistItemResponseId / aiSystemId)
async function create(req, res) {
  if (!req.file) throw new ErrorResponse('A file is required', 422);

  const doc = await prisma.document.create({
    data: {
      organizationId: req.organizationId,
      assessmentId: req.body.assessmentId || null,
      checklistItemResponseId: req.body.checklistItemResponseId || null,
      aiSystemId: req.body.aiSystemId || null,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storageKey: req.file.filename,
      uploadedById: req.user.id,
    },
  });
  await recordAudit({ req, action: 'document.upload', entityType: 'Document', entityId: doc.id });
  res.status(201).json({ document: doc });
}

// GET /api/documents
async function list(req, res) {
  const documents = await prisma.document.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ documents });
}

async function findOwned(id, organizationId) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.organizationId !== organizationId) throw new ErrorResponse('Document not found', 404);
  return doc;
}

// GET /api/documents/:id/download
async function download(req, res) {
  const doc = await findOwned(req.params.id, req.organizationId);
  const filePath = path.join(uploadDir, doc.storageKey);
  if (!fs.existsSync(filePath)) throw new ErrorResponse('File is missing from storage', 404);
  res.download(filePath, doc.fileName);
}

// DELETE /api/documents/:id
async function remove(req, res) {
  const doc = await findOwned(req.params.id, req.organizationId);
  const filePath = path.join(uploadDir, doc.storageKey);
  fs.promises.unlink(filePath).catch(() => {});
  await prisma.document.delete({ where: { id: doc.id } });
  await recordAudit({ req, action: 'document.delete', entityType: 'Document', entityId: doc.id });
  res.json({ message: 'Document deleted' });
}

module.exports = { create, list, download, remove };
