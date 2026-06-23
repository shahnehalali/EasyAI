/* Seeds the catalog (the law, as data) and a couple of demo accounts.
   Idempotent: safe to run repeatedly. Reads JSON from ../../content. */
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const contentDir = path.join(__dirname, '..', '..', 'content');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), 'utf8'));

// Date the catalog content was last reviewed (shown per framework).
const REVIEWED_AT = new Date('2026-06-10T00:00:00.000Z');

async function seedFrameworks() {
  const frameworks = readJson('frameworks.seed.json');
  for (const f of frameworks) {
    const sourceNote = f.sourceNote || [f.reference, f.lawReferenceUrl].filter(Boolean).join(' - ') || null;
    const common = {
      name: f.name, shortName: f.shortName, tier: f.tier, jurisdiction: f.jurisdiction,
      category: f.category, reference: f.reference, regulator: f.regulator,
      lawReferenceUrl: f.lawReferenceUrl, shortDescription: f.shortDescription,
      appliesTo: f.appliesTo, keySections: f.keySections, status: f.status || 'published',
      sourceNote, lastReviewedAt: REVIEWED_AT, sortOrder: f.sortOrder || 0,
    };
    await prisma.framework.upsert({
      where: { key: f.key },
      update: common,
      create: { key: f.key, ...common },
    });
  }
  console.log(`seeded ${frameworks.length} frameworks`);
}

// Overlay richer plain-language details (what to do, key dates, penalties) onto frameworks.
async function seedLawDetails() {
  const details = readJson('lawDetails.seed.json');
  let n = 0;
  for (const [key, d] of Object.entries(details)) {
    const fw = await prisma.framework.findUnique({ where: { key } });
    if (!fw) continue;
    await prisma.framework.update({
      where: { key },
      data: {
        whatYouMustDo: d.whatYouMustDo || undefined,
        keyDates: d.keyDates || undefined,
        penalties: d.penalties || undefined,
      },
    });
    n += 1;
  }
  console.log(`seeded richer law details for ${n} frameworks`);
}

// Overlay German translations onto frameworks (translations.de).
async function seedTranslations() {
  const de = readJson('lawContent.de.json');
  let n = 0;
  for (const [key, content] of Object.entries(de)) {
    const fw = await prisma.framework.findUnique({ where: { key } });
    if (!fw) continue;
    await prisma.framework.update({ where: { key }, data: { translations: { de: content } } });
    n += 1;
  }
  console.log(`seeded German translations for ${n} frameworks`);
}

async function seedCoreContent() {
  const core = readJson('coreContent.seed.json');
  for (const [frameworkKey, data] of Object.entries(core)) {
    const framework = await prisma.framework.findUnique({ where: { key: frameworkKey } });
    if (!framework) continue;

    // Requirements (unique by frameworkId + code).
    const reqByCode = {};
    for (const r of data.requirements || []) {
      const requirement = await prisma.requirement.upsert({
        where: { frameworkId_code: { frameworkId: framework.id, code: r.code } },
        update: {
          title: r.title, guidanceText: r.guidanceText, lawReferenceUrl: r.lawReferenceUrl,
          lawReferenceLabel: r.lawReferenceLabel, severity: r.severity, sortOrder: r.sortOrder || 0,
        },
        create: {
          frameworkId: framework.id, code: r.code, title: r.title, guidanceText: r.guidanceText,
          lawReferenceUrl: r.lawReferenceUrl, lawReferenceLabel: r.lawReferenceLabel,
          severity: r.severity, sortOrder: r.sortOrder || 0,
        },
      });
      reqByCode[r.code] = requirement.id;
    }

    // Templates (unique by frameworkId + key). Recreate items each run for idempotency.
    for (const t of data.templates || []) {
      const autoActivate = t.autoActivate !== undefined ? t.autoActivate : true;
      const template = await prisma.checklistTemplate.upsert({
        where: { frameworkId_key: { frameworkId: framework.id, key: t.key } },
        update: {
          name: t.name, description: t.description, appliesToRiskCategory: t.appliesToRiskCategory,
          autoActivate, status: t.status || 'published', sortOrder: t.sortOrder || 0,
        },
        create: {
          frameworkId: framework.id, key: t.key, name: t.name, description: t.description,
          appliesToRiskCategory: t.appliesToRiskCategory, autoActivate, status: t.status || 'published',
          sortOrder: t.sortOrder || 0,
        },
      });

      // Create items only when the template has none yet. We avoid deleting
      // items because tenant ChecklistItemResponse rows reference them (FK).
      const existingItems = await prisma.templateItem.count({ where: { checklistTemplateId: template.id } });
      if (existingItems === 0) {
        for (const it of t.items || []) {
          await prisma.templateItem.create({
            data: {
              checklistTemplateId: template.id,
              requirementId: it.requirementCode ? reqByCode[it.requirementCode] || null : null,
              title: it.title, guidanceText: it.guidanceText, inputType: it.inputType || 'longtext',
              isRequired: Boolean(it.isRequired), sortOrder: it.sortOrder || 0,
            },
          });
        }
      }
    }
    console.log(`seeded core content for ${frameworkKey}`);
  }
}

// A manually-started checklist whose items are the GDPR/DPA profile obligations.
// Lets a user turn their data-protection profile result into a working assessment.
async function seedGdprActionPlan() {
  const profile = readJson('gdprProfile.seed.json');
  const framework = await prisma.framework.findUnique({ where: { key: 'gdpr' } });
  if (!framework) return;

  const template = await prisma.checklistTemplate.upsert({
    where: { frameworkId_key: { frameworkId: framework.id, key: 'gdpr_dpa_action_plan' } },
    update: { name: 'GDPR & DPA action plan', description: 'Work through the obligations identified by your data-protection profile.', autoActivate: false, status: 'published', sortOrder: 50 },
    create: {
      frameworkId: framework.id, key: 'gdpr_dpa_action_plan', name: 'GDPR & DPA action plan',
      description: 'Work through the obligations identified by your data-protection profile.',
      autoActivate: false, status: 'published', sortOrder: 50,
    },
  });

  const existingItems = await prisma.templateItem.count({ where: { checklistTemplateId: template.id } });
  if (existingItems === 0) {
    let i = 0;
    for (const o of profile.obligations || []) {
      await prisma.templateItem.create({
        data: {
          checklistTemplateId: template.id,
          title: `${o.title} (${o.law})`,
          guidanceText: `${o.lawExplanation}\n\nWhat to do: ${o.solution}`,
          inputType: 'longtext',
          isRequired: (o.severity || 'mandatory') === 'mandatory',
          sortOrder: i,
          metadata: { obligationId: o.id },
        },
      });
      i += 1;
    }
  }
  console.log(`seeded GDPR & DPA action plan (${(profile.obligations || []).length} items)`);
}

async function seedClassification() {
  const q = readJson('classification.seed.json');
  const framework = await prisma.framework.findUnique({ where: { key: q.frameworkKey } });
  if (!framework) return;

  const questionnaire = await prisma.classificationQuestionnaire.upsert({
    where: { key: q.key },
    update: { name: q.name, description: q.description, frameworkId: framework.id },
    create: { key: q.key, name: q.name, description: q.description, frameworkId: framework.id },
  });

  for (const ques of q.questions) {
    await prisma.classificationQuestion.upsert({
      where: { questionnaireId_code: { questionnaireId: questionnaire.id, code: ques.code } },
      update: { prompt: ques.prompt, helpText: ques.helpText, category: ques.category, answerType: ques.answerType, sortOrder: ques.sortOrder },
      create: {
        questionnaireId: questionnaire.id, code: ques.code, prompt: ques.prompt,
        helpText: ques.helpText, category: ques.category, answerType: ques.answerType, sortOrder: ques.sortOrder,
      },
    });
  }

  // Recreate rules each run.
  await prisma.classificationRule.deleteMany({ where: { questionnaireId: questionnaire.id } });
  for (const rule of q.rules) {
    await prisma.classificationRule.create({
      data: {
        questionnaireId: questionnaire.id, priority: rule.priority,
        resultRiskCategory: rule.resultRiskCategory, conditions: rule.conditions, explanation: rule.explanation,
      },
    });
  }
  console.log(`seeded classification questionnaire "${q.key}" with ${q.questions.length} questions and ${q.rules.length} rules`);
}

async function seedDemoUsers() {
  // Never create the well-known demo/admin accounts in production unless
  // explicitly opted in (they have published passwords). Catalog seeding above
  // still runs so the app is usable; you create real accounts via sign-up.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO !== 'true') {
    console.log('skipping demo users (production)');
    return;
  }

  const adminHash = await bcrypt.hash('Admin12345!', 12);
  const demoHash = await bcrypt.hash('Demo12345!', 12);

  const adminOrg = await prisma.organization.upsert({
    where: { id: 'seed-admin-org' },
    update: {},
    create: { id: 'seed-admin-org', name: 'Platform Administration' },
  });
  await prisma.user.upsert({
    where: { email: 'admin@aicompliance.local' },
    update: { role: 'platform_admin', emailVerifiedAt: new Date() },
    create: {
      email: 'admin@aicompliance.local', fullName: 'Platform Admin', passwordHash: adminHash,
      role: 'platform_admin', organizationId: adminOrg.id, emailVerifiedAt: new Date(),
    },
  });

  const demoOrg = await prisma.organization.upsert({
    where: { id: 'seed-demo-org' },
    update: {},
    create: { id: 'seed-demo-org', name: 'Demo GmbH', industry: 'Technology', country: 'DE', sizeBand: '50-249' },
  });
  await prisma.user.upsert({
    where: { email: 'demo@aicompliance.local' },
    update: { emailVerifiedAt: new Date() },
    create: {
      email: 'demo@aicompliance.local', fullName: 'Demo Owner', passwordHash: demoHash,
      role: 'owner', organizationId: demoOrg.id, emailVerifiedAt: new Date(),
    },
  });

  console.log('seeded demo users: admin@aicompliance.local / Admin12345!  and  demo@aicompliance.local / Demo12345!');
}

// Backfill ~30 days of compliance snapshots for the demo org so the dashboard
// trend chart is meaningful immediately (a gentle climb, deterministic).
async function seedSnapshots() {
  const demo = await prisma.organization.findUnique({ where: { id: 'seed-demo-org' } });
  if (!demo) return;
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  for (let i = 30; i >= 0; i -= 1) {
    const d = new Date(today); d.setUTCDate(d.getUTCDate() - i);
    const t = (30 - i) / 30; // 0..1 over the window
    const overall = Math.round(22 + t * 53); // 22% -> 75%
    const openItems = Math.max(0, Math.round(18 - t * 12));
    await prisma.complianceSnapshot.upsert({
      where: { organizationId_capturedOn: { organizationId: demo.id, capturedOn: d } },
      update: { overall, openItems, assessments: 4 },
      create: { organizationId: demo.id, capturedOn: d, overall, openItems, assessments: 4 },
    });
  }
  console.log('seeded 31 days of trend snapshots for the demo org');
}

async function main() {
  await seedFrameworks();
  await seedLawDetails();
  await seedTranslations();
  await seedCoreContent();
  await seedGdprActionPlan();
  await seedClassification();
  await seedDemoUsers();
  await seedSnapshots();
  console.log('seed complete');
}

main()
  .catch((e) => { console.error('seed failed', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
