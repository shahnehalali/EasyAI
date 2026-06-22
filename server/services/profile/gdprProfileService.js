const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');

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

function getQuestions() {
  const p = loadProfile();
  return {
    key: p.key, name: p.name, description: p.description,
    sections: p.sections || [], questions: p.questions, penaltiesNote: p.penaltiesNote || null,
  };
}

// Evaluate answers -> applicable obligations with a status ('gap' or 'ok').
function evaluate(answers = {}) {
  const p = loadProfile();

  // Gate: if the system processes no personal data, GDPR mostly does not apply.
  if (p.gate && !answers[p.gate]) {
    return {
      appliesGdpr: false,
      message:
        'Based on your answers, this system does not process personal data, so most GDPR and DPA obligations do not apply. Re-run this profile if that changes.',
      obligations: [],
      summary: { total: 0, gaps: 0 },
    };
  }

  const obligations = (p.obligations || [])
    .filter((o) => matches(answers, o.when))
    .map((o) => ({
      id: o.id,
      title: o.title,
      law: o.law,
      lawUrl: o.lawUrl,
      lawExplanation: o.lawExplanation,
      exemptionNote: o.exemptionNote || null,
      severity: o.severity || 'mandatory',
      why: o.why,
      solution: o.solution,
      status: matches(answers, o.gapWhen) && o.gapWhen ? 'gap' : 'ok',
    }));

  const gaps = obligations.filter((o) => o.status === 'gap').length;

  return {
    appliesGdpr: true,
    message: null,
    obligations,
    summary: { total: obligations.length, gaps },
  };
}

module.exports = { getQuestions, evaluate };
