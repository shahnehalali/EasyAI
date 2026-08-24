// Wraps known key terms in a coloured <mark> so they read at a glance
// instead of getting lost in a paragraph. Purely presentational: the source
// copy is untouched, this only affects rendering. Colour is meaningful, not
// decorative, each category reuses the app's own semantic chip colours:
//   crypto   green  (a concrete protective measure)
//   legal    navy   (an article citation, a fact to check against the law)
//   vendor   gold   (a named third party)
//   honesty  amber  (a plainly stated gap, "not yet")
//
// Matching is case-sensitive and on exact substrings, which is deliberate:
// every term here is a proper noun, a citation, or a number, never a common
// word, so there is no risk of highlighting an unrelated match.
const TERMS = [
  ['AES-256-GCM', 'crypto'], ['TLS', 'crypto'],
  ['Art. 5', 'legal'], ['Art. 15', 'legal'], ['Art. 17', 'legal'], ['Art. 20', 'legal'],
  ['Art. 28', 'legal'], ['Art. 32', 'legal'], ['Art. 33', 'legal'], ['Art. 34', 'legal'],
  ['Hetzner', 'vendor'], ['Strato', 'vendor'], ['Resend', 'vendor'],
  ['European Union', 'legal'], ['Europaeischen Union', 'legal'], ['EU-only', 'legal'], ['ausschliesslich EU', 'legal'],
  ['365 days', 'legal'], ['365 Tagen', 'legal'], ['90 days', 'legal'], ['90 Tagen', 'legal'],
  ['180 days', 'legal'], ['180 Tagen', 'legal'], ['30 days', 'legal'], ['30 Tage', 'legal'],
  ['7 days', 'legal'], ['7 Tagen', 'legal'],
  ['self-service', 'crypto'], ['Selbstbedienungsprinzip', 'crypto'], ['Selbstbedienung', 'crypto'],
  ['not yet', 'honesty'], ['Noch nicht', 'honesty'],
];

// Longest first, so "365 days" matches before a shorter overlapping term
// could split it up.
const SORTED = [...TERMS].sort((a, b) => b[0].length - a[0].length);
const ESCAPED = SORTED.map(([t]) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const PATTERN = new RegExp(`(${ESCAPED.join('|')})`, 'g');
const CATEGORY = new Map(SORTED);

// Returns an array of strings and <mark> elements, safe to drop directly into
// JSX (e.g. {highlightTerms(text)}).
export function highlightTerms(text) {
  if (!text) return text;
  const parts = text.split(PATTERN);
  return parts.map((part, i) => {
    const cat = CATEGORY.get(part);
    return cat
      ? <mark key={i} className={`mkt-term mkt-term-${cat}`}>{part}</mark>
      : part;
  });
}
