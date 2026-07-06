const { prisma } = require('../../db/db');
const logger = require('../../utils/logger');
const config = require('../../config');
const { localizeExplanation, localizeQuestionnaire } = require('./classificationL10n');

// ---- Boolean condition DSL ----
// A condition is one of:
//   { all: [cond, ...] }   -> every sub-condition true
//   { any: [cond, ...] }   -> at least one true
//   { not: cond }          -> negation
//   { q: "code", op: "eq|neq|in|gte|lte|truthy", value: ... }  -> leaf
function evaluate(condition, answers) {
  if (!condition || typeof condition !== 'object') return false;

  if (Array.isArray(condition.all)) return condition.all.every((c) => evaluate(c, answers));
  if (Array.isArray(condition.any)) return condition.any.some((c) => evaluate(c, answers));
  if (condition.not) return !evaluate(condition.not, answers);

  const { q, op = 'truthy', value } = condition;
  const actual = answers ? answers[q] : undefined;

  switch (op) {
    case 'eq': return actual === value;
    case 'neq': return actual !== value;
    case 'truthy': return Boolean(actual);
    case 'falsy': return !actual;
    case 'in': return Array.isArray(value) && value.includes(actual);
    case 'contains': return Array.isArray(actual) && actual.includes(value);
    case 'gte': return Number(actual) >= Number(value);
    case 'lte': return Number(actual) <= Number(value);
    default: return false;
  }
}

// Resolve a risk category from answers using the questionnaire's rules.
// Rules are evaluated by ascending priority; first match wins. Default: minimal.
async function classify(questionnaireKey, answers, lang = 'en') {
  const questionnaire = await prisma.classificationQuestionnaire.findUnique({
    where: { key: questionnaireKey },
    include: { rules: { orderBy: { priority: 'asc' } } },
  });
  if (!questionnaire) {
    return {
      riskCategory: 'minimal',
      explanation: localizeExplanation('minimal', lang, 'No questionnaire found; defaulted to minimal risk.', 'none'),
    };
  }

  for (const rule of questionnaire.rules) {
    if (evaluate(rule.conditions, answers)) {
      return {
        riskCategory: rule.resultRiskCategory,
        explanation: localizeExplanation(rule.resultRiskCategory, lang, rule.explanation),
      };
    }
  }
  return {
    riskCategory: 'minimal',
    explanation: localizeExplanation('minimal', lang, 'No higher-risk criteria matched, so this system is treated as minimal risk.'),
  };
}

// After classification, instantiate one Assessment per matching ChecklistTemplate
// plus a ChecklistItemResponse per TemplateItem, and an annual reminder each.
async function instantiateAssessments({ organizationId, aiSystem }) {
  const category = aiSystem.riskCategory;

  // Auto-activating published templates that apply to this category (or to all).
  // Sector checklists (autoActivate = false) are started manually instead.
  const templates = await prisma.checklistTemplate.findMany({
    where: {
      status: 'published',
      autoActivate: true,
      OR: [{ appliesToRiskCategory: category }, { appliesToRiskCategory: null }],
      framework: { status: 'published' },
    },
    include: { items: true, framework: true },
  });

  const created = [];
  for (const template of templates) {
    // Skip if an assessment already exists for this system + template.
    const exists = await prisma.assessment.findFirst({
      where: { aiSystemId: aiSystem.id, checklistTemplateId: template.id },
    });
    if (exists) continue;

    const nextReviewDueAt = addDays(new Date(), 365);
    const assessment = await prisma.assessment.create({
      data: {
        organizationId,
        aiSystemId: aiSystem.id,
        frameworkId: template.frameworkId,
        checklistTemplateId: template.id,
        templateVersion: template.version,
        title: `${template.framework.shortName || template.framework.name}: ${template.name} - ${aiSystem.name}`,
        status: 'not_started',
        nextReviewDueAt,
        createdById: aiSystem.createdById,
        responses: {
          create: template.items.map((item) => ({
            templateItemId: item.id,
            status: item.defaultStatus || 'not_started',
          })),
        },
      },
    });

    await prisma.reminderSchedule.create({
      data: {
        organizationId,
        assessmentId: assessment.id,
        cadence: 'annual',
        intervalDays: 365,
        leadTimeDays: config.reminders.leadDays,
        nextRunAt: addDays(nextReviewDueAt, -config.reminders.leadDays),
        active: true,
      },
    });

    created.push(assessment);
  }

  logger.info(`classification: created ${created.length} assessment(s) for AI system ${aiSystem.id}`);
  return created;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { evaluate, classify, instantiateAssessments, addDays, localizeQuestionnaire };
