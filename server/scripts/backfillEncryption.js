// One-off, idempotent backfill: encrypt any existing plaintext values in the
// fields that are now encrypted at rest. Safe to run repeatedly (rows already
// prefixed with "enc:1:" are skipped) and a no-op when DATA_ENC_KEY is unset.
const { prisma } = require('../db/db');
const config = require('../config');
const logger = require('../utils/logger');
const fc = require('../services/crypto/fieldCrypto');

const encd = (v) => typeof v === 'string' && fc.isEncrypted(v);

async function run() {
  if (!config.dataEncKey) {
    logger.info('backfill: DATA_ENC_KEY not set, nothing to do');
    return;
  }
  let systems = 0, responses = 0, comments = 0;

  for (const s of await prisma.aiSystem.findMany()) {
    const data = {};
    for (const f of ['description', 'purpose', 'classificationExplanation']) {
      if (s[f] && !encd(s[f])) data[f] = await fc.encryptField(s.organizationId, s[f]);
    }
    for (const jf of ['classificationAnswers', 'dataProfile']) {
      if (s[jf] !== null && s[jf] !== undefined && !encd(s[jf])) data[jf] = await fc.encryptJson(s.organizationId, s[jf]);
    }
    if (Object.keys(data).length) { await prisma.aiSystem.update({ where: { id: s.id }, data }); systems++; }
  }

  const rs = await prisma.checklistItemResponse.findMany({ include: { assessment: { select: { organizationId: true } } } });
  for (const r of rs) {
    if (r.responseText && !encd(r.responseText)) {
      await prisma.checklistItemResponse.update({ where: { id: r.id }, data: { responseText: await fc.encryptField(r.assessment.organizationId, r.responseText) } });
      responses++;
    }
  }

  for (const c of await prisma.comment.findMany()) {
    if (c.body && !encd(c.body)) {
      await prisma.comment.update({ where: { id: c.id }, data: { body: await fc.encryptField(c.organizationId, c.body) } });
      comments++;
    }
  }

  logger.info(`backfill: encrypted ${systems} AI system(s), ${responses} response(s), ${comments} comment(s)`);
}

// Allow running standalone (node scripts/backfillEncryption.js) or importing.
if (require.main === module) {
  run().then(() => process.exit(0)).catch((e) => { logger.error('backfill failed', e.message); process.exit(1); });
}

module.exports = { run };
