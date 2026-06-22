// Minimal CSV builder with proper escaping (Excel-compatible).
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers, rows) {
  const head = headers.map(csvEscape).join(',');
  const body = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
  return `${head}\r\n${body}\r\n`;
}

module.exports = { csvEscape, toCsv };
