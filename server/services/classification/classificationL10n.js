const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');

// German overlay for the classification questionnaire. The questions live in the
// database (English, seeded from content/classification.seed.json). We keep the
// German copy as a data file and overlay it by question code at request time, the
// same approach used for the GDPR data-protection profile.
const DE_PATH = path.join(__dirname, '../../../content/classification.de.json');

let cachedDe = null;
function loadDe() {
  if (cachedDe) return cachedDe;
  try {
    cachedDe = JSON.parse(fs.readFileSync(DE_PATH, 'utf-8'));
  } catch (err) {
    logger.error(`classificationL10n: could not load ${DE_PATH}: ${err.message}`);
    cachedDe = { questions: {}, explanations: {} };
  }
  return cachedDe;
}

// Return a copy of the questionnaire with name/description and every question's
// prompt/helpText translated. For lang 'en' (or anything unmapped) the original
// English is returned untouched.
function localizeQuestionnaire(questionnaire, lang) {
  if (lang !== 'de' || !questionnaire) return questionnaire;
  const de = loadDe();
  return {
    ...questionnaire,
    name: de.name || questionnaire.name,
    description: de.description || questionnaire.description,
    questions: (questionnaire.questions || []).map((q) => {
      const tr = de.questions && de.questions[q.code];
      if (!tr) return q;
      return {
        ...q,
        prompt: tr.prompt || q.prompt,
        helpText: tr.helpText || q.helpText,
      };
    }),
  };
}

// Translate a classification result explanation. `riskCategory` is the resolved
// category ('prohibited' | 'high' | 'limited' | 'minimal'); `key` optionally
// overrides the lookup (e.g. 'none' for a missing questionnaire).
function localizeExplanation(riskCategory, lang, fallback, key) {
  if (lang !== 'de') return fallback;
  const de = loadDe();
  const lookup = key || riskCategory;
  return (de.explanations && de.explanations[lookup]) || fallback;
}

module.exports = { localizeQuestionnaire, localizeExplanation };
