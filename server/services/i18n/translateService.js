const logger = require('../../utils/logger');

// On-demand machine translation for user-generated content (community threads
// and replies). Catalog/UI strings are translated by hand elsewhere; this is
// only for free text people typed, which cannot be pre-translated.
//
// Uses the Claude API when ANTHROPIC_API_KEY is set (same pattern as the law
// analyzer). Without a key it is a no-op: callers fall back to the original
// text, so the feature degrades gracefully instead of breaking.

const LANG_NAMES = { de: 'German', en: 'English' };

function isEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Translate an array of strings into `targetLang` in a single API call.
// Returns an array of the same length/order, or null on any failure (so the
// caller keeps the originals). Empty/blank inputs are preserved as-is.
async function translateStrings(strings, targetLang) {
  if (!isEnabled()) return null;
  const langName = LANG_NAMES[targetLang];
  if (!langName || !Array.isArray(strings) || strings.length === 0) return null;

  // Only send non-empty items to the model; map results back by index.
  const items = strings.map((s, i) => ({ i, text: typeof s === 'string' ? s : '' }));
  const toSend = items.filter((it) => it.text.trim());
  if (toSend.length === 0) return strings.slice();

  const payload = toSend.map((it) => ({ id: it.i, text: it.text }));
  const prompt = `You are a professional translator for a legal-compliance discussion forum.\n`
    + `Translate the "text" of each item into ${langName}. This is peer discussion about EU/German`
    + ` AI and data-protection law, so keep legal terms accurate and keep any law references`
    + ` (e.g. "Art. 5", "GDPR", "AVV") intact. Preserve line breaks. Do not add commentary.\n\n`
    + `Return ONLY a JSON array of objects { "id": <number>, "text": "<translation>" }, one per input item, same ids.\n\n`
    + `Input:\n${JSON.stringify(payload)}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!resp.ok) throw new Error(`Anthropic API ${resp.status}`);
    const data = await resp.json();
    const raw = data?.content?.[0]?.text || '[]';
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : '[]');

    const byId = new Map(parsed.map((o) => [Number(o.id), typeof o.text === 'string' ? o.text : null]));
    // Start from the originals, overlay any translations we got back.
    const out = strings.slice();
    for (const it of toSend) {
      const tr = byId.get(it.i);
      if (tr) out[it.i] = tr;
    }
    return out;
  } catch (err) {
    logger.warn(`translate: Claude call failed (${err.message}); keeping original text`);
    return null;
  }
}

// Convenience: translate a single { field: text } map, returning a new map with
// the same keys translated, or null on failure.
async function translateFields(fields, targetLang) {
  const keys = Object.keys(fields);
  const result = await translateStrings(keys.map((k) => fields[k]), targetLang);
  if (!result) return null;
  const out = {};
  keys.forEach((k, i) => { out[k] = result[i]; });
  return out;
}

module.exports = { isEnabled, translateStrings, translateFields };
