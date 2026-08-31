// Parses a light **bold** markdown marker into real <strong> elements.
// Used by long-form documentation copy where certain words genuinely need
// emphasis (a feature name, a hard number, a required action), without
// storing raw HTML in the bilingual content file. Same "safe to drop
// directly into JSX" contract as highlightTerms.jsx.
const PATTERN = /\*\*(.+?)\*\*/g;

export function renderBold(text) {
  if (!text) return text;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = PATTERN.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
