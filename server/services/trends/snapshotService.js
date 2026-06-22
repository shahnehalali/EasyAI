const cron = require('node-cron');
const { prisma } = require('../../db/db');
const config = require('../../config');
const logger = require('../../utils/logger');
const { computeOrgSummary } = require('../reports/aggregateService');

// Normalise a date to UTC midnight (one snapshot represents one calendar day).
function dayStart(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Capture (upsert) today's snapshot for one organisation.
async function captureSnapshot(organizationId, date = new Date()) {
  const summary = await computeOrgSummary(organizationId);
  const capturedOn = dayStart(date);
  return prisma.complianceSnapshot.upsert({
    where: { organizationId_capturedOn: { organizationId, capturedOn } },
    update: { overall: summary.overall, assessments: summary.counts.assessments, openItems: summary.counts.openItems },
    create: { organizationId, capturedOn, overall: summary.overall, assessments: summary.counts.assessments, openItems: summary.counts.openItems },
  });
}

// Capture a snapshot for every organisation (daily job).
async function captureAllSnapshots(date = new Date()) {
  const orgs = await prisma.organization.findMany({ select: { id: true } });
  let n = 0;
  for (const o of orgs) { await captureSnapshot(o.id, date); n += 1; }
  logger.info(`snapshots: captured ${n} organisation snapshot(s)`);
  return n;
}

// Create today's snapshot only if one does not already exist (the daily cron
// keeps it current). This avoids clobbering an existing point on every read.
async function ensureTodaySnapshot(organizationId) {
  const capturedOn = dayStart(new Date());
  const existing = await prisma.complianceSnapshot.findUnique({
    where: { organizationId_capturedOn: { organizationId, capturedOn } },
  });
  if (existing) return existing;
  return captureSnapshot(organizationId, new Date());
}

// Return the trend series for an org. Ensures today's point exists so the
// chart always has at least the current value.
async function getTrends(organizationId, days = 90) {
  await ensureTodaySnapshot(organizationId);
  const since = dayStart(new Date());
  since.setUTCDate(since.getUTCDate() - days);
  const snaps = await prisma.complianceSnapshot.findMany({
    where: { organizationId, capturedOn: { gte: since } },
    orderBy: { capturedOn: 'asc' },
  });
  return snaps.map((s) => ({ date: s.capturedOn, overall: s.overall, openItems: s.openItems }));
}

let task = null;
function startSnapshotScheduler() {
  if (task) return task;
  if (!cron.validate(config.snapshots.cron)) {
    logger.warn('snapshots: invalid SNAPSHOT_CRON, scheduler not started', config.snapshots.cron);
    return null;
  }
  task = cron.schedule(config.snapshots.cron, async () => {
    try { await captureAllSnapshots(new Date()); } catch (err) { logger.error('snapshot tick failed', err.message); }
  });
  logger.info('snapshots: scheduler started with cron', config.snapshots.cron);
  return task;
}

module.exports = { captureSnapshot, captureAllSnapshots, ensureTodaySnapshot, getTrends, startSnapshotScheduler, dayStart };
