const PDFDocument = require('pdfkit');

// Palette matched to the app (indigo accent, near-black ink).
const ACCENT = '#5b5bd6';
const INK = '#16181d';
const MUTED = '#5b6373';
const LINE = '#e6e7ec';

const STATUS_LABELS = {
  not_started: 'Not started', in_progress: 'In progress', done: 'Done',
  not_applicable: 'Not applicable', completed: 'Completed', needs_review: 'Needs review',
};
const RISK_LABELS = {
  prohibited: 'Prohibited', high: 'High risk', limited: 'Limited risk', minimal: 'Minimal risk',
};

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function header(doc, title, orgName) {
  const w = doc.page.width;
  doc.save();
  doc.rect(0, 0, w, 84).fill(ACCENT);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('AI COMPLIANCE', 50, 20, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff').text(title, 50, 36, { width: w - 100, lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor('#e7e8fb')
    .text(`${orgName || ''}   ·   Generated ${fmtDate(new Date())}`, 50, 62, { width: w - 100, lineBreak: false });
  doc.restore();
  doc.x = 50;
  doc.y = 104;
  drawFooter(doc); // ensure the first page has a footer too
}

function metaLine(doc, label, value) {
  const labelX = 50; const labelW = 105; const valX = 160;
  const valW = doc.page.width - 50 - valX; // keep a 50pt right margin
  const v = value || '-';
  const y = doc.y;
  // Measure both columns so the row advances past the taller one (no overlap on wrap).
  doc.font('Helvetica-Bold').fontSize(9);
  const labelH = doc.heightOfString(label.toUpperCase(), { width: labelW });
  doc.font('Helvetica').fontSize(10);
  const valH = doc.heightOfString(v, { width: valW });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text(label.toUpperCase(), labelX, y, { width: labelW });
  doc.font('Helvetica').fontSize(10).fillColor(INK).text(v, valX, y, { width: valW });
  doc.x = labelX;
  doc.y = y + Math.max(labelH, valH) + 6;
}

function sectionTitle(doc, text) {
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(text, 50);
  const y = doc.y + 2;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).lineWidth(1).strokeColor(ACCENT).stroke();
  doc.moveDown(0.6);
}

function rule(doc) {
  const y = doc.y + 2;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).lineWidth(0.5).strokeColor(LINE).stroke();
  doc.moveDown(0.4);
}

// Draw a disclaimer footer in the bottom margin of the current page.
// We zero the bottom margin and guard re-entrancy so writing here never
// triggers an automatic page break (which would recurse via 'pageAdded').
function drawFooter(doc) {
  if (doc._inFooter) return;
  doc._inFooter = true;
  const oldBottom = doc.page.margins.bottom;
  const savedX = doc.x;
  const savedY = doc.y;
  doc.page.margins.bottom = 0;
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
    .text('For orientation only - not legal advice. Verify against official sources.',
      50, doc.page.height - 30, { width: doc.page.width - 100, lineBreak: false });
  doc.x = savedX; doc.y = savedY;
  doc.page.margins.bottom = oldBottom;
  doc._inFooter = false;
}

function newDoc(res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.on('pageAdded', () => drawFooter(doc));
  doc.pipe(res);
  return doc;
}

function finalize(doc) {
  drawFooter(doc); // footer for the final (current) page
  doc.end();
}

// ---- Assessment report ----
function renderAssessmentPdf(res, assessment, orgName) {
  const doc = newDoc(res);

  header(doc, 'Compliance Assessment Report', orgName);

  doc.font('Helvetica-Bold').fontSize(15).fillColor(INK).text(assessment.title, 50);
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(assessment.framework?.name || '', 50);
  doc.moveDown(0.8);

  metaLine(doc, 'AI system', assessment.aiSystem?.name || 'Organisation-level');
  metaLine(doc, 'Risk level', assessment.aiSystem?.riskCategory ? RISK_LABELS[assessment.aiSystem.riskCategory] : 'Not applicable');
  metaLine(doc, 'Status', STATUS_LABELS[assessment.status] || assessment.status);
  metaLine(doc, 'Progress', `${assessment.progressPct}%`);
  metaLine(doc, 'Last reviewed', fmtDate(assessment.lastReviewedAt));
  metaLine(doc, 'Next review', fmtDate(assessment.nextReviewDueAt));

  sectionTitle(doc, 'Checklist items');

  const w = doc.page.width - 100; // content width within 50pt margins
  assessment.responses.forEach((r, idx) => {
    const item = r.templateItem;
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(`${idx + 1}. ${item.title}`, 50, doc.y, { width: w });
    const sev = item.requirement?.severity ? ` · ${item.requirement.severity}` : '';
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
      .text(`Status: ${STATUS_LABELS[r.status] || r.status}${sev} · Assignee: ${r.assignee?.fullName || 'Unassigned'}`, 50, doc.y, { width: w });
    if (item.guidanceText) {
      doc.moveDown(0.2);
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(MUTED).text(item.guidanceText, 50, doc.y, { width: w });
    }
    doc.moveDown(0.25);
    if (r.responseText && r.responseText.trim()) {
      doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(r.responseText, 50, doc.y, { width: w });
    } else {
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text('No documentation provided.', 50, doc.y, { width: w });
    }
    if (r.documents?.length) {
      doc.moveDown(0.15);
      doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
        .text(`Evidence: ${r.documents.map((d) => d.fileName).join(', ')}`, 50, doc.y, { width: w });
    }
    if (r.comments?.length) {
      doc.moveDown(0.15);
      doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(`Comments: ${r.comments.length}`, 50, doc.y, { width: w });
    }
    doc.moveDown(0.5);
    rule(doc);
    doc.moveDown(0.3);
  });

  finalize(doc);
}

// ---- Organisation report ----
function renderOrganizationPdf(res, org, data) {
  const doc = newDoc(res);

  header(doc, 'Organisation Compliance Report', org?.name);

  // Big overall score with a caption beside it. Positioned explicitly and the
  // cursor advanced past the large glyphs to avoid overlapping the rows below.
  const pct = `${data.overall}%`;
  const oy = doc.y;
  doc.font('Helvetica-Bold').fontSize(32).fillColor(ACCENT);
  const pctW = doc.widthOfString(pct);
  doc.text(pct, 50, oy, { lineBreak: false });
  doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('overall compliance standing', 50 + pctW + 12, oy + 13, { lineBreak: false });
  doc.x = 50; doc.y = oy + 44;

  metaLine(doc, 'AI systems', String(data.counts.aiSystems));
  metaLine(doc, 'Assessments', String(data.counts.assessments));
  metaLine(doc, 'Reviews due', String(data.counts.reviewsDue));
  metaLine(doc, 'Open items', String(data.counts.openItems));

  sectionTitle(doc, 'AI systems by risk');
  ['prohibited', 'high', 'limited', 'minimal', 'unclassified'].forEach((k) => {
    if (data.riskOverview[k]) {
      doc.font('Helvetica').fontSize(10).fillColor(INK)
        .text(`${RISK_LABELS[k] || 'Not classified'}: ${data.riskOverview[k]}`, 60);
    }
  });

  sectionTitle(doc, 'Frameworks');
  if (!data.activeFrameworks.length) {
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(MUTED).text('No active frameworks yet.', 60);
  } else {
    data.activeFrameworks.forEach((f) => {
      doc.font('Helvetica').fontSize(10).fillColor(INK).text(`${f.name}: ${f.progressPct}% (${f.assessments} assessment(s))`, 60);
    });
  }

  sectionTitle(doc, 'Assessments');
  if (!data.assessments.length) {
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(MUTED).text('No assessments yet.', 60);
  } else {
    data.assessments.forEach((a) => {
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(INK).text(a.title, 60, doc.y, { width: doc.page.width - 160, continued: false });
      doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
        .text(`${STATUS_LABELS[a.status] || a.status} · ${a.progressPct}% · next review ${fmtDate(a.nextReviewDueAt)}`, 60);
      doc.moveDown(0.2);
    });
  }

  finalize(doc);
}

module.exports = { renderAssessmentPdf, renderOrganizationPdf, STATUS_LABELS, RISK_LABELS, fmtDate };
