const { prisma } = require('../../db/db');

const { addDays } = require('../../services/classification/classificationService');
const { getTrends } = require('../../services/trends/snapshotService');

// GET /api/dashboard/summary -> aggregated payload for the dashboard widgets.
async function summary(req, res) {
  const organizationId = req.organizationId;
  const now = new Date();
  const soon = addDays(now, 60);

  const [assessments, aiSystems, frameworks] = await Promise.all([
    prisma.assessment.findMany({
      where: { organizationId },
      include: { framework: { select: { key: true, name: true, shortName: true } } },
    }),
    prisma.aiSystem.findMany({ where: { organizationId } }),
    prisma.framework.findMany({ where: { status: 'published' }, select: { id: true } }),
  ]);

  // Overall compliance standing = average progress across all assessments.
  const overall = assessments.length
    ? Math.round(assessments.reduce((s, a) => s + a.progressPct, 0) / assessments.length)
    : 0;

  // Risk distribution of AI systems.
  const riskOverview = { prohibited: 0, high: 0, limited: 0, minimal: 0, unclassified: 0 };
  for (const s of aiSystems) {
    const key = s.riskCategory || 'unclassified';
    riskOverview[key] = (riskOverview[key] || 0) + 1;
  }

  // Upcoming + overdue reviews.
  const upcoming = assessments
    .filter((a) => a.nextReviewDueAt && a.nextReviewDueAt <= soon)
    .sort((a, b) => new Date(a.nextReviewDueAt) - new Date(b.nextReviewDueAt))
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      title: a.title,
      nextReviewDueAt: a.nextReviewDueAt,
      overdue: a.nextReviewDueAt < now,
      status: a.status,
    }));

  // Per-framework progress.
  const byFramework = {};
  for (const a of assessments) {
    const k = a.framework.key;
    if (!byFramework[k]) {
      byFramework[k] = { key: k, name: a.framework.shortName || a.framework.name, total: 0, sum: 0 };
    }
    byFramework[k].total += 1;
    byFramework[k].sum += a.progressPct;
  }
  const activeFrameworks = Object.values(byFramework).map((f) => ({
    key: f.key,
    name: f.name,
    assessments: f.total,
    progressPct: Math.round(f.sum / f.total),
  }));

  // Open items by severity (from responses that are not done / not applicable).
  const openResponses = await prisma.checklistItemResponse.findMany({
    where: {
      assessment: { organizationId },
      status: { in: ['not_started', 'in_progress'] },
    },
    include: { templateItem: { include: { requirement: { select: { severity: true } } } } },
  });
  const openItems = { mandatory: 0, recommended: 0, informational: 0 };
  for (const r of openResponses) {
    const sev = r.templateItem.requirement?.severity || 'recommended';
    openItems[sev] = (openItems[sev] || 0) + 1;
  }

  // Recent activity (audit log).
  const recentActivity = await prisma.auditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { id: true, action: true, entityType: true, createdAt: true, actorUserId: true },
  });

  res.json({
    overall,
    counts: {
      aiSystems: aiSystems.length,
      assessments: assessments.length,
      frameworks: frameworks.length,
      reviewsDue: upcoming.length,
      openItems: openResponses.length,
    },
    riskOverview,
    upcoming,
    activeFrameworks,
    openItems,
    recentActivity,
  });
}

// GET /api/dashboard/trends -> compliance score over time
async function trends(req, res) {
  const days = Math.min(parseInt(req.query.days || '90', 10), 365);
  const series = await getTrends(req.organizationId, days);
  res.json({ trends: series });
}

module.exports = { summary, trends };
