/* Ad-hoc scenario check for the GDPR/DPA profiler evaluator. Run: node scripts/testGdprProfile.js */
const { evaluate } = require('../services/profile/gdprProfileService');

let failures = 0;
function run(name, answers, expect) {
  const r = evaluate(answers);
  const ids = r.obligations.map((o) => o.id);
  const gaps = r.obligations.filter((o) => o.status === 'gap').map((o) => o.id);

  console.log(`\n=== ${name} ===`);
  console.log(`appliesGdpr: ${r.appliesGdpr} | obligations: ${r.summary.total} | gaps: ${r.summary.gaps}`);
  console.log('obligations:', ids.join(', ') || '(none)');
  console.log('gaps:', gaps.join(', ') || '(none)');

  const check = (cond, msg) => { if (!cond) { failures += 1; console.log(`  ✗ FAIL: ${msg}`); } else { console.log(`  ✓ ${msg}`); } };
  (expect.has || []).forEach((id) => check(ids.includes(id), `has ${id}`));
  (expect.missing || []).forEach((id) => check(!ids.includes(id), `does NOT have ${id}`));
  (expect.gap || []).forEach((id) => check(gaps.includes(id), `${id} is a gap`));
  (expect.notGap || []).forEach((id) => check(ids.includes(id) && !gaps.includes(id), `${id} applies but is not a gap`));
  if (expect.appliesGdpr !== undefined) check(r.appliesGdpr === expect.appliesGdpr, `appliesGdpr === ${expect.appliesGdpr}`);
}

// A) US-hosted HR recruitment AI, large scale, automated screening, no DPA/retention/breach/DPO.
run('A: US HR recruitment AI (controller, high-risk, many gaps)', {
  processes_personal_data: true,
  subject_volume: 'over_100k',
  special_categories: [],
  pseudonymised: false,
  childrens_data: false,
  org_size: 'over_250',
  auto_processing_staff: 35,
  acts_as_processor: false,
  joint_controller: false,
  established_outside_eu: false,
  lawful_basis: 'legitimate_interests',
  direct_marketing: false,
  automated_decisions: true,
  uses_third_party_processor: true,
  has_dpa: false,
  sub_processors: true,
  data_location: 'us',
  vendor_remote_access: true,
  large_scale_monitoring: true,
  trains_on_personal_data: true,
  retention_status: 'none',
  has_breach_process: false,
  has_dpo: false,
}, {
  appliesGdpr: true,
  has: ['lawful_basis', 'legitimate_interests_lia', 'ropa_controller', 'transparency_notice', 'security',
    'data_subject_rights', 'storage_limitation', 'breach_process', 'dpa', 'sub_processor_authorisation',
    'intl_transfer', 'us_dpf', 'art22_adm', 'dpia', 'dpo', 'training_data'],
  missing: ['consent_conditions', 'ropa_processor', 'processor_duties', 'joint_controller_arrangement',
    'art9_special', 'art10_criminal', 'eu_representative', 'children', 'direct_marketing'],
  gap: ['dpa', 'storage_limitation', 'breach_process', 'dpo'],
});

// B) Non-EU health-diagnostics AI acting as processor for EU hospitals; EEA-hosted but US staff access.
run('B: Non-EU health AI (processor, special+children, EU representative)', {
  processes_personal_data: true,
  subject_volume: 'k1_100k',
  special_categories: ['health', 'genetic'],
  pseudonymised: true,
  childrens_data: true,
  org_size: 's10_249',
  auto_processing_staff: 5,
  acts_as_processor: true,
  joint_controller: false,
  established_outside_eu: true,
  lawful_basis: 'consent',
  direct_marketing: false,
  automated_decisions: false,
  uses_third_party_processor: true,
  has_dpa: true,
  sub_processors: false,
  data_location: 'eu_only',
  vendor_remote_access: true,
  large_scale_monitoring: false,
  trains_on_personal_data: true,
  retention_status: 'enforced',
  has_breach_process: true,
  has_dpo: true,
}, {
  appliesGdpr: true,
  has: ['consent_conditions', 'ropa_processor', 'processor_duties', 'eu_representative', 'art9_special',
    'dpia', 'dpo', 'children', 'intl_transfer', 'training_data', 'storage_limitation', 'breach_process', 'dpa'],
  missing: ['ropa_controller', 'legitimate_interests_lia', 'sub_processor_authorisation', 'us_dpf',
    'art10_criminal', 'art22_adm', 'joint_controller_arrangement', 'direct_marketing'],
  notGap: ['dpa', 'storage_limitation', 'breach_process', 'dpo'],
});

// C) Internal tool that processes no personal data -> GDPR not applicable.
run('C: No personal data', {
  processes_personal_data: false,
}, {
  appliesGdpr: false,
  missing: ['lawful_basis', 'dpa', 'intl_transfer'],
});

// D) Small EU SaaS, marketing + criminal-record screening, DPO via the German 20-staff rule.
run('D: Small EU SaaS (criminal data, marketing, BDSG 20-staff DPO)', {
  processes_personal_data: true,
  subject_volume: 'under_1k',
  special_categories: ['criminal'],
  pseudonymised: false,
  childrens_data: false,
  org_size: 'under_10',
  auto_processing_staff: 25, // >= 20 -> DPO under sec.38 BDSG even though small org
  acts_as_processor: false,
  joint_controller: true,
  established_outside_eu: false,
  lawful_basis: 'contract',
  direct_marketing: true,
  automated_decisions: false,
  uses_third_party_processor: false,
  has_dpa: false,
  sub_processors: false,
  data_location: 'eu_only',
  vendor_remote_access: false,
  large_scale_monitoring: false,
  trains_on_personal_data: false,
  retention_status: 'partial',
  has_breach_process: true,
  has_dpo: false,
}, {
  appliesGdpr: true,
  has: ['lawful_basis', 'ropa_controller', 'art10_criminal', 'direct_marketing', 'joint_controller_arrangement',
    'dpo', 'storage_limitation', 'dpia'],
  missing: ['consent_conditions', 'dpa', 'intl_transfer', 'us_dpf', 'eu_representative', 'art22_adm', 'art9_special'],
  gap: ['dpo', 'storage_limitation'], // no DPO appointed; retention defined-but-not-enforced
});

console.log(`\n${failures === 0 ? 'ALL SCENARIOS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
