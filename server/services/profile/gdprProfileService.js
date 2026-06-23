const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');
const { prisma } = require('../../db/db');
const config = require('../../config');

const contentDir = path.join(__dirname, '..', '..', '..', 'content');

let cached = null;
function loadProfile() {
  if (cached) return cached;
  try {
    cached = JSON.parse(fs.readFileSync(path.join(contentDir, 'gdprProfile.seed.json'), 'utf8'));
  } catch (err) {
    logger.warn('gdpr profile: could not load gdprProfile.seed.json', err.message);
    cached = { questions: [], obligations: [], gate: null };
  }
  return cached;
}

let cachedDe = null;
function loadDe() {
  if (cachedDe) return cachedDe;
  try {
    cachedDe = JSON.parse(fs.readFileSync(path.join(contentDir, 'gdprProfile.de.json'), 'utf8'));
  } catch (err) {
    logger.warn('gdpr profile: could not load gdprProfile.de.json', err.message);
    cachedDe = {};
  }
  return cachedDe;
}

// A condition term is either:
//  - a string key ("foo" = answer truthy, "!foo" = falsy), or
//  - an operator object, e.g. { eq: ["data_location","us"] }, { in: ["k",[...]] },
//    { includes: ["arr","v"] }, { some: ["arr"] }, { gte/lte/gt/lt: ["k", n] }.
function term(answers, t) {
  if (typeof t === 'string') {
    if (t.startsWith('!')) return !answers[t.slice(1)];
    return !!answers[t];
  }
  const [op, args] = Object.entries(t)[0];
  const a = answers[args[0]];
  const v = args[1];
  switch (op) {
    case 'eq': return a === v;
    case 'ne': return a !== v;
    case 'in': return Array.isArray(v) && v.includes(a);
    case 'includes': return Array.isArray(a) && a.includes(v);
    case 'includesAny': return Array.isArray(a) && Array.isArray(v) && v.some((x) => a.includes(x));
    case 'some': return Array.isArray(a) ? a.length > 0 : !!a;
    case 'gte': return Number(a) >= v;
    case 'lte': return Number(a) <= v;
    case 'gt': return Number(a) > v;
    case 'lt': return Number(a) < v;
    default: return false;
  }
}

// A condition is { all: [...] } and/or { any: [...] }. Missing => true.
function matches(answers, cond) {
  if (!cond) return true;
  const all = !cond.all || cond.all.every((t) => term(answers, t));
  const any = !cond.any || cond.any.some((t) => term(answers, t));
  return all && any;
}

// Localise the questions/sections for the given language ('en' | 'de').
function getQuestions(lang = 'en') {
  const p = loadProfile();
  const de = lang === 'de' ? loadDe() : null;

  const sections = (p.sections || []).map((s) => ({
    ...s,
    title: (de && de.sections && de.sections[s.key]) || s.title,
  }));

  const questions = (p.questions || []).map((q) => {
    const dq = de && de.questions && de.questions[q.code];
    if (!dq) return q;
    return {
      ...q,
      prompt: dq.prompt || q.prompt,
      helpText: dq.helpText || q.helpText,
      unit: dq.unit || q.unit,
      options: (q.options || []).map((o) => ({ ...o, label: (dq.options && dq.options[o.value]) || o.label })),
    };
  });

  return {
    key: p.key,
    name: (de && de.name) || p.name,
    description: (de && de.description) || p.description,
    sections,
    questions,
    penaltiesNote: (de && de.penaltiesNote) || p.penaltiesNote || null,
  };
}

// Evaluate answers -> applicable obligations with a status ('gap' or 'ok'),
// localised to the given language.
function evaluate(answers = {}, lang = 'en') {
  const p = loadProfile();
  const de = lang === 'de' ? loadDe() : null;

  // Gate: if the system processes no personal data, GDPR mostly does not apply.
  if (p.gate && !answers[p.gate]) {
    return {
      appliesGdpr: false,
      message: (de && de.gateMessage)
        || 'Based on your answers, this system does not process personal data, so most GDPR and DPA obligations do not apply. Re-run this profile if that changes.',
      obligations: [],
      summary: { total: 0, gaps: 0 },
    };
  }

  const obligations = (p.obligations || [])
    .filter((o) => matches(answers, o.when))
    .map((o) => {
      const d = de && de.obligations && de.obligations[o.id];
      return {
        id: o.id,
        title: (d && d.title) || o.title,
        law: o.law,
        lawUrl: o.lawUrl,
        lawExplanation: (d && d.lawExplanation) || o.lawExplanation,
        exemptionNote: (d && d.exemptionNote) || o.exemptionNote || null,
        severity: o.severity || 'mandatory',
        why: (d && d.why) || o.why,
        solution: (d && d.solution) || o.solution,
        status: matches(answers, o.gapWhen) && o.gapWhen ? 'gap' : 'ok',
      };
    });

  const gaps = obligations.filter((o) => o.status === 'gap').length;

  return {
    appliesGdpr: true,
    message: null,
    obligations,
    summary: { total: obligations.length, gaps },
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// A helpful starting note for each generated checklist item.
function prefill(o) {
  return `${o.status === 'gap' ? '[Action needed] ' : ''}Why this applies: ${o.why}\n\nRecommended: ${o.solution}`;
}

// Turn a saved data-profile into a working assessment: one checklist item per
// applicable obligation, on the seeded "GDPR & DPA action plan" template.
// Reuses an existing assessment for this system + template, adding any newly
// applicable obligations. Returns { assessment } or { assessment: null, message }.
async function instantiateProfileAssessment({ organizationId, aiSystem }) {
  const result = evaluate(aiSystem.dataProfile || {});
  if (!result.appliesGdpr) return { assessment: null, message: result.message };

  const framework = await prisma.framework.findUnique({ where: { key: 'gdpr' } });
  if (!framework) throw new Error('GDPR framework is not seeded');
  const template = await prisma.checklistTemplate.findUnique({
    where: { frameworkId_key: { frameworkId: framework.id, key: 'gdpr_dpa_action_plan' } },
    include: { items: true },
  });
  if (!template) throw new Error('GDPR & DPA action plan template is not seeded');

  const itemByObligation = {};
  for (const it of template.items) {
    const oid = it.metadata && it.metadata.obligationId;
    if (oid) itemByObligation[oid] = it;
  }
  const applicable = result.obligations.filter((o) => itemByObligation[o.id]);

  let assessment = await prisma.assessment.findFirst({
    where: { aiSystemId: aiSystem.id, checklistTemplateId: template.id },
  });

  if (!assessment) {
    const nextReviewDueAt = addDays(new Date(), 365);
    assessment = await prisma.assessment.create({
      data: {
        organizationId,
        aiSystemId: aiSystem.id,
        frameworkId: framework.id,
        checklistTemplateId: template.id,
        templateVersion: template.version,
        title: `GDPR & DPA action plan - ${aiSystem.name}`,
        status: 'not_started',
        nextReviewDueAt,
        createdById: aiSystem.createdById,
        responses: {
          create: applicable.map((o) => ({
            templateItemId: itemByObligation[o.id].id,
            status: 'not_started',
            responseText: prefill(o),
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
  } else {
    // Add any obligations that have become applicable since it was first created.
    const existing = await prisma.checklistItemResponse.findMany({
      where: { assessmentId: assessment.id }, select: { templateItemId: true },
    });
    const have = new Set(existing.map((r) => r.templateItemId));
    const toAdd = applicable.filter((o) => !have.has(itemByObligation[o.id].id));
    if (toAdd.length) {
      await prisma.checklistItemResponse.createMany({
        data: toAdd.map((o) => ({
          assessmentId: assessment.id,
          templateItemId: itemByObligation[o.id].id,
          status: 'not_started',
          responseText: prefill(o),
        })),
      });
    }
  }

  logger.info(`data profile: assessment ${assessment.id} has ${applicable.length} applicable item(s) for AI system ${aiSystem.id}`);
  return { assessment };
}

module.exports = { getQuestions, evaluate, instantiateProfileAssessment };
