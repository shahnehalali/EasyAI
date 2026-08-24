// Full framework directory: every law in the catalogue, generated from the
// same source content the app itself seeds from (content/frameworks.seed.json
// and content/lawContent.de.json), so the marketing site never drifts from
// what the product actually covers. Regenerate by hand if the catalogue changes
// meaningfully; this is a point-in-time copy, not a live fetch (the endpoint
// requires auth and this page does not).

export const TIER_LABELS = {
  1: { en: 'EU-wide', de: 'EU-weit' },
  2: { en: 'German national law', de: 'Deutsches Bundesrecht' },
  3: { en: 'Sector-specific', de: 'Branchenspezifisch' },
};

export const FRAMEWORK_DIRECTORY = [
  {
    key: 'eu_ai_act',
    tier: 1,
    name: { en: 'EU AI Act', de: 'EU-KI-Verordnung' },
    description: { en: 'The main AI law. It sorts AI systems into risk levels (banned, high, limited, minimal) and sets rules for each level, such as documentation, human oversight and transparency.', de: 'Das zentrale KI-Gesetz. Es teilt KI-Systeme in Risikostufen ein (verboten, hoch, begrenzt, minimal) und legt fuer jede Stufe Pflichten fest, etwa Dokumentation, menschliche Aufsicht und Transparenz.' },
  },
  {
    key: 'gdpr',
    tier: 1,
    name: { en: 'GDPR', de: 'Datenschutz-Grundverordnung (DSGVO)' },
    description: { en: 'The core data protection law. It controls how AI uses personal data, limits fully automated decisions about people, and requires a data protection impact assessment for high-risk AI.', de: 'Das zentrale Datenschutzgesetz. Es regelt, wie KI personenbezogene Daten nutzt, begrenzt voll automatisierte Entscheidungen ueber Menschen und verlangt eine Datenschutz-Folgenabschaetzung fuer risikoreiche KI.' },
  },
  {
    key: 'eu_data_act',
    tier: 1,
    name: { en: 'Data Act', de: 'EU-Datengesetz (Data Act)' },
    description: { en: 'Sets fair rules for who can access and use the data produced by connected products and AI-enabled services. It also makes switching cloud providers easier.', de: 'Legt faire Regeln fest, wer auf die Daten vernetzter Produkte und KI-gestuetzter Dienste zugreifen und sie nutzen darf. Es erleichtert auch den Wechsel des Cloud-Anbieters.' },
  },
  {
    key: 'dga',
    tier: 1,
    name: { en: 'DGA', de: 'Datengovernance-Verordnung (DGA)' },
    description: { en: 'Creates trusted ways to share data that AI can use, including reuse of public-sector data and registration of data-sharing services.', de: 'Schafft vertrauenswuerdige Wege, um Daten zu teilen, die KI nutzen kann, einschliesslich der Weiterverwendung von Daten des oeffentlichen Sektors und der Registrierung von Datenvermittlungsdiensten.' },
  },
  {
    key: 'dora',
    tier: 1,
    name: { en: 'DORA', de: 'Verordnung ueber digitale operationale Resilienz (DORA)' },
    description: { en: 'Requires financial firms to manage their technology and AI risks, report incidents, and oversee outside IT and AI suppliers.', de: 'Verlangt von Finanzunternehmen, ihre Technologie- und KI-Risiken zu steuern, Vorfaelle zu melden und externe IT- und KI-Dienstleister zu beaufsichtigen.' },
  },
  {
    key: 'nis2',
    tier: 1,
    name: { en: 'NIS2', de: 'NIS2-Richtlinie und deutsches NIS2-Gesetz' },
    description: { en: 'Sets cybersecurity duties for important and essential service operators, including AI-powered infrastructure, and requires reporting incidents to the BSI.', de: 'Legt Cybersicherheitspflichten fuer wichtige und besonders wichtige Einrichtungen fest, auch fuer KI-gestuetzte Infrastruktur, und verlangt die Meldung von Vorfaellen an das BSI.' },
  },
  {
    key: 'cra',
    tier: 1,
    name: { en: 'CRA', de: 'Cyberresilienz-Verordnung (CRA)' },
    description: { en: 'Requires products with digital parts, including AI software and hardware, to be secure by design, get security updates, and report exploited weaknesses.', de: 'Verlangt, dass Produkte mit digitalen Bestandteilen, auch KI-Software und -Hardware, von Anfang an sicher sind, Sicherheitsupdates erhalten und ausgenutzte Schwachstellen gemeldet werden.' },
  },
  {
    key: 'pld',
    tier: 1,
    name: { en: 'Product Liability Directive', de: 'Produkthaftungsrichtlinie (neu)' },
    description: { en: 'Updates liability rules so that defective software and AI are clearly covered, and makes it easier for harmed people to claim compensation.', de: 'Aktualisiert die Haftungsregeln, sodass fehlerhafte Software und KI klar erfasst sind und Geschaedigte leichter Schadensersatz verlangen koennen.' },
  },
  {
    key: 'machinery',
    tier: 1,
    name: { en: 'Machinery Regulation', de: 'Maschinenverordnung' },
    description: { en: 'Sets safety rules for AI-powered machines and robots, and specifically requires a risk assessment for self-learning behaviour.', de: 'Legt Sicherheitsregeln fuer KI-gestuetzte Maschinen und Roboter fest und verlangt ausdruecklich eine Risikobewertung fuer selbstlernendes Verhalten.' },
  },
  {
    key: 'dsa',
    tier: 1,
    name: { en: 'DSA', de: 'Gesetz ueber digitale Dienste (DSA)' },
    description: { en: 'Makes online platforms explain how their AI ranks and recommends content, be transparent about moderation, and assess risks from their algorithms.', de: 'Verpflichtet Online-Plattformen, offenzulegen, wie ihre KI Inhalte einstuft und empfiehlt, transparent zu moderieren und Risiken ihrer Algorithmen zu bewerten.' },
  },
  {
    key: 'dma',
    tier: 1,
    name: { en: 'DMA', de: 'Gesetz ueber digitale Maerkte (DMA)' },
    description: { en: 'Stops the largest gatekeeper platforms from using AI ranking to favour their own services or from misusing business users\' data.', de: 'Hindert die groessten Gatekeeper-Plattformen daran, mit KI-Rankings die eigenen Dienste zu bevorzugen oder Daten der Geschaeftsnutzer unfair zu verwenden.' },
  },
  {
    key: 'eidas',
    tier: 1,
    name: { en: 'eIDAS', de: 'eIDAS und eIDAS 2.0' },
    description: { en: 'Sets rules for electronic identity and trust services such as e-signatures, and adds the EU Digital Identity Wallet. It matters for AI identity checks and fraud prevention.', de: 'Legt Regeln fuer elektronische Identitaet und Vertrauensdienste wie E-Signaturen fest und fuehrt die EU-Brieftasche fuer digitale Identitaet ein. Wichtig fuer KI-Identitaetspruefung und Betrugspraevention.' },
  },
  {
    key: 'ki_mig',
    tier: 2,
    name: { en: 'KI-MIG', de: 'KI-MIG (deutsches KI-Marktueberwachungsgesetz)' },
    description: { en: 'The German law that puts the EU AI Act into practice. It names which German authorities supervise AI, sets penalty procedures, and provides regulatory sandboxes.', de: 'Das deutsche Gesetz, das die EU-KI-Verordnung in die Praxis umsetzt. Es benennt die zustaendigen deutschen Behoerden, regelt Bussgeldverfahren und sieht Reallabore vor.' },
  },
  {
    key: 'bdsg',
    tier: 2,
    name: { en: 'BDSG', de: 'Bundesdatenschutzgesetz (BDSG)' },
    description: { en: 'Adds German-specific data rules on top of the GDPR, especially for handling employee data and AI profiling at work.', de: 'Ergaenzt die DSGVO um deutsche Besonderheiten, besonders fuer den Umgang mit Beschaeftigtendaten und KI-Profiling am Arbeitsplatz.' },
  },
  {
    key: 'tdddg',
    tier: 2,
    name: { en: 'TDDDG', de: 'Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG)' },
    description: { en: 'Controls cookies, tracking, and consent on websites and apps. This directly affects AI that profiles users for ads or personalisation.', de: 'Regelt Cookies, Tracking und Einwilligung auf Webseiten und Apps. Das betrifft KI, die Nutzer fuer Werbung oder Personalisierung profiliert.' },
  },
  {
    key: 'geschgehg',
    tier: 2,
    name: { en: 'GeschGehG', de: 'Geschaeftsgeheimnisgesetz (GeschGehG)' },
    description: { en: 'Protects confidential business information such as AI model weights, datasets, and prompts as trade secrets, as long as you take reasonable steps to keep them secret.', de: 'Schuetzt vertrauliche Geschaeftsinformationen wie KI-Modelle, Datensaetze und Prompts als Geschaeftsgeheimnis, sofern Sie angemessene Schutzmassnahmen treffen.' },
  },
  {
    key: 'urhg',
    tier: 2,
    name: { en: 'UrhG', de: 'Urheberrechtsgesetz (UrhG)' },
    description: { en: 'Governs AI training data through text and data mining rules, the protection of AI output, and responsibility for copyright infringement.', de: 'Regelt KI-Trainingsdaten ueber die Regeln zum Text- und Data-Mining, den Schutz von KI-Ergebnissen und die Haftung fuer Urheberrechtsverletzungen.' },
  },
  {
    key: 'uwg',
    tier: 2,
    name: { en: 'UWG', de: 'Gesetz gegen den unlauteren Wettbewerb (UWG)' },
    description: { en: 'AI-made advertising must not mislead people. Competitors can also act against AI Act breaches as unfair competition.', de: 'KI-erzeugte Werbung darf nicht irrefuehren. Wettbewerber koennen auch gegen Verstoesse gegen die KI-Verordnung als unlauteren Wettbewerb vorgehen.' },
  },
  {
    key: 'gwb',
    tier: 2,
    name: { en: 'GWB', de: 'Gesetz gegen Wettbewerbsbeschraenkungen (GWB)' },
    description: { en: 'The German antitrust law. It checks market power including data power, and lets the Cartel Office stop self-preferencing and data-driven obstruction by very large firms.', de: 'Das deutsche Kartellrecht. Es prueft Marktmacht einschliesslich Datenmacht und erlaubt dem Bundeskartellamt, Selbstbevorzugung und datenbasierte Behinderung sehr grosser Firmen zu stoppen.' },
  },
  {
    key: 'bgb',
    tier: 2,
    name: { en: 'BGB', de: 'Buergerliches Gesetzbuch (BGB)' },
    description: { en: 'Covers contract and fault liability when an AI system fails, protection against AI deepfakes, and the duty to tell consumers about AI-set prices.', de: 'Regelt Vertrags- und Verschuldenshaftung bei KI-Fehlern, den Schutz vor KI-Deepfakes und die Pflicht, Verbrauchern KI-gesetzte Preise mitzuteilen.' },
  },
  {
    key: 'agg',
    tier: 2,
    name: { en: 'AGG', de: 'Allgemeines Gleichbehandlungsgesetz (AGG)' },
    description: { en: 'Forbids AI systems from discriminating in hiring, employment, or access to services based on protected traits such as gender, age, or origin.', de: 'Verbietet KI-Systemen Diskriminierung bei Einstellung, Beschaeftigung oder Zugang zu Leistungen anhand geschuetzter Merkmale wie Geschlecht, Alter oder Herkunft.' },
  },
  {
    key: 'betrvg',
    tier: 2,
    name: { en: 'BetrVG', de: 'Betriebsverfassungsgesetz (BetrVG)' },
    description: { en: 'The works council must be involved before you introduce AI tools that can monitor staff or affect their work.', de: 'Der Betriebsrat muss beteiligt werden, bevor Sie KI-Werkzeuge einfuehren, die Mitarbeitende ueberwachen oder ihre Arbeit beeinflussen koennen.' },
  },
  {
    key: 'arbschg',
    tier: 2,
    name: { en: 'ArbSchG', de: 'Arbeitsschutzgesetz (ArbSchG)' },
    description: { en: 'Employers must assess all workplace risks, including stress from AI monitoring and automated performance management.', de: 'Arbeitgeber muessen alle Gefaehrdungen am Arbeitsplatz beurteilen, auch Belastungen durch KI-Ueberwachung und algorithmisches Management.' },
  },
  {
    key: 'stgb',
    tier: 2,
    name: { en: 'StGB', de: 'Strafgesetzbuch (StGB)' },
    description: { en: 'AI deepfakes and synthetic media can be crimes, for example insult, defamation, incitement, or privacy violations. A dedicated deepfake offence is being prepared.', de: 'KI-Deepfakes und synthetische Medien koennen Straftaten sein, etwa Beleidigung, Verleumdung, Volksverhetzung oder Verletzung der Privatsphaere.' },
  },
  {
    key: 'mstv',
    tier: 2,
    name: { en: 'MStV', de: 'Medienstaatsvertrag (MStV)' },
    description: { en: 'You must disclose when content or an account is automated, for example a bot that looks like a real person, and recommendation systems must be transparent.', de: 'Sie muessen offenlegen, wenn Konten oder Inhalte automatisiert sind, etwa ein Bot, der wie eine echte Person wirkt, und Empfehlungssysteme transparent halten.' },
  },
  {
    key: 'kwg',
    tier: 3,
    name: { en: 'KWG', de: 'Kreditwesengesetz (KWG)' },
    description: { en: 'Governs AI in banking such as credit scoring and automated trading under BaFin\'s risk and organisation rules.', de: 'Regelt KI im Bankwesen wie Kreditscoring und automatisierten Handel unter den Risiko- und Organisationsregeln der BaFin.' },
  },
  {
    key: 'vag',
    tier: 3,
    name: { en: 'VAG', de: 'Versicherungsaufsichtsgesetz (VAG)' },
    description: { en: 'BaFin oversees AI used in insurance underwriting, automated claims, and risk scoring.', de: 'Die BaFin beaufsichtigt KI in der Versicherungszeichnung, der automatisierten Schadenbearbeitung und der Risikobewertung.' },
  },
  {
    key: 'sgbv_diga',
    tier: 3,
    name: { en: 'SGB V + DiGAV', de: 'SGB V und digitale Gesundheitsanwendungen (DiGA)' },
    description: { en: 'AI-based medical apps must be approved by BfArM, show a real health benefit, and meet data and device rules to be paid for by statutory health insurance.', de: 'KI-basierte Gesundheits-Apps muessen vom BfArM zugelassen sein, einen Nutzen nachweisen und Daten- und Geraeteregeln erfuellen, um von der Krankenkasse erstattet zu werden.' },
  },
  {
    key: 'mdr',
    tier: 3,
    name: { en: 'MDR', de: 'Medizinprodukteverordnung (MDR)' },
    description: { en: 'AI that counts as a medical device, such as diagnostic AI, must pass a conformity assessment, carry a CE mark, and be monitored after sale.', de: 'KI, die als Medizinprodukt gilt, etwa Diagnose-KI, muss eine Konformitaetsbewertung durchlaufen, eine CE-Kennzeichnung tragen und nach dem Verkauf ueberwacht werden.' },
  },
  {
    key: 'stvg_autonomous',
    tier: 3,
    name: { en: 'StVG + Autonomous Driving', de: 'Strassenverkehrsgesetz und Gesetz zum autonomen Fahren' },
    description: { en: 'Sets the legal framework for Level 3 and Level 4 self-driving vehicles on public roads, including approval and the technical-supervisor role.', de: 'Setzt den Rechtsrahmen fuer selbstfahrende Fahrzeuge der Stufen 3 und 4 auf oeffentlichen Strassen, einschliesslich Zulassung und der Rolle der technischen Aufsicht.' },
  },
  {
    key: 'vwvfg',
    tier: 3,
    name: { en: 'VwVfG', de: 'Verwaltungsverfahrensgesetz (VwVfG)' },
    description: { en: 'Allows fully automated government decisions only where a law permits it, and those decisions must be explainable and open to challenge.', de: 'Erlaubt voll automatisierte Behoerdenentscheidungen nur, wenn ein Gesetz es zulaesst, und solche Entscheidungen muessen erklaerbar und anfechtbar sein.' },
  },
  {
    key: 'prodhaftg',
    tier: 3,
    name: { en: 'ProdHaftG', de: 'Produkthaftungsgesetz (ProdHaftG)' },
    description: { en: 'Gives no-fault liability for damage caused by defective products, including AI-integrated goods. It will be widened once the new EU directive is adopted by December 2026.', de: 'Gibt eine verschuldensunabhaengige Haftung fuer Schaeden durch fehlerhafte Produkte, auch KI-integrierte. Es wird nach Umsetzung der neuen EU-Richtlinie bis Dezember 2026 erweitert.' },
  },
  {
    key: 'ehds',
    tier: 3,
    name: { en: 'EHDS', de: 'Europaeischer Raum fuer Gesundheitsdaten (EHDS)' },
    description: { en: 'Creates EU rules for using electronic health data both for patient care and, importantly for AI, for research and training through national health data access bodies. It sits alongside the GDPR and the Data Governance Act.', de: 'Schafft EU-Regeln fuer die Nutzung elektronischer Gesundheitsdaten, sowohl fuer die Versorgung als auch, wichtig fuer KI, fuer Forschung und Training ueber nationale Zugangsstellen.' },
  },
  {
    key: 'hinschg',
    tier: 2,
    name: { en: 'HinSchG', de: 'Hinweisgeberschutzgesetz (HinSchG)' },
    description: { en: 'Companies with 50 or more staff must run internal reporting channels and protect people who report legal violations. This includes employees who flag unlawful or unsafe AI use, so your AI governance should route such concerns through these channels.', de: 'Unternehmen mit 50 oder mehr Beschaeftigten muessen interne Meldestellen betreiben und Personen schuetzen, die Rechtsverstoesse melden, auch unzulaessige KI-Nutzung.' },
  },
  {
    key: 'bafin_ki',
    tier: 3,
    name: { en: 'BaFin AI', de: 'BaFin-Aufsichtsprinzipien fuer KI im Finanzwesen' },
    description: { en: 'BaFin\'s expectations for using AI and machine learning in financial services. The focus is clear human responsibility, sound data, model validation, and ongoing oversight of algorithmic decisions.', de: 'Die Erwartungen der BaFin an die Nutzung von KI und maschinellem Lernen im Finanzwesen. Im Fokus stehen klare Verantwortung, gute Daten, Modellvalidierung und laufende Aufsicht ueber algorithmische Entscheidungen.' },
  },
  {
    key: 'deepfake_law',
    tier: 2,
    name: { en: 'Deepfake law', de: 'Gesetz gegen Deepfakes und digitale Gewalt (in Vorbereitung)' },
    description: { en: 'A planned German law that would create dedicated criminal offences for harmful deepfakes and digital violence. It is not yet in force, so watch it rather than act on it.', de: 'Ein geplantes deutsches Gesetz, das eigene Straftatbestaende fuer schaedliche Deepfakes und digitale Gewalt schaffen wuerde. Noch nicht in Kraft, also beobachten statt handeln.' },
  },
  {
    key: 'besch_datengesetz',
    tier: 2,
    name: { en: 'Employee Data Act', de: 'Beschaeftigtendatengesetz (Entwurf)' },
    description: { en: 'A planned standalone German law for handling employee data, including AI monitoring and decisions at work. It would go beyond the current BDSG rules. Still a draft.', de: 'Ein geplantes eigenstaendiges deutsches Gesetz fuer den Umgang mit Beschaeftigtendaten, auch KI-Ueberwachung und Entscheidungen am Arbeitsplatz. Es ginge ueber die heutigen BDSG-Regeln hinaus. Noch ein Entwurf.' },
  },
];
