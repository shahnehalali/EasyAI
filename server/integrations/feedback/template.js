// CommonJS port of @rit-services/feedback-server email template.
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderFeedbackEmail({ payload, submitter, receivedAt }) {
  const metaRows = [];
  if (submitter) {
    metaRows.push(['From', `${escapeHtml(submitter.name)} &lt;${escapeHtml(submitter.email)}&gt;`]);
    metaRows.push(['User ID', escapeHtml(submitter.id)]);
  }
  if (payload.pageUrl) metaRows.push(['Page', `<a href="${escapeHtml(payload.pageUrl)}">${escapeHtml(payload.pageUrl)}</a>`]);
  if (payload.viewport) metaRows.push(['Viewport', `${payload.viewport.width}×${payload.viewport.height}`]);
  if (payload.userAgent) metaRows.push(['User-Agent', escapeHtml(payload.userAgent)]);
  metaRows.push(['Received', receivedAt.toISOString()]);
  if (payload.meta) {
    for (const [k, v] of Object.entries(payload.meta)) {
      metaRows.push([escapeHtml(k), escapeHtml(String(v))]);
    }
  }

  const metaTable = metaRows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:4px 0;font-size:13px;color:#0f172a">${v}</td></tr>`,
    )
    .join('');

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="margin:0 0 8px;font-size:20px">${escapeHtml(payload.title)}</h2>
  <p style="margin:0 0 18px;color:#475569;font-size:13px">New feedback submission with annotated screenshot attached.</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-bottom:18px">
    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Description</div>
    <div style="white-space:pre-wrap;line-height:1.55;font-size:14px">${escapeHtml(payload.description)}</div>
  </div>

  <table style="border-collapse:collapse;margin-bottom:8px">${metaTable}</table>

  <p style="margin:18px 0 0;color:#94a3b8;font-size:11px">
    Sent by the screenshot-feedback plugin.
  </p>
</div>
  `.trim();

  const textLines = [
    payload.title,
    '',
    payload.description,
    '',
    ...metaRows.map(([k, v]) => `${k}: ${v.replace(/<[^>]+>/g, '')}`),
  ];

  return { html, text: textLines.join('\n') };
}

module.exports = { renderFeedbackEmail };
