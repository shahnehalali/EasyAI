const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const classificationService = require('../../services/classification/classificationService');
const gdprProfileService = require('../../services/profile/gdprProfileService');
const reportService = require('../../services/reports/reportService');

const DEFAULT_QUESTIONNAIRE_KEY = 'eu_ai_act_risk';

// POST /api/ai-systems
async function create(req, res) {
  const system = await prisma.aiSystem.create({
    data: {
      organizationId: req.organizationId,
      name: req.body.name,
      description: req.body.description,
      purpose: req.body.purpose,
      vendor: req.body.vendor,
      lifecycleStage: req.body.lifecycleStage || 'planning',
      createdById: req.user.id,
    },
  });
  await recordAudit({ req, action: 'ai_system.create', entityType: 'AiSystem', entityId: system.id });
  res.status(201).json({ aiSystem: system });
}

// GET /api/ai-systems
async function list(req, res) {
  const systems = await prisma.aiSystem.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { assessments: true } } },
  });
  res.json({ aiSystems: systems });
}

async function findOwned(id, organizationId) {
  const system = await prisma.aiSystem.findUnique({ where: { id } });
  if (!system || system.organizationId !== organizationId) {
    throw new ErrorResponse('AI system not found', 404);
  }
  return system;
}

// GET /api/ai-systems/:id
async function getById(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const system = await prisma.aiSystem.findUnique({
    where: { id: req.params.id },
    include: {
      assessments: {
        include: { framework: true, template: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  res.json({ aiSystem: system });
}

// PATCH /api/ai-systems/:id
async function update(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const system = await prisma.aiSystem.update({ where: { id: req.params.id }, data: req.body });
  res.json({ aiSystem: system });
}

// DELETE /api/ai-systems/:id  -> also removes the system's assessments.
async function remove(req, res) {
  const system = await findOwned(req.params.id, req.organizationId);
  // Delete this system's assessments first (cascades responses, reminders, comments)
  // so they do not linger as orphaned organisation-level records.
  await prisma.assessment.deleteMany({ where: { aiSystemId: system.id } });
  await prisma.aiSystem.delete({ where: { id: system.id } });
  await recordAudit({ req, action: 'ai_system.delete', entityType: 'AiSystem', entityId: req.params.id, before: { name: system.name } });
  res.json({ message: 'AI system deleted' });
}

// GET /api/ai-systems/:id/questionnaire
async function getQuestionnaire(req, res) {
  await findOwned(req.params.id, req.organizationId);
  const questionnaire = await prisma.classificationQuestionnaire.findUnique({
    where: { key: DEFAULT_QUESTIONNAIRE_KEY },
    include: { questions: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!questionnaire) throw new ErrorResponse('Risk questionnaire is not configured', 404);
  res.json({ questionnaire });
}

// POST /api/ai-systems/:id/classify
async function classify(req, res) {
  const system = await findOwned(req.params.id, req.organizationId);
  const answers = req.body.answers || {};

  const { riskCategory, explanation } = await classificationService.classify(DEFAULT_QUESTIONNAIRE_KEY, answers);

  const updated = await prisma.aiSystem.update({
    where: { id: system.id },
    data: {
      riskCategory,
      classificationExplanation: explanation,
      classificationAnswers: answers,
      classificationQuestionnaireKey: DEFAULT_QUESTIONNAIRE_KEY,
      classifiedAt: new Date(),
    },
  });

  const assessments = await classificationService.instantiateAssessments({
    organizationId: req.organizationId,
    aiSystem: updated,
  });

  await recordAudit({
    req, action: 'ai_system.classified', entityType: 'AiSystem', entityId: system.id,
    after: { riskCategory, assessments: assessments.length },
  });

  res.json({
    aiSystem: updated,
    riskCategory,
    explanation,
    createdAssessments: assessments.length,
  });
}

// GET /api/ai-systems/:id/data-profile
// Returns the profile questions, any saved answers, and the evaluated result.
async function getDataProfile(req, res) {
  const lang = req.query.lang === 'de' ? 'de' : 'en';
  const system = await findOwned(req.params.id, req.organizationId);
  const { questions, sections, name, description, key, penaltiesNote } = gdprProfileService.getQuestions(lang);
  const answers = system.dataProfile || null;
  const result = answers ? gdprProfileService.evaluate(answers, lang) : null;
  res.json({ key, name, description, systemName: system.name, sections, questions, penaltiesNote, answers, result });
}

// POST /api/ai-systems/:id/data-profile/assessment
// Turns the saved profile result into a working GDPR/DPA assessment.
async function createProfileAssessment(req, res) {
  const system = await findOwned(req.params.id, req.organizationId);
  if (!system.dataProfile) throw new ErrorResponse('Complete the data protection profile first', 400);

  const { assessment, message } = await gdprProfileService.instantiateProfileAssessment({
    organizationId: req.organizationId, aiSystem: system,
  });
  if (!assessment) throw new ErrorResponse(message || 'No GDPR obligations apply, so there is nothing to assess.', 400);

  await recordAudit({
    req, action: 'ai_system.data_profile_assessment', entityType: 'Assessment', entityId: assessment.id,
    after: { aiSystemId: system.id },
  });
  res.status(201).json({ assessmentId: assessment.id });
}

// GET /api/ai-systems/:id/data-profile/pdf  -> downloadable applicability report
async function dataProfilePdf(req, res) {
  const lang = req.query.lang === 'de' ? 'de' : 'en';
  const system = await findOwned(req.params.id, req.organizationId);
  if (!system.dataProfile) throw new ErrorResponse('Complete the data protection profile first', 400);
  const result = gdprProfileService.evaluate(system.dataProfile, lang);
  const { penaltiesNote } = gdprProfileService.getQuestions(lang);
  const org = await prisma.organization.findUnique({ where: { id: req.organizationId } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="data-protection-profile-${system.id.slice(0, 8)}.pdf"`);
  reportService.renderDataProfilePdf(res, system, org?.name, result, penaltiesNote, lang);
}

// POST /api/ai-systems/:id/data-profile  { answers }
// Saves the profile answers and returns the evaluated GDPR/DPA obligations.
async function saveDataProfile(req, res) {
  const lang = req.query.lang === 'de' ? 'de' : 'en';
  const system = await findOwned(req.params.id, req.organizationId);
  const answers = req.body.answers || {};
  const result = gdprProfileService.evaluate(answers, lang);

  await prisma.aiSystem.update({ where: { id: system.id }, data: { dataProfile: answers } });
  await recordAudit({
    req, action: 'ai_system.data_profile', entityType: 'AiSystem', entityId: system.id,
    after: { applies: result.appliesGdpr, obligations: result.summary.total, gaps: result.summary.gaps },
  });

  res.json({ answers, result });
}

module.exports = {
  create, list, getById, update, remove, getQuestionnaire, classify,
  getDataProfile, saveDataProfile, dataProfilePdf, createProfileAssessment,
};
