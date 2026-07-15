// Curated key EU / German AI & digital-compliance milestones. This is static
// reference data — the same for every organisation — shown on the Compliance
// Timeline alongside each org's own assessment review dates. Dates are ISO
// (all-day). Status (done / upcoming) is derived from today at render time.
//
// Each entry links to its framework page via `frameworkKey` (all keys verified
// to exist in the catalog). Titles/labels are bilingual.
export const COMPLIANCE_MILESTONES = [
  {
    id: 'euaiact-inforce', date: '2024-08-01', frameworkKey: 'eu_ai_act',
    framework: { en: 'EU AI Act', de: 'KI-Verordnung' },
    title: { en: 'EU AI Act entered into force', de: 'KI-Verordnung ist in Kraft getreten' },
  },
  {
    id: 'dora-applicable', date: '2025-01-17', frameworkKey: 'dora',
    framework: { en: 'DORA', de: 'DORA' },
    title: { en: 'DORA became applicable to financial entities', de: 'DORA gilt für Finanzunternehmen' },
  },
  {
    id: 'euaiact-prohibited', date: '2025-02-02', frameworkKey: 'eu_ai_act',
    framework: { en: 'EU AI Act', de: 'KI-Verordnung' },
    title: { en: 'EU AI Act: banned AI practices became enforceable', de: 'KI-Verordnung: Verbotene KI-Praktiken wurden durchsetzbar' },
  },
  {
    id: 'euaiact-gpai', date: '2025-08-02', frameworkKey: 'eu_ai_act',
    framework: { en: 'EU AI Act', de: 'KI-Verordnung' },
    title: { en: 'EU AI Act: rules for general-purpose AI (GPAI) models began', de: 'KI-Verordnung: Regeln für KI-Modelle mit allgemeinem Verwendungszweck (GPAI) gelten' },
  },
  {
    id: 'dataact-applicable', date: '2025-09-12', frameworkKey: 'eu_data_act',
    framework: { en: 'Data Act', de: 'Data Act' },
    title: { en: 'EU Data Act: main rules became applicable', de: 'EU Data Act: Hauptregeln gelten' },
  },
  {
    id: 'nis2-de', date: '2025-12-05', frameworkKey: 'nis2',
    framework: { en: 'NIS2', de: 'NIS2' },
    title: { en: 'German NIS2 implementing law came into force', de: 'Deutsches NIS2-Umsetzungsgesetz in Kraft getreten' },
  },
  {
    id: 'euaiact-highrisk', date: '2026-08-02', frameworkKey: 'eu_ai_act',
    framework: { en: 'EU AI Act', de: 'KI-Verordnung' },
    title: { en: 'EU AI Act: high-risk AI rules start to apply', de: 'KI-Verordnung: Regeln für Hochrisiko-KI gelten' },
  },
  {
    id: 'cra-reporting', date: '2026-09-11', frameworkKey: 'cra',
    framework: { en: 'Cyber Resilience Act', de: 'Cyber Resilience Act' },
    title: { en: 'Cyber Resilience Act: vulnerability reporting duties start', de: 'Cyber Resilience Act: Meldepflichten für Schwachstellen beginnen' },
  },
  {
    id: 'pld-transpose', date: '2026-12-09', frameworkKey: 'pld',
    framework: { en: 'Product Liability Directive', de: 'Produkthaftungsrichtlinie' },
    title: { en: 'Product Liability Directive: Germany must transpose it by now', de: 'Produkthaftungsrichtlinie: Deutschland muss sie bis jetzt umsetzen' },
  },
  {
    id: 'machinery-apply', date: '2027-01-20', frameworkKey: 'machinery',
    framework: { en: 'Machinery Regulation', de: 'Maschinenverordnung' },
    title: { en: 'Machinery Regulation starts to apply', de: 'Maschinenverordnung gilt' },
  },
  {
    id: 'euaiact-embedded', date: '2027-12-02', frameworkKey: 'eu_ai_act',
    framework: { en: 'EU AI Act', de: 'KI-Verordnung' },
    title: { en: 'EU AI Act: high-risk rules for product-embedded AI apply', de: 'KI-Verordnung: Hochrisiko-Regeln für in Produkte eingebettete KI gelten' },
  },
  {
    id: 'cra-main', date: '2027-12-11', frameworkKey: 'cra',
    framework: { en: 'Cyber Resilience Act', de: 'Cyber Resilience Act' },
    title: { en: 'Cyber Resilience Act: main obligations apply', de: 'Cyber Resilience Act: Hauptpflichten gelten' },
  },
];
