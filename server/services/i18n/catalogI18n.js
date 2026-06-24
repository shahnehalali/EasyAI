// Server-side localization for catalog content (frameworks, requirements,
// checklist templates + items) and the assessments built from them.
//
// The English text lives in the database (seeded from content/*.seed.json).
// German is kept as overlay files and applied at request time when ?lang=de,
// so no schema migration or reseed is needed. This mirrors how the GDPR
// data-protection profile is localized.
//
//   - content/coreContent.de.json  : requirements, templates, items, keySections
//   - content/gdprProfile.de.json  : obligations behind the "GDPR & DPA action plan"
//   - Framework.translations.de    : framework-level fields (already in the DB)

const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');

const contentDir = path.join(__dirname, '..', '..', '..', 'content');

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
  } catch (err) {
    logger.warn(`catalog i18n: could not load ${file}: ${err.message}`);
    return fallback;
  }
}

let coreDe = null;
let profileDe = null;
function loadCoreDe() { if (!coreDe) coreDe = loadJson('coreContent.de.json', {}); return coreDe; }
function loadProfileDe() { if (!profileDe) profileDe = loadJson('gdprProfile.de.json', {}); return profileDe; }

// Prefix used in seeded action-plan guidance: "...\n\nWhat to do: <solution>".
const WHAT_TO_DO_DE = 'Was zu tun ist:';

// Pull the law label out of an English action-plan title, e.g.
// "Establish a lawful basis for processing (GDPR Art. 6)" -> "GDPR Art. 6".
function lawFromTitle(title) {
  const m = /\(([^)]+)\)\s*$/.exec(title || '');
  return m ? m[1] : null;
}

// Localize a Framework's framework-level fields from translations.de.
function applyFrameworkTranslations(framework) {
  const d = framework && framework.translations && framework.translations.de;
  if (!d) return;
  if (d.name) framework.name = d.name;
  if (d.shortDescription) framework.shortDescription = d.shortDescription;
  if (d.appliesTo) framework.appliesTo = d.appliesTo;
  if (d.whatYouMustDo) framework.whatYouMustDo = d.whatYouMustDo;
  if (d.keyDates) framework.keyDates = d.keyDates;
  if (d.penalties) framework.penalties = d.penalties;
  if (d.regulator) framework.regulator = d.regulator;
}

// Localize a single requirement in place using the framework's overlay block.
function localizeRequirement(req, fwBlock) {
  if (!req || !fwBlock) return;
  const tr = fwBlock.requirements && fwBlock.requirements[req.code];
  if (!tr) return;
  if (tr.title) req.title = tr.title;
  if (tr.guidanceText) req.guidanceText = tr.guidanceText;
}

// Localize a template item in place. Action-plan items (with metadata.obligationId)
// are rebuilt from the German obligation; ordinary items use the core overlay.
function localizeItem(item, tplBlock) {
  if (!item) return;
  const oid = item.metadata && item.metadata.obligationId;
  if (oid) {
    const obs = loadProfileDe().obligations || {};
    const d = obs[oid];
    if (d) {
      const law = lawFromTitle(item.title);
      if (d.title) item.title = law ? `${d.title} (${law})` : d.title;
      if (d.lawExplanation && d.solution) {
        item.guidanceText = `${d.lawExplanation}\n\n${WHAT_TO_DO_DE} ${d.solution}`;
      }
    }
    return;
  }
  const tr = tplBlock && tplBlock.items && tplBlock.items[String(item.sortOrder)];
  if (!tr) return;
  if (tr.title) item.title = tr.title;
  if (tr.guidanceText) item.guidanceText = tr.guidanceText;
}

// Localize a checklist template (name/description + its items) in place.
function localizeTemplate(tpl, fwBlock) {
  if (!tpl) return;
  const tplBlock = fwBlock && fwBlock.templates && fwBlock.templates[tpl.key];
  if (tplBlock) {
    if (tplBlock.name) tpl.name = tplBlock.name;
    if (tplBlock.description) tpl.description = tplBlock.description;
  }
  for (const item of tpl.items || []) localizeItem(item, tplBlock);
}

// GET /frameworks/:key  -> localize the whole framework tree.
function localizeFramework(framework, lang) {
  if (lang !== 'de' || !framework) return framework;
  const block = loadCoreDe()[framework.key] || {};
  applyFrameworkTranslations(framework);
  if (block.keySections) framework.keySections = block.keySections;
  for (const req of framework.requirements || []) localizeRequirement(req, block);
  for (const tpl of framework.templates || []) localizeTemplate(tpl, block);
  return framework;
}

// GET /frameworks/:key/requirements
function localizeRequirements(framework, requirements, lang) {
  if (lang !== 'de') return requirements;
  const block = loadCoreDe()[framework.key] || {};
  for (const req of requirements || []) localizeRequirement(req, block);
  return requirements;
}

// GET /frameworks/:key/templates
function localizeTemplates(framework, templates, lang) {
  if (lang !== 'de') return templates;
  const block = loadCoreDe()[framework.key] || {};
  for (const tpl of templates || []) localizeTemplate(tpl, block);
  return templates;
}

// GET /assessments/:id -> localize framework name, template name/description,
// and every response's checklist item + its requirement.
function localizeAssessment(assessment, lang) {
  if (lang !== 'de' || !assessment) return assessment;
  const fwKey = assessment.framework && assessment.framework.key;
  const block = (fwKey && loadCoreDe()[fwKey]) || {};

  applyFrameworkTranslations(assessment.framework);
  if (assessment.template) localizeTemplate(assessment.template, block);

  for (const r of assessment.responses || []) {
    if (r.templateItem) {
      const tplKey = assessment.template && assessment.template.key;
      const tplBlock = block.templates && block.templates[tplKey];
      localizeItem(r.templateItem, tplBlock);
      if (r.templateItem.requirement) localizeRequirement(r.templateItem.requirement, block);
    }
  }
  return assessment;
}

// GET /assessments (list) -> localize the framework + template names shown in rows.
function localizeAssessmentList(assessments, lang) {
  if (lang !== 'de') return assessments;
  const core = loadCoreDe();
  for (const a of assessments || []) {
    const fwKey = a.framework && a.framework.key;
    const block = (fwKey && core[fwKey]) || {};
    if (a.framework) applyFrameworkTranslations(a.framework);
    const tplKey = a.template && a.template.key;
    const tplBlock = tplKey && block.templates && block.templates[tplKey];
    if (tplBlock && a.template && tplBlock.name) a.template.name = tplBlock.name;
  }
  return assessments;
}

module.exports = {
  localizeFramework,
  localizeRequirements,
  localizeTemplates,
  localizeAssessment,
  localizeAssessmentList,
};
