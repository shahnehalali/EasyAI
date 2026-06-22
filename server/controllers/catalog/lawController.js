const path = require('path');
const fs = require('fs');
const { prisma } = require('../../db/db');
const logger = require('../../utils/logger');

const contentDir = path.join(__dirname, '..', '..', '..', 'content');

// Small JSON loader with caching (content is authored as data files).
const cache = {};
function loadJson(name, fallback) {
  if (cache[name]) return cache[name];
  try {
    cache[name] = JSON.parse(fs.readFileSync(path.join(contentDir, name), 'utf8'));
  } catch (err) {
    logger.warn(`law explorer: could not load ${name}`, err.message);
    cache[name] = fallback;
  }
  return cache[name];
}

const SELECT = {
  id: true, key: true, name: true, shortName: true, tier: true, jurisdiction: true,
  category: true, shortDescription: true, regulator: true, reference: true,
  lawReferenceUrl: true, appliesTo: true, keySections: true,
  whatYouMustDo: true, keyDates: true, penalties: true, sourceNote: true, lastReviewedAt: true, status: true,
  translations: true,
};

// Merge German labels (from applicability.de.json) into the functions/categories.
function localiseMatrix(matrix) {
  const de = loadJson('applicability.de.json', { categories: {}, functions: {} });
  const categories = (matrix.categories || []).map((c) => ({ ...c, labelDe: de.categories?.[c.key] }));
  const functions = (matrix.functions || []).map((f) => ({
    ...f,
    labelDe: de.functions?.[f.key]?.label,
    descriptionDe: de.functions?.[f.key]?.description,
  }));
  return { categories, functions, sectors: matrix.sectors || [] };
}

// GET /api/laws  -> the Law Explorer payload.
async function explorer(req, res) {
  const [published, drafts] = await Promise.all([
    prisma.framework.findMany({
      where: { status: 'published' },
      orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
      select: SELECT,
    }),
    prisma.framework.findMany({
      where: { status: 'draft' },
      orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
      select: SELECT,
    }),
  ]);

  // Which frameworks have a working (published) checklist?
  const withTemplates = await prisma.checklistTemplate.findMany({
    where: { status: 'published' },
    select: { frameworkId: true },
    distinct: ['frameworkId'],
  });
  const hasChecklist = new Set(withTemplates.map((t) => t.frameworkId));
  const frameworks = published.map((f) => ({ ...f, hasChecklist: hasChecklist.has(f.id) }));

  const matrix = localiseMatrix(loadJson('applicability.json', { categories: [], functions: [], sectors: [] }));
  const relations = loadJson('lawRelations.json', {});
  const timeline = loadJson('timeline.json', []);

  res.json({
    frameworks,
    watchlist: drafts,
    relations,
    timeline,
    categories: matrix.categories,
    functions: matrix.functions,
    sectors: matrix.sectors,
    tiers: [
      { tier: 1, label: 'EU law binding in Germany' },
      { tier: 2, label: 'German national laws (general)' },
      { tier: 3, label: 'Sector-specific laws' },
    ],
  });
}

// POST /api/laws/analyze  { text } -> suggested business-function keys.
// Uses the Claude API when ANTHROPIC_API_KEY is set; otherwise a keyword matcher.
async function analyze(req, res) {
  const text = String(req.body?.text || '').trim();
  if (!text) return res.json({ functions: [], source: 'none' });

  const matrix = loadJson('applicability.json', { functions: [] });
  const functions = matrix.functions || [];

  // Try Claude first (optional, only if a key is configured).
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const keys = await analyseWithClaude(text, functions);
      if (keys) return res.json({ functions: keys, source: 'ai' });
    } catch (err) {
      logger.warn('law analyze: Claude call failed, using keyword fallback', err.message);
    }
  }

  // Keyword fallback: match the text against each function's label, description and key.
  const lc = text.toLowerCase();
  const KEYWORDS = {
    personal_data: ['personal data', 'customer data', 'user data', 'gdpr', 'privacy'],
    automated_decisions: ['automated decision', 'decision', 'approve', 'reject', 'eligibility'],
    biometric_data: ['biometric', 'facial', 'face recognition', 'fingerprint', 'voice'],
    profiling_prediction: ['profil', 'predict', 'score', 'scoring', 'ranking', 'forecast'],
    tracking_cookies: ['cookie', 'tracking', 'tracker', 'pixel', 'ad-tech', 'advertis'],
    childrens_data: ['child', 'children', 'minor', 'kids', 'under 18'],
    cross_border: ['outside the eu', 'us cloud', 'transfer data', 'cross-border', 'overseas'],
    hr_recruitment: ['recruit', 'hiring', 'hr', 'cv', 'resume', 'applicant', 'candidate'],
    workplace_monitoring: ['monitor employee', 'employee monitoring', 'productivity', 'staff monitor', 'surveillance'],
    fifty_plus_staff: ['employees', 'staff', 'headcount', '50 ', '100 ', '200 '],
    training_data: ['training data', 'train', 'fine-tune', 'dataset', 'scrap'],
    foundation_models: ['foundation model', 'large language model', 'llm', 'general-purpose', 'gpai', 'base model'],
    generative_media: ['generate', 'generative', 'image', 'video', 'deepfake', 'synthetic', 'content creation'],
    customer_chatbot: ['chatbot', 'chat bot', 'assistant', 'conversational', 'virtual agent'],
    third_party_ai: ['third-party', 'saas', 'openai', 'api', 'vendor', 'off-the-shelf'],
    online_platform: ['platform', 'marketplace', 'social network', 'search engine'],
    content_moderation: ['moderation', 'moderate', 'filter content', 'remove content'],
    marketing: ['marketing', 'advertis', 'campaign', 'recommendation', 'targeting'],
    pricing_algorithms: ['pricing', 'price', 'dynamic pricing'],
    connected_products: ['iot', 'connected', 'sensor', 'device', 'smart'],
    software_products: ['software product', 'hardware', 'we sell', 'we build a product', 'app we sell'],
    machinery_robotics: ['robot', 'machinery', 'cobot', 'industrial', 'factory'],
    critical_infrastructure: ['energy', 'transport', 'water', 'infrastructure', 'utility', 'hospital'],
    identity_verification: ['kyc', 'identity', 'verification', 'onboarding', 'fraud'],
    financial_services: ['bank', 'financ', 'payment', 'crypto', 'invest', 'lending'],
    credit_scoring: ['credit', 'loan', 'creditworth', 'underwrit credit'],
    insurance: ['insur', 'underwrit', 'claims', 'policyholder'],
    medical_ai: ['medical', 'health', 'diagnos', 'patient', 'clinical', 'therap'],
    autonomous_vehicles: ['vehicle', 'self-driving', 'autonomous driving', 'car', 'driver'],
    public_sector: ['public sector', 'government', 'authority', 'municipal', 'govtech'],
  };
  const matched = functions
    .map((f) => f.key)
    .filter((k) => {
      const f = functions.find((x) => x.key === k);
      const hay = `${f.label} ${f.description} ${k}`.toLowerCase();
      const kws = KEYWORDS[k] || [];
      return kws.some((w) => lc.includes(w)) || lc.includes(hay);
    });

  res.json({ functions: matched, source: 'keywords' });
}

// Ask Claude which business functions apply, returning an array of function keys.
async function analyseWithClaude(text, functions) {
  const list = functions.map((f) => `- ${f.key}: ${f.label} (${f.description})`).join('\n');
  const prompt = `You map a company's description to a fixed list of business-function keys.\n`
    + `Here are the allowed keys:\n${list}\n\n`
    + `Company description:\n"""${text}"""\n\n`
    + `Return ONLY a JSON array of the keys that clearly apply, e.g. ["personal_data","hr_recruitment"]. No prose.`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!resp.ok) throw new Error(`Anthropic API ${resp.status}`);
  const data = await resp.json();
  const raw = data?.content?.[0]?.text || '[]';
  const match = raw.match(/\[[\s\S]*\]/);
  const keys = JSON.parse(match ? match[0] : '[]');
  const valid = new Set(functions.map((f) => f.key));
  return keys.filter((k) => valid.has(k));
}

module.exports = { explorer, analyze };
