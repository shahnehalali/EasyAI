const { prisma } = require('../../db/db');
const { addDays } = require('../classification/classificationService');

// Computes an organisation's compliance summary (shared by the dashboard report,
// the snapshot job and the monthly email).
async function computeOrgSummary(organizationId) {
  const now = new Date();
  const soon = addDays(now, 60);
  const [assessments, aiSystems] = await Promise.all([
    prisma.assessment.findMany({ where: { organizationId }, include: { framework: { select: { key: true, name: true, shortName: true } } }, orderBy: { updatedAt: 'desc' } }),
    prisma.aiSystem.findMany({ where: { organizationId } }),
  ]);

  const overall = assessments.length ? Math.round(assessments.reduce((s, a) => s + a.progressPct, 0) / assessments.length) : 0;

  const riskOverview = { prohibited: 0, high: 0, limited: 0, minimal: 0, unclassified: 0 };
  for (const s of aiSystems) { const k = s.riskCategory || 'unclassified'; riskOverview[k] = (riskOverview[k] || 0) + 1; }

  const byFw = {};
  for (const a of assessments) {
    const k = a.framework.key;
    if (!byFw[k]) byFw[k] = { name: a.framework.shortName || a.framework.name, total: 0, sum: 0 };
    byFw[k].total += 1; byFw[k].sum += a.progressPct;
  }
  const activeFrameworks = Object.values(byFw).map((f) => ({ name: f.name, assessments: f.total, progressPct: Math.round(f.sum / f.total) }));

  const openItems = await prisma.checklistItemResponse.count({ where: { assessment: { organizationId }, status: { in: ['not_started', 'in_progress'] } } });
  const reviewsDue = assessments.filter((a) => a.nextReviewDueAt && a.nextReviewDueAt <= soon).length;

  return {
    overall,
    counts: { aiSystems: aiSystems.length, assessments: assessments.length, reviewsDue, openItems },
    riskOverview,
    activeFrameworks,
    assessments: assessments.map((a) => ({ title: a.title, status: a.status, progressPct: a.progressPct, nextReviewDueAt: a.nextReviewDueAt })),
  };
}

module.exports = { computeOrgSummary };
