/* One-off cleanup:
   1. Delete "orphan" frameworks that are not in the canonical seed (test pollution),
      together with any assessments that referenced them.
   2. De-duplicate assessments (same org + AI system + template). */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

(async () => {
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'content', 'frameworks.seed.json'), 'utf8'));
  const canonical = new Set(seed.map((f) => f.key));

  const all = await p.framework.findMany({ select: { id: true, key: true, name: true } });
  const orphans = all.filter((f) => !canonical.has(f.key));
  console.log(`Found ${orphans.length} orphan framework(s) to remove.`);

  for (const o of orphans) {
    const delAssess = await p.assessment.deleteMany({ where: { frameworkId: o.id } });
    await p.framework.delete({ where: { id: o.id } });
    console.log(`  removed framework "${o.key}" and ${delAssess.count} assessment(s)`);
  }

  // De-duplicate remaining assessments.
  const assessments = await p.assessment.findMany({
    select: { id: true, organizationId: true, aiSystemId: true, checklistTemplateId: true },
    orderBy: { createdAt: 'asc' },
  });
  const seen = new Set();
  const toDelete = [];
  for (const a of assessments) {
    const k = `${a.organizationId}|${a.aiSystemId}|${a.checklistTemplateId}`;
    if (seen.has(k)) toDelete.push(a.id); else seen.add(k);
  }
  if (toDelete.length) {
    const r = await p.assessment.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`Removed ${r.count} duplicate assessment(s).`);
  } else {
    console.log('No duplicate assessments found.');
  }

  await p.$disconnect();
})();
