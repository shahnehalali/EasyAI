// Bilingual copy for the public marketing site (landing page, about page,
// footer, draft legal pages). Kept separate from the in-app i18n dictionary
// and from the authenticated FAQ content, same pattern as data/faqContent.js
// and data/helpContent.js: components read { en, de } fields directly using
// the shared lang store, no useT() lookup needed.
//
// Style note: no em dashes or en dashes anywhere in this file. Use a comma, a
// period, or the word "to" instead.

export const HERO = {
  eyebrow: { en: 'GDPR and German national law AI compliance', de: 'DSGVO- und Bundesrecht-Compliance fuer KI' },
  title: {
    en: 'Know exactly what German and EU AI law asks of you',
    de: 'Wissen Sie genau, was das deutsche und EU-Recht von Ihrer KI verlangt',
  },
  subtitle: {
    en: 'Compliance Check turns the EU AI Act, GDPR, and 35 other laws that touch AI in Germany into a plain-language checklist for your company: classify each AI system, work through the right requirements, document your evidence, and get reminded before a review is due.',
    de: 'Compliance Check macht aus dem EU AI Act, der DSGVO und 35 weiteren Gesetzen mit Bezug zu KI in Deutschland eine verstaendliche Checkliste fuer Ihr Unternehmen: Stufen Sie jedes KI-System ein, arbeiten Sie die passenden Anforderungen ab, dokumentieren Sie Ihre Nachweise, und werden Sie rechtzeitig vor einer faelligen Pruefung erinnert.',
  },
  ctaPrimary: { en: 'Start for free', de: 'Kostenlos starten' },
  ctaSecondary: { en: 'Sign in', de: 'Anmelden' },
  trustLine: {
    en: 'Built and hosted in the EU. Your data is encrypted, backed up, and yours to export or delete at any time.',
    de: 'Entwickelt und gehostet in der EU. Ihre Daten sind verschluesselt, werden gesichert und lassen sich jederzeit exportieren oder loeschen.',
  },
};

// A curated strip of the most recognisable frameworks in the catalogue. The
// full library (37 laws at last count) is bigger; see FRAMEWORK_STATS.
export const FRAMEWORK_BADGES = [
  'EU AI Act', 'GDPR', 'DORA', 'NIS2', 'Data Act', 'DGA', 'CRA',
  'Product Liability Directive', 'Machinery Regulation', 'DSA', 'DMA', 'eIDAS',
  'KI-MIG', 'BDSG', 'TDDDG', 'BetrVG', 'BaFin AI',
];

export const FRAMEWORK_STATS = {
  count: { en: '37 laws in the library', de: '37 Gesetze in der Bibliothek' },
  detail: {
    en: 'EU regulations and German national law, in one place, kept current as they change.',
    de: 'EU-Verordnungen und deutsches Recht an einem Ort, laufend aktualisiert, wenn sich etwas aendert.',
  },
};

// Each step now also carries `detail`, 2 to 3 concrete bullets shown when the
// step is expanded in the interactive process flow. Real specifics, not
// restated marketing copy: exact counts (20 questions), what the system
// actually stores, what the scheduler actually does.
export const STEPS = [
  {
    n: '1',
    id: 'register',
    title: { en: 'Register your AI systems', de: 'KI-Systeme registrieren' },
    body: {
      en: 'List every AI system your company builds or uses, in-house or third party.',
      de: 'Listen Sie jedes KI-System auf, das Ihr Unternehmen entwickelt oder nutzt, intern oder von Dritten.',
    },
    detail: [
      {
        en: 'Works the same for a system you built in-house or one you bought from a vendor.',
        de: 'Funktioniert gleich, egal ob Sie das System selbst entwickelt oder bei einem Anbieter eingekauft haben.',
      },
      {
        en: 'Each system gets its own record: purpose, vendor, lifecycle stage (planning, deployed, retired).',
        de: 'Jedes System erhaelt einen eigenen Datensatz: Zweck, Anbieter, Lebenszyklusphase (Planung, im Einsatz, ausgemustert).',
      },
      {
        en: 'Takes a minute per system, no need to classify it yet.',
        de: 'Dauert etwa eine Minute pro System, eine Einstufung ist dafuer noch nicht noetig.',
      },
    ],
  },
  {
    n: '2',
    id: 'classify',
    title: { en: 'Classify the risk', de: 'Risiko einstufen' },
    body: {
      en: 'A short questionnaire places each system into a EU AI Act risk category and explains why.',
      de: 'Ein kurzer Fragebogen ordnet jedes System einer Risikokategorie des EU AI Act zu und erklaert die Begruendung.',
    },
    detail: [
      {
        en: '20 yes/no questions, drawn directly from Article 5 and Annex III of the AI Act.',
        de: '20 Ja/Nein-Fragen, direkt abgeleitet aus Art. 5 und Anhang III des AI Act.',
      },
      {
        en: 'Every result comes with a plain-language explanation of which rule triggered it, not just a label.',
        de: 'Jedes Ergebnis kommt mit einer verstaendlichen Erklaerung, welche Regel es ausgeloest hat, nicht nur mit einem Etikett.',
      },
      {
        en: 'The four possible outcomes below decide what happens next.',
        de: 'Die vier moeglichen Ergebnisse unten entscheiden, was als naechstes passiert.',
      },
    ],
  },
  {
    n: '3',
    id: 'checklist',
    title: { en: 'Work through the checklist', de: 'Checkliste abarbeiten' },
    body: {
      en: 'The right requirements are built for you automatically. Document evidence as you go.',
      de: 'Die passenden Anforderungen werden automatisch fuer Sie erstellt. Dokumentieren Sie Nachweise direkt dabei.',
    },
    detail: [
      {
        en: 'Every checklist item traces back to a specific article, so you can always see the source.',
        de: 'Jeder Checklistenpunkt laesst sich auf einen konkreten Artikel zurueckfuehren, die Quelle ist immer sichtbar.',
      },
      {
        en: 'Attach evidence files directly to an item; they are encrypted before they touch disk.',
        de: 'Haengen Sie Nachweise direkt an einen Punkt an, sie werden verschluesselt, bevor sie gespeichert werden.',
      },
      {
        en: 'Assign an item to a teammate and track its status: not started, in progress, done.',
        de: 'Weisen Sie einen Punkt einer Kollegin oder einem Kollegen zu und verfolgen Sie den Status: offen, in Bearbeitung, erledigt.',
      },
    ],
  },
  {
    n: '4',
    id: 'review',
    title: { en: 'Stay reviewed', de: 'Regelmaessig pruefen' },
    body: {
      en: 'Annual review reminders land in your inbox before anything falls due.',
      de: 'Jaehrliche Erinnerungen erreichen Sie rechtzeitig, bevor eine Pruefung faellig wird.',
    },
    detail: [
      {
        en: 'A scheduled job checks what is due every day, not once a year by hand.',
        de: 'Ein geplanter Job prueft taeglich, was faellig ist, nicht einmal im Jahr von Hand.',
      },
      {
        en: 'You are notified by email and in-app before the deadline, with a lead time you can adjust.',
        de: 'Sie werden per E-Mail und in der App vor der Frist benachrichtigt, mit einem einstellbaren Vorlauf.',
      },
      {
        en: 'The assessment is automatically flagged for review, so it cannot quietly go stale.',
        de: 'Die Bewertung wird automatisch zur Pruefung markiert, sodass sie nicht unbemerkt veraltet.',
      },
    ],
  },
];

// Alternating feature deep-dives (Landing.jsx "In practice" section): a real
// mock panel paired with a headline, two sentences, and concrete bullets.
// Longer-form than FEATURES below, which stays the compact card grid.
export const FEATURE_ROWS = [
  {
    id: 'dashboard',
    eyebrow: { en: 'Overview', de: 'Uebersicht' },
    title: { en: 'See your standing at a glance', de: 'Ihr Stand auf einen Blick' },
    body: {
      en: 'One dashboard shows exactly where you stand: overall progress, open items, and which reviews are coming due. Nothing to maintain in a spreadsheet on the side.',
      de: 'Ein Dashboard zeigt genau, wo Sie stehen: Gesamtfortschritt, offene Punkte und faellige Pruefungen. Keine separate Tabelle mehr zu pflegen.',
    },
    points: [
      { en: 'Progress is computed automatically from your checklists, never entered by hand', de: 'Der Fortschritt wird automatisch aus Ihren Checklisten berechnet, nie manuell eingetragen' },
      { en: 'Broken down per AI system, so you see exactly what needs attention', de: 'Aufgeschluesselt pro KI-System, damit Sie genau sehen, was Aufmerksamkeit braucht' },
      { en: 'A recent-activity feed shows who did what, and when', de: 'Ein Aktivitaetsverlauf zeigt, wer was wann getan hat' },
    ],
  },
  {
    id: 'checklist',
    eyebrow: { en: 'Checklists', de: 'Checklisten' },
    title: { en: 'Work through the law, one item at a time', de: 'Das Gesetz Punkt fuer Punkt abarbeiten' },
    body: {
      en: 'Every requirement becomes a checklist item you can actually act on: mark it done, in progress, or not applicable, with a place to document your reasoning and attach evidence.',
      de: 'Jede Anforderung wird zu einem Checklistenpunkt, den Sie wirklich abarbeiten koennen: erledigt, in Bearbeitung oder nicht zutreffend, mit Platz fuer Begruendung und Nachweise.',
    },
    points: [
      { en: 'Each item traces back to the exact article of law that requires it', de: 'Jeder Punkt laesst sich auf den konkreten Gesetzesartikel zurueckfuehren' },
      { en: 'Assign an item to a teammate and track who owns what', de: 'Weisen Sie einen Punkt einer Kollegin oder einem Kollegen zu und behalten Sie den Ueberblick' },
      { en: 'Comment directly on a requirement to discuss it as a team', de: 'Kommentieren Sie eine Anforderung direkt, um sie im Team zu besprechen' },
    ],
  },
  {
    id: 'explorer',
    eyebrow: { en: 'Law Explorer', de: 'Gesetzes-Explorer' },
    title: { en: 'Know exactly which laws apply to you', de: 'Wissen, welche Gesetze fuer Sie gelten' },
    body: {
      en: 'Answer a short questionnaire about what your company does, and see precisely which of the 37 laws apply, each with a plain-language summary and a link to the official text.',
      de: 'Beantworten Sie einen kurzen Fragebogen zu Ihrem Unternehmen und sehen Sie genau, welche der 37 Gesetze gelten, mit verstaendlicher Zusammenfassung und Link zum Originaltext.',
    },
    points: [
      { en: 'Filterable by tier: EU-wide, German national, or sector-specific', de: 'Filterbar nach Ebene: EU-weit, deutsches Bundesrecht oder branchenspezifisch' },
      { en: 'Kept current as the law changes, most recently for the Digital Omnibus', de: 'Wird bei Gesetzesaenderungen aktuell gehalten, zuletzt fuer den Digital Omnibus' },
      { en: 'Every summary cites where it came from', de: 'Jede Zusammenfassung nennt ihre Quelle' },
    ],
  },
  {
    id: 'documents',
    eyebrow: { en: 'Evidence', de: 'Nachweise' },
    title: { en: 'Documentation you can actually trust', de: 'Dokumentation, der Sie vertrauen koennen' },
    body: {
      en: 'Attach the evidence for a requirement directly to its checklist item. Every file is encrypted with your organisation\'s own key before it ever touches disk.',
      de: 'Haengen Sie Nachweise direkt an den zugehoerigen Checklistenpunkt an. Jede Datei wird mit dem eigenen Schluessel Ihrer Organisation verschluesselt, bevor sie gespeichert wird.',
    },
    points: [
      { en: 'Never stored in plaintext, not even temporarily', de: 'Niemals im Klartext gespeichert, auch nicht voruebergehend' },
      { en: 'Files attach directly to the checklist item they support', de: 'Dateien werden direkt an den passenden Checklistenpunkt angehaengt' },
      { en: 'Download or delete everything at any time, from Settings', de: 'Alles jederzeit herunterladen oder loeschen, direkt in den Einstellungen' },
    ],
  },
  {
    id: 'team',
    eyebrow: { en: 'Team', de: 'Team' },
    title: { en: 'Built for a team, not a single owner', de: 'Fuer ein Team gemacht, nicht fuer eine Einzelperson' },
    body: {
      en: 'Invite colleagues, assign the right person to each requirement, and keep a record of who changed what. Compliance work rarely fits on one desk.',
      de: 'Laden Sie Kolleginnen und Kollegen ein, weisen Sie die richtige Person je Anforderung zu, und behalten Sie fest, wer was geaendert hat. Compliance passt selten auf einen Schreibtisch.',
    },
    points: [
      { en: 'Role-based access: owner, admin, member', de: 'Rollenbasierter Zugriff: Inhaber, Admin, Mitglied' },
      { en: 'Assign checklist items to the right teammate', de: 'Checklistenpunkte der richtigen Person zuweisen' },
      { en: 'An audit trail records every meaningful action', de: 'Ein Protokoll erfasst jede relevante Aktion' },
    ],
  },
];

export const FEATURES = [
  {
    icon: 'ShieldCheck',
    title: { en: 'Risk classification', de: 'Risikoeinstufung' },
    body: {
      en: 'A data-driven rule engine sorts each AI system into the EU AI Act risk levels: prohibited, high, limited, or minimal, with a plain-language explanation for the result.',
      de: 'Eine datengetriebene Regelengine ordnet jedes KI-System einer Risikostufe des EU AI Act zu: verboten, hoch, begrenzt oder minimal, mit einer verstaendlichen Begruendung.',
    },
  },
  {
    icon: 'ListChecks',
    title: { en: 'Ready-made checklists', de: 'Fertige Checklisten' },
    body: {
      en: 'The right requirements from the right law appear automatically once a system is classified. No blank page, no guesswork.',
      de: 'Die passenden Anforderungen des jeweiligen Gesetzes erscheinen automatisch nach der Einstufung. Kein leeres Blatt, kein Raten.',
    },
  },
  {
    icon: 'Compass',
    title: { en: 'Law Explorer', de: 'Gesetzes-Explorer' },
    body: {
      en: 'Answer a short "what does your company do" questionnaire and see exactly which of the 37 laws apply to you, with a plain-language summary for each.',
      de: 'Beantworten Sie einen kurzen Fragebogen zu Ihrem Unternehmen und sehen Sie genau, welche der 37 Gesetze fuer Sie gelten, mit einer verstaendlichen Zusammenfassung.',
    },
  },
  {
    icon: 'CalendarClock',
    title: { en: 'Annual review reminders', de: 'Jaehrliche Erinnerungen' },
    body: {
      en: 'A scheduled job checks what is due and notifies your team by email and in-app, so nothing quietly goes stale.',
      de: 'Ein geplanter Job prueft, was faellig ist, und benachrichtigt Ihr Team per E-Mail und in der App, sodass nichts unbemerkt veraltet.',
    },
  },
  {
    icon: 'Users',
    title: { en: 'Built for a team', de: 'Fuer Teams gemacht' },
    body: {
      en: 'Invite colleagues, assign checklist items, comment, and keep an audit trail of who did what.',
      de: 'Laden Sie Kolleginnen und Kollegen ein, weisen Sie Checklistenpunkte zu, kommentieren Sie, und behalten Sie ein Protokoll, wer was getan hat.',
    },
  },
  {
    icon: 'Lock',
    title: { en: 'Encrypted by design', de: 'Verschluesselt von Grund auf' },
    body: {
      en: 'Every organisation gets its own encryption key for sensitive fields and uploaded documents. Storage volumes are encrypted at rest, and backups are tested regularly.',
      de: 'Jede Organisation erhaelt einen eigenen Schluessel fuer sensible Felder und hochgeladene Dokumente. Speichervolumen sind im Ruhezustand verschluesselt, Backups werden regelmaessig getestet.',
    },
  },
];

export const SECURITY_POINTS = [
  {
    en: 'Field-level encryption, unique to your organisation, for sensitive compliance content.',
    de: 'Verschluesselung auf Feldebene, individuell fuer Ihre Organisation, fuer sensible Compliance-Inhalte.',
  },
  {
    en: 'Uploaded evidence and documents are encrypted before they touch disk.',
    de: 'Hochgeladene Nachweise und Dokumente werden verschluesselt, bevor sie gespeichert werden.',
  },
  {
    en: 'Download or delete everything held about your account at any time, from Settings.',
    de: 'Laden Sie alle zu Ihrem Konto gespeicherten Daten jederzeit herunter oder loeschen Sie sie, direkt in den Einstellungen.',
  },
  {
    en: 'Daily encrypted backups, restore-tested, so an incident does not mean data loss.',
    de: 'Taegliche verschluesselte Backups, mit getesteter Wiederherstellung, damit ein Vorfall nicht zu Datenverlust fuehrt.',
  },
  {
    en: 'Optional two-factor authentication for every account.',
    de: 'Optionale Zwei-Faktor-Authentifizierung fuer jedes Konto.',
  },
];

export const PUBLIC_FAQ = [
  {
    id: 'what-is',
    q: { en: 'What is Compliance Check?', de: 'Was ist Compliance Check?' },
    a: {
      en: 'A platform that helps companies in Germany meet the rules for using AI. It turns EU and German law into checklists you can work through, document, and keep reviewed each year, instead of reading regulations directly.',
      de: 'Eine Plattform, die Unternehmen in Deutschland dabei hilft, die Regeln fuer den Einsatz von KI einzuhalten. Sie macht aus EU- und deutschem Recht Checklisten, die Sie abarbeiten, dokumentieren und jaehrlich pruefen koennen, statt Gesetzestexte direkt zu lesen.',
    },
  },
  {
    id: 'which-laws',
    q: { en: 'Which laws do you cover?', de: 'Welche Gesetze deckt ihr ab?' },
    a: {
      en: 'The EU AI Act and GDPR at the core, plus 35 more EU regulations and German national laws: DORA, NIS2, the Data Act, the CRA, sector rules for finance and healthcare, and more. New laws are added as data, not code, so the library keeps growing.',
      de: 'Im Kern der EU AI Act und die DSGVO, dazu 35 weitere EU-Verordnungen und deutsche Gesetze: DORA, NIS2, der Data Act, der CRA, Branchenregeln fuer Finanzwesen und Gesundheitswesen und mehr. Neue Gesetze werden als Daten ergaenzt, nicht als Code, die Bibliothek waechst also stetig.',
    },
  },
  {
    id: 'german-national-law',
    q: { en: 'Does it cover German national AI law, or only the EU AI Act?', de: 'Deckt ihr deutsches Bundesrecht ab, oder nur den EU AI Act?' },
    a: {
      en: 'Both. Of the 37 laws in the library, 16 are German national law rather than EU regulation: the KI-MIG (Germany\'s law implementing the AI Act), the BDSG (German data protection law that supplements GDPR), the TDDDG (cookies and tracking), the Hinweisgeberschutzgesetz (whistleblower protection), and more.',
      de: 'Beides. Von den 37 Gesetzen in der Bibliothek sind 16 deutsches Bundesrecht statt EU-Verordnung: das KI-MIG (Deutschlands Gesetz zur Durchfuehrung des AI Act), das BDSG (deutsches Datenschutzrecht, ergaenzend zur DSGVO), das TDDDG (Cookies und Tracking), das Hinweisgeberschutzgesetz und mehr.',
    },
  },
  {
    id: 'ki-mig-vs-ai-act',
    q: { en: 'What is the difference between the EU AI Act and the KI-MIG?', de: 'Was unterscheidet den EU AI Act vom KI-MIG?' },
    a: {
      en: 'The EU AI Act is the underlying EU regulation, the same text across all member states. The KI-MIG is Germany\'s national implementing law: it names the Bundesnetzagentur as lead German authority for the AI Act, alongside BaFin and BfArM for their sectors, and sets the national procedure and penalties. Both apply together, one does not replace the other.',
      de: 'Der EU AI Act ist die zugrunde liegende EU-Verordnung, in allen Mitgliedstaaten wortgleich. Das KI-MIG ist Deutschlands nationales Durchfuehrungsgesetz: Es benennt die Bundesnetzagentur als federfuehrende deutsche Behoerde fuer den AI Act, neben BaFin und BfArM fuer ihre Sektoren, und regelt Verfahren und Sanktionen auf nationaler Ebene. Beide gelten gemeinsam, keines ersetzt das andere.',
    },
  },
  {
    id: 'gdpr-compliant-software',
    q: { en: 'Is Compliance Check GDPR compliant AI governance software?', de: 'Ist Compliance Check DSGVO-konforme KI-Governance-Software?' },
    a: {
      en: 'Strictly speaking, software cannot be "compliant", only how it processes data can. Compliance Check helps you document and work through your own GDPR obligations for each AI system, and the platform itself is held to the same standard: AES-256-GCM field encryption per organisation, EU-only hosting, and self-service data rights under Art. 15, 17 and 20 GDPR. The full detail is on the Security and GDPR page.',
      de: 'Streng genommen kann Software nicht "konform" sein, nur die Art, wie sie Daten verarbeitet. Compliance Check hilft Ihnen, Ihre eigenen DSGVO-Pflichten je KI-System zu dokumentieren und abzuarbeiten, und die Plattform selbst haelt denselben Massstab ein: Feldverschluesselung mit AES-256-GCM pro Organisation, ausschliesslich EU-Hosting und Betroffenenrechte im Selbstbedienungsprinzip nach Art. 15, 17 und 20 DSGVO. Alle Details stehen auf der Seite Sicherheit und DSGVO.',
    },
  },
  {
    id: 'who-its-for',
    q: { en: 'Is this for a small company, or only large enterprises?', de: 'Ist das fuer kleine Unternehmen, oder nur fuer Konzerne?' },
    a: {
      en: 'Either. It works for a five-person startup registering its first AI system just as well as a larger company managing dozens. What it is not is a general enterprise GRC platform: if you need broad ISO 27001 or SOC 2 programme management across all of IT, a dedicated GRC tool is the better fit. Compliance Check is scoped specifically to EU and German AI and data protection law.',
      de: 'Beides. Es funktioniert fuer ein fuenfkoepfiges Startup, das sein erstes KI-System registriert, ebenso wie fuer ein groesseres Unternehmen mit Dutzenden Systemen. Was es nicht ist: eine allgemeine Enterprise-GRC-Plattform. Wer umfassendes ISO-27001- oder SOC-2-Programmmanagement fuer die gesamte IT braucht, ist mit einem dedizierten GRC-Werkzeug besser bedient. Compliance Check ist gezielt auf EU- und deutsches KI- und Datenschutzrecht zugeschnitten.',
    },
  },
  {
    id: 'legal-advice',
    q: { en: 'Is this legal advice?', de: 'Ist das eine Rechtsberatung?' },
    a: {
      en: 'No. Compliance Check gives plain-language guidance for orientation. For binding interpretation of the law, consult a qualified lawyer.',
      de: 'Nein. Compliance Check bietet verstaendliche Hinweise zur Orientierung. Fuer eine verbindliche Auslegung des Rechts wenden Sie sich an eine qualifizierte Anwaeltin oder einen qualifizierten Anwalt.',
    },
  },
  {
    id: 'data-protection',
    q: { en: 'How is our data protected?', de: 'Wie werden unsere Daten geschuetzt?' },
    a: {
      en: 'Sensitive fields and uploaded documents are encrypted with a key unique to your organisation. Storage is encrypted at rest, backups run daily and are restore-tested, and you can export or permanently delete your data at any time.',
      de: 'Sensible Felder und hochgeladene Dokumente sind mit einem fuer Ihre Organisation eindeutigen Schluessel verschluesselt. Der Speicher ist im Ruhezustand verschluesselt, Backups laufen taeglich und werden auf Wiederherstellbarkeit getestet, und Sie koennen Ihre Daten jederzeit exportieren oder endgueltig loeschen.',
    },
  },
  {
    id: 'team',
    q: { en: 'Can our whole team use it?', de: 'Kann unser ganzes Team es nutzen?' },
    a: {
      en: 'Yes. Invite colleagues, assign checklist items to the right person, and comment on individual requirements as a team.',
      de: 'Ja. Laden Sie Kolleginnen und Kollegen ein, weisen Sie Checklistenpunkte der richtigen Person zu, und kommentieren Sie einzelne Anforderungen gemeinsam im Team.',
    },
  },
  {
    id: 'languages',
    q: { en: 'Is it available in German and English?', de: 'Gibt es die Plattform auf Deutsch und Englisch?' },
    a: {
      en: 'Yes, switch language at any time with the toggle in the top corner. All law summaries and checklists are maintained in both languages.',
      de: 'Ja, wechseln Sie die Sprache jederzeit ueber den Umschalter in der oberen Ecke. Alle Gesetzeszusammenfassungen und Checklisten werden in beiden Sprachen gepflegt.',
    },
  },
  {
    id: 'get-started',
    q: { en: 'How do we get started?', de: 'Wie fangen wir an?' },
    a: {
      en: 'Create an account, register your first AI system, and answer the risk questionnaire. The right checklist is built for you automatically.',
      de: 'Erstellen Sie ein Konto, legen Sie Ihr erstes KI-System an, und beantworten Sie den Risikofragebogen. Die passende Checkliste wird automatisch fuer Sie erstellt.',
    },
  },
  {
    id: 'leave',
    q: { en: 'What happens if we stop using it?', de: 'Was passiert, wenn wir die Nutzung beenden?' },
    a: {
      en: 'You can download a full export of everything held about your account or organisation, or delete it permanently, from Settings, at any time. Nothing is held back.',
      de: 'Sie koennen jederzeit in den Einstellungen einen vollstaendigen Export aller zu Ihrem Konto oder Ihrer Organisation gespeicherten Daten herunterladen oder diese endgueltig loeschen. Nichts wird zurueckgehalten.',
    },
  },
];

// Real person, real role, sourced from rit.services (the company's own site).
// Photo and logo are local copies in client/public, pulled from the same
// source. Bio is the company's own wording, translated for the German copy.
export const FOUNDER = {
  name: 'Matthias Wessner',
  photo: '/matthias-wessner.webp',
  title: { en: 'Managing Director & AI Strategist', de: 'Geschaeftsfuehrer & KI-Stratege' },
  bio: {
    en: 'Leads RIT and turns AI strategy into roadmaps that hold up in production.',
    de: 'Leitet RIT und macht aus KI-Strategie Fahrplaene, die auch im produktiven Einsatz halten.',
  },
};

export const ABOUT = {
  eyebrow: { en: 'About', de: 'Ueber uns' },
  title: { en: 'Built by RIT Services', de: 'Entwickelt von RIT Services' },
  intro: {
    en: 'Compliance Check is built by RIT Services, a software team based in Germany. We build practical tools for teams who have to meet real regulatory requirements, not just read about them.',
    de: 'Compliance Check wird von RIT Services entwickelt, einem Softwareteam mit Sitz in Deutschland. Wir bauen praktische Werkzeuge fuer Teams, die echte regulatorische Anforderungen erfuellen muessen, nicht nur darueber lesen.',
  },
  whySections: [
    {
      title: { en: 'Why we built this', de: 'Warum wir das gebaut haben' },
      body: {
        en: 'AI regulation in Germany is not one law. It is the EU AI Act layered on GDPR, layered on sector rules from BaFin, BfArM, and the states, each with its own deadlines and vocabulary. Reading it all is a project on its own. Compliance Check turns that into a checklist a team can actually work through.',
        de: 'KI-Regulierung in Deutschland ist kein einzelnes Gesetz. Es ist der EU AI Act, ueberlagert von der DSGVO, ueberlagert von Branchenregeln der BaFin, des BfArM und der Laender, jeweils mit eigenen Fristen und eigener Terminologie. Das alles zu lesen ist bereits ein Projekt fuer sich. Compliance Check macht daraus eine Checkliste, die ein Team tatsaechlich abarbeiten kann.',
      },
    },
    {
      title: { en: 'How we treat your data', de: 'Wie wir mit Ihren Daten umgehen' },
      body: {
        en: 'A compliance product has no business being careless with data. Everything runs on infrastructure hosted in the EU, sensitive content is encrypted per organisation, and the data rights we ask other companies to respect (access, export, deletion) are built into the product for you to use on your own account, not just promised in a policy.',
        de: 'Ein Compliance-Produkt darf mit Daten nicht sorglos umgehen. Alles laeuft auf Infrastruktur, die in der EU gehostet wird, sensible Inhalte sind pro Organisation verschluesselt, und die Betroffenenrechte, die wir von anderen Unternehmen einfordern (Auskunft, Export, Loeschung), sind fest im Produkt verankert, nicht nur in einer Richtlinie versprochen.',
      },
    },
    {
      title: { en: 'Where it is going', de: 'Wohin es sich entwickelt' },
      body: {
        en: 'The catalogue of laws is data, not hardcoded logic, so it grows without a rewrite: new frameworks, updated deadlines, and new jurisdictions get added as the underlying law changes.',
        de: 'Der Gesetzeskatalog liegt als Daten vor, nicht als fest codierte Logik, und waechst deshalb ohne Neuprogrammierung: neue Regelwerke, aktualisierte Fristen und neue Rechtsraeume werden ergaenzt, sobald sich das zugrunde liegende Recht aendert.',
      },
    },
  ],
};

// Rendered as a plain external link in the footer brand column, not through
// react-router (it leaves the app).
export const RIT_SERVICES_URL = 'https://rit.services';

export const FOOTER = {
  tagline: {
    en: 'Plain-language AI compliance for companies in Germany.',
    de: 'Verstaendliche KI-Compliance fuer Unternehmen in Deutschland.',
  },
  columns: [
    {
      title: { en: 'Product', de: 'Produkt' },
      links: [
        { label: { en: 'Overview', de: 'Uebersicht' }, to: '/welcome' },
        { label: { en: 'How it works', de: 'So funktioniert es' }, to: '/welcome#how-it-works' },
        { label: { en: 'Documentation', de: 'Dokumentation' }, to: '/docs' },
        { label: { en: 'Frameworks', de: 'Regelwerke' }, to: '/welcome#frameworks' },
        { label: { en: 'Security', de: 'Sicherheit' }, to: '/security' },
        { label: { en: 'GDPR', de: 'DSGVO' }, to: '/security#gdpr' },
      ],
    },
    {
      title: { en: 'Company', de: 'Unternehmen' },
      links: [
        { label: { en: 'About', de: 'Ueber uns' }, to: '/about' },
        { label: { en: 'FAQ', de: 'FAQ' }, to: '/welcome#faq' },
        { label: { en: 'Sign in', de: 'Anmelden' }, to: '/login' },
        { label: { en: 'Create account', de: 'Konto erstellen' }, to: '/register' },
      ],
    },
    {
      title: { en: 'Legal', de: 'Rechtliches' },
      links: [
        { label: { en: 'Privacy', de: 'Datenschutz' }, to: '/privacy' },
        { label: { en: 'Imprint', de: 'Impressum' }, to: '/impressum' },
      ],
    },
  ],
  copyright: {
    en: 'RIT Services. All rights reserved.',
    de: 'RIT Services. Alle Rechte vorbehalten.',
  },
};

// A small proof band under the hero. Every number here is real and checkable
// from the catalogue or the codebase, not a rounded marketing guess.
export const STATS = [
  { value: '37', label: { en: 'laws in the library', de: 'Gesetze in der Bibliothek' } },
  { value: '4', label: { en: 'AI risk categories', de: 'KI-Risikokategorien' } },
  { value: '2', label: { en: 'languages, EN and DE', de: 'Sprachen, DE und EN' } },
  { value: '24/7', label: { en: 'encrypted, backed up', de: 'verschluesselt, gesichert' } },
];

// The interactive risk-classification demo. Explanations are the plain
// wording the app itself shows once a system is classified, so this is not a
// simplified marketing version, it is the real output.
export const CLASSIFICATION_DEMO = [
  {
    id: 'prohibited',
    label: { en: 'Prohibited', de: 'Verboten' },
    chip: 'chip-red',
    example: {
      en: 'Example: a tool that scores people by social behaviour, or generates non-consensual intimate imagery.',
      de: 'Beispiel: ein Werkzeug, das Menschen nach Sozialverhalten bewertet, oder nicht einvernehmliche intime Aufnahmen erzeugt.',
    },
    explanation: {
      en: 'The system falls under a banned practice of the AI Act (Art. 5): social scoring, manipulation, banned biometric uses, predictive policing, or generating child sexual abuse material or non-consensual intimate imagery. Prohibited, review urgently and get legal advice.',
      de: 'Das System faellt unter eine verbotene Praktik des AI Act (Art. 5): Social Scoring, Manipulation, verbotene biometrische Nutzung, vorausschauende Polizeiarbeit oder das Erzeugen von Material zu sexuellem Kindesmissbrauch oder nicht einvernehmlichen intimen Aufnahmen. Verboten, dringend pruefen und rechtlich beraten lassen.',
    },
  },
  {
    id: 'high',
    label: { en: 'High risk', de: 'Hohes Risiko' },
    chip: 'chip-amber',
    example: {
      en: 'Example: AI used in recruitment, credit scoring, or as a safety component in machinery.',
      de: 'Beispiel: KI bei der Personalauswahl, Kreditwuerdigkeitspruefung, oder als Sicherheitsbauteil in Maschinen.',
    },
    explanation: {
      en: 'The system is used in a high-risk area listed in Annex III, or as a product safety component. The full set of high-risk duties applies: risk management, data governance, technical documentation, human oversight, and accuracy and security testing.',
      de: 'Das System wird in einem Hochrisikobereich nach Anhang III eingesetzt, oder als Sicherheitsbauteil eines Produkts. Es gelten alle Hochrisiko-Pflichten: Risikomanagement, Daten-Governance, technische Dokumentation, menschliche Aufsicht sowie Genauigkeits- und Sicherheitstests.',
    },
  },
  {
    id: 'limited',
    label: { en: 'Limited risk', de: 'Begrenztes Risiko' },
    chip: 'chip-navy',
    example: {
      en: 'Example: a chatbot, or a tool that generates text, images, or audio.',
      de: 'Beispiel: ein Chatbot, oder ein Werkzeug, das Text, Bilder oder Audio erzeugt.',
    },
    explanation: {
      en: 'The system interacts with people or generates content, so limited-risk transparency rules apply (Art. 50). You must tell people they are dealing with AI, and label AI-generated content.',
      de: 'Das System interagiert mit Menschen oder erzeugt Inhalte, daher gelten die Transparenzpflichten fuer begrenztes Risiko (Art. 50). Sie muessen Menschen mitteilen, dass sie es mit KI zu tun haben, und KI-generierte Inhalte kennzeichnen.',
    },
  },
  {
    id: 'minimal',
    label: { en: 'Minimal risk', de: 'Minimales Risiko' },
    chip: 'chip-green',
    example: {
      en: 'Example: a spam filter, or an internal tool that sorts spreadsheet rows.',
      de: 'Beispiel: ein Spamfilter, oder ein internes Werkzeug, das Tabellenzeilen sortiert.',
    },
    explanation: {
      en: 'No banned practice, high-risk area, or transparency trigger applies. Minimal-risk systems carry no mandatory EU AI Act duties, though documenting your reasoning is still good practice.',
      de: 'Keine verbotene Praktik, kein Hochrisikobereich und keine Transparenzpflicht greift. Fuer Systeme mit minimalem Risiko gelten keine Pflichten nach dem AI Act, eine kurze Dokumentation der Einschaetzung bleibt trotzdem sinnvoll.',
    },
  },
];

// The GDPR / security page. Structured as question-then-answer, same shape as
// a typical vendor trust page. Written to be accurate about the current state
// of the product, not aspirational: where something is genuinely in progress
// it says so, rather than implying a certification or process that does not
// exist yet.
export const GDPR_LAST_REVIEWED = { en: '24 August 2026', de: '24. August 2026' };

// group: 'pillar' cards are the positive, concrete facts, shown up front in a
// grid. 'straight' entries are the ones a real vendor page usually buries or
// omits (certifications, DPA, breach process); shown just as visibly, in
// their own section, because that is the point of being upfront.
// stat: a short highlighted headline shown above the card body.
// icon: lucide-react component name, rendered by Security.jsx.
export const GDPR_SECTIONS = [
  {
    id: 'roles',
    color: 'navy',
    group: 'pillar',
    icon: 'Scale',
    stat: { en: 'Processor and controller', de: 'Auftragsverarbeiter und Verantwortlicher' },
    q: { en: 'Are you a data processor or a data controller?', de: 'Seid ihr Auftragsverarbeiter oder Verantwortlicher?' },
    a: {
      en: 'Both, depending on the data. For the compliance content you store (AI systems, assessments, documents, checklist answers), we act as a processor on your instructions, under Art. 28 GDPR. For your account information (name, email address, login activity), we act as controller, since we decide why that data is collected.',
      de: 'Beides, je nach Datenart. Fuer die Compliance-Inhalte, die Sie speichern (KI-Systeme, Bewertungen, Dokumente, Checklistenantworten), sind wir Auftragsverarbeiter nach Ihren Weisungen gemaess Art. 28 DSGVO. Fuer Ihre Kontodaten (Name, E-Mail-Adresse, Anmeldeaktivitaet) sind wir Verantwortlicher, da wir ueber den Zweck dieser Datenerhebung entscheiden.',
    },
  },
  {
    id: 'encryption',
    color: 'green',
    group: 'pillar',
    icon: 'KeyRound',
    stat: { en: 'AES-256-GCM, per organisation', de: 'AES-256-GCM, pro Organisation' },
    q: { en: 'How is data encrypted?', de: 'Wie werden Daten verschluesselt?' },
    a: {
      en: 'Every organisation has its own encryption key, wrapped by a master key, used to encrypt sensitive fields (AES-256-GCM) such as AI system descriptions, checklist documentation, and data protection profiles. Uploaded documents are encrypted the same way before they are written to disk. The underlying storage volumes are themselves encrypted at rest. All traffic between your browser and the application runs over TLS.',
      de: 'Jede Organisation hat einen eigenen Verschluesselungsschluessel, der mit einem Hauptschluessel geschuetzt ist, und damit werden sensible Felder verschluesselt (AES-256-GCM), etwa Beschreibungen von KI-Systemen, Checklistendokumentation und Datenschutzprofile. Hochgeladene Dokumente werden auf dieselbe Weise verschluesselt, bevor sie gespeichert werden. Die zugrunde liegenden Speichervolumen sind selbst im Ruhezustand verschluesselt. Der gesamte Datenverkehr zwischen Ihrem Browser und der Anwendung laeuft ueber TLS.',
    },
  },
  {
    id: 'hosting',
    color: 'navy',
    group: 'pillar',
    icon: 'Globe',
    stat: { en: 'EU only, always', de: 'Ausschliesslich EU' },
    q: { en: 'Where is data hosted?', de: 'Wo werden die Daten gehostet?' },
    a: {
      en: 'Entirely within the European Union, on infrastructure from Hetzner and Strato, both German hosting providers, across data centres in Germany and Finland. No customer data leaves the EU for storage or processing.',
      de: 'Vollstaendig innerhalb der Europaeischen Union, auf Infrastruktur von Hetzner und Strato, beides deutsche Hosting-Anbieter, in Rechenzentren in Deutschland und Finnland. Keine Kundendaten verlassen die EU zur Speicherung oder Verarbeitung.',
    },
  },
  {
    id: 'backups',
    color: 'green',
    group: 'pillar',
    icon: 'Database',
    stat: { en: 'Daily, encrypted, restore-tested', de: 'Taeglich, verschluesselt, getestet' },
    q: { en: 'What happens if something goes wrong?', de: 'Was passiert, wenn etwas schiefgeht?' },
    a: {
      en: 'Encrypted backups run daily and are kept for 30 days. Restores are tested, not just assumed to work: a full restore into an isolated database is verified periodically, checking that every row, including encrypted fields, comes back intact.',
      de: 'Verschluesselte Backups laufen taeglich und werden 30 Tage aufbewahrt. Wiederherstellungen werden getestet, nicht nur angenommen: Eine vollstaendige Wiederherstellung in eine isolierte Datenbank wird regelmaessig geprueft, einschliesslich der Kontrolle, dass auch verschluesselte Felder unversehrt zurueckkommen.',
    },
  },
  {
    id: 'rights',
    color: 'green',
    group: 'pillar',
    icon: 'UserCheck',
    stat: { en: 'Self-service, no request needed', de: 'Selbstbedienung, ohne Anfrage' },
    q: { en: 'How do we exercise our data subject rights?', de: 'Wie ueben wir unsere Betroffenenrechte aus?' },
    a: {
      en: 'Directly in the product, self-service, no request needed. From Settings, you can download a full export of everything held about your account (Art. 15 and 20), or permanently delete your account or your entire organisation (Art. 17). Organisation deletion also destroys the encryption key, so the data is unrecoverable even from a backup taken before the request.',
      de: 'Direkt im Produkt, ohne Anfrage, im Selbstbedienungsprinzip. In den Einstellungen koennen Sie einen vollstaendigen Export aller zu Ihrem Konto gespeicherten Daten herunterladen (Art. 15 und 20) oder Ihr Konto beziehungsweise Ihre gesamte Organisation endgueltig loeschen (Art. 17). Die Loeschung einer Organisation vernichtet auch den Verschluesselungsschluessel, sodass die Daten selbst aus einem zuvor erstellten Backup nicht wiederhergestellt werden koennen.',
    },
  },
  {
    id: 'retention',
    color: 'navy',
    group: 'pillar',
    icon: 'Clock',
    stat: { en: '365, 90, 180, 7 days', de: '365, 90, 180, 7 Tage' },
    q: { en: 'How long is data kept?', de: 'Wie lange werden Daten aufbewahrt?' },
    a: {
      en: 'Your compliance records (AI systems, assessments, documents) are kept for as long as your account exists, since that is the point of the product. Operational data with a shorter natural lifespan is pruned automatically: audit log entries after 365 days, used or expired email verification tokens after 7 days, declined or accepted invitations after 90 days, and read notifications after 180 days.',
      de: 'Ihre Compliance-Datensaetze (KI-Systeme, Bewertungen, Dokumente) werden aufbewahrt, solange Ihr Konto besteht, das ist der Zweck des Produkts. Betriebsdaten mit kuerzerer natuerlicher Lebensdauer werden automatisch entfernt: Protokolleintraege nach 365 Tagen, genutzte oder abgelaufene E-Mail-Verifizierungstoken nach 7 Tagen, abgelehnte oder angenommene Einladungen nach 90 Tagen und gelesene Benachrichtigungen nach 180 Tagen.',
    },
  },
  {
    id: 'subprocessors',
    color: 'gold',
    group: 'pillar',
    icon: 'Share2',
    stat: { en: 'Three, named, kept short', de: 'Drei, namentlich, bewusst kurz' },
    q: { en: 'Who are the sub-processors?', de: 'Wer sind die Auftragsverarbeiter?' },
    a: {
      en: 'Hetzner and Strato for hosting (Germany, Finland), and Resend for transactional email delivery (account verification, password reset, review reminders). We keep this list short on purpose.',
      de: 'Hetzner und Strato fuer das Hosting (Deutschland, Finnland), sowie Resend fuer den Versand transaktionaler E-Mails (Kontoverifizierung, Passwort-Reset, Erinnerungen an Pruefungen). Diese Liste halten wir bewusst kurz.',
    },
  },
  {
    id: 'breach',
    group: 'straight',
    icon: 'AlertTriangle',
    q: { en: 'What if there is a personal data breach?', de: 'Was passiert bei einer Datenschutzverletzung?' },
    a: {
      en: 'We notify affected customers without undue delay, as required by Art. 33 and 34 GDPR, and cooperate on whatever your own notification obligations require.',
      de: 'Wir benachrichtigen betroffene Kunden unverzueglich, wie es Art. 33 und 34 DSGVO vorschreiben, und unterstuetzen bei allem, was Ihre eigenen Meldepflichten erfordern.',
    },
  },
  {
    id: 'dpa',
    group: 'straight',
    icon: 'FileText',
    q: { en: 'Can we get a Data Processing Agreement?', de: 'Koennen wir eine Auftragsverarbeitungsvereinbarung erhalten?' },
    a: {
      en: 'Yes, contact us and we will provide one. It is not yet an automatic step in account creation.',
      de: 'Ja, kontaktieren Sie uns, wir stellen eine bereit. Das ist noch kein automatischer Schritt bei der Kontoerstellung.',
    },
  },
  {
    id: 'certifications',
    group: 'straight',
    icon: 'BadgeCheck',
    q: { en: 'Are you SOC 2 or ISO 27001 certified?', de: 'Seid ihr SOC-2- oder ISO-27001-zertifiziert?' },
    a: {
      en: 'Not yet, and we would rather say that plainly than let a badge imply more than is true. What is real today is described on this page: per-organisation encryption, encrypted storage, tested backups, EU-only hosting, and self-service data rights.',
      de: 'Noch nicht, und das sagen wir lieber offen, statt mit einem Zertifikat mehr zu suggerieren als zutrifft. Was heute tatsaechlich zutrifft, steht auf dieser Seite: Verschluesselung pro Organisation, verschluesselter Speicher, getestete Backups, ausschliesslich EU-Hosting und Betroffenenrechte im Selbstbedienungsprinzip.',
    },
  },
  {
    id: 'legal-advice',
    group: 'straight',
    icon: 'ClipboardList',
    q: { en: 'Does using Compliance Check make us GDPR compliant?', de: 'Macht die Nutzung von Compliance Check uns DSGVO-konform?' },
    a: {
      en: 'No single tool can promise that. Compliance Check helps you document and work through your obligations; whether your organisation is actually compliant still depends on how you use it and on your own legal judgement. For binding interpretation, consult a qualified lawyer.',
      de: 'Kein einzelnes Werkzeug kann das versprechen. Compliance Check hilft Ihnen, Ihre Pflichten zu dokumentieren und abzuarbeiten. Ob Ihre Organisation tatsaechlich konform ist, haengt weiterhin davon ab, wie Sie es nutzen, und von Ihrer eigenen rechtlichen Einschaetzung. Fuer eine verbindliche Auslegung wenden Sie sich an eine qualifizierte Anwaeltin oder einen qualifizierten Anwalt.',
    },
  },
];

// GDPR_INTRO replaces the old "commitment" list entry: the lead statement
// shown under the page header, above the pillar grid, not as a card.
export const GDPR_INTRO = {
  en: 'Compliance Check exists to help other companies meet regulatory obligations, so it has to hold itself to at least the same standard with your data. What follows is what is actually true today, not a statement of intent. Where something is still in progress, this page says so, in the section below marked Straight answers.',
  de: 'Compliance Check hilft anderen Unternehmen dabei, regulatorische Pflichten zu erfuellen, und muss deshalb selbst mindestens den gleichen Massstab an Ihre Daten anlegen. Im Folgenden steht, was heute tatsaechlich zutrifft, keine Absichtserklaerung. Wo etwas noch in Arbeit ist, steht das im Abschnitt Ehrliche Antworten weiter unten.',
};

// The Documentation page (Documentation.jsx). One section per feature of the
// authenticated app, each paired with a real screenshot from the live
// product (client/public/docs/), not a stylised mock like FEATURE_ROWS
// above. `body` is an array of paragraphs per language, rendered as separate
// <p> tags, so a section can go into real depth instead of one summary
// sentence. Body and point text may contain **bold** markers, parsed by
// utils/renderBold.jsx into real <strong> elements for the words that
// genuinely need emphasis, a feature name, a hard number, a required
// action, not decoration. Every added fact below is one already established
// elsewhere in this file or genuinely visible on the linked screenshot, none
// of it is invented for length.
export const DOCS_HERO = {
  eyebrow: { en: 'Documentation', de: 'Dokumentation' },
  title: {
    en: 'Every feature of Compliance Check, explained in detail',
    de: 'Jede Funktion von Compliance Check, im Detail erklaert',
  },
  subtitle: {
    en: 'This page walks through the product screen by screen: what each part does, why it exists, and how it maps back to the EU AI Act, GDPR, and the rest of the 37 laws in the library. Every screenshot below is real, taken directly from the live application, not a mockup.',
    de: 'Diese Seite fuehrt Bildschirm fuer Bildschirm durch das Produkt: was jeder Teil tut, warum es ihn gibt, und wie er sich auf den EU AI Act, die DSGVO und die uebrigen 37 Gesetze in der Bibliothek zurueckfuehren laesst. Jeder Screenshot unten ist echt, direkt aus der laufenden Anwendung, kein Mockup.',
  },
};

export const DOCS_SECTIONS = [
  {
    id: 'dashboard',
    eyebrow: { en: 'Overview', de: 'Uebersicht' },
    title: { en: 'Dashboard: your compliance standing at a glance', de: 'Dashboard: Ihr Compliance-Stand auf einen Blick' },
    body: {
      en: [
        'The dashboard is the first thing you see after signing in, and it answers one question immediately: where does your organisation actually stand. A single **compliance standing** percentage sits next to your system count, your open checklist items, and how many reviews are due, so there is nothing to reconstruct from memory or a side spreadsheet.',
        'The four figures beside it are pulled from the same data the rest of the app uses, not a separate summary someone has to keep updated by hand. **Reviews due** matches exactly what the daily reminder job is about to notify you about, and **open items by severity** separates mandatory gaps from merely recommended ones, so a busy week gets spent on the right five items, not just any five. Two export buttons next to Register an AI system turn the same numbers into a PDF for leadership or an auditor, or a CSV for anyone who wants to build their own tracking on top of it.',
      ],
      de: [
        'Das Dashboard ist das Erste, was Sie nach der Anmeldung sehen, und es beantwortet sofort eine Frage: Wo steht Ihre Organisation tatsaechlich. Eine einzelne **Compliance-Stand**-Prozentzahl steht direkt neben Ihrer Systemanzahl, den offenen Checklistenpunkten und den faelligen Pruefungen, sodass nichts aus dem Gedaechtnis oder einer separaten Tabelle rekonstruiert werden muss.',
        'Die vier Zahlen daneben stammen aus denselben Daten, die auch der Rest der App nutzt, keine separate Zusammenfassung, die von Hand gepflegt werden muss. **Faellige Pruefungen** entspricht genau dem, worueber der taegliche Erinnerungsjob gleich benachrichtigt, und **offene Punkte nach Schweregrad** trennt verpflichtende Luecken von nur empfohlenen, damit eine arbeitsreiche Woche fuer die richtigen fuenf Punkte genutzt wird, nicht irgendwelche fuenf. Zwei Export-Buttons neben KI-System registrieren machen aus denselben Zahlen ein PDF fuer die Leitung oder einen Pruefer, oder ein CSV fuer eigenes Tracking.',
      ],
    },
    points: [
      {
        en: '**Risk overview**: how many of your AI systems are high, limited, or minimal risk, at a glance.',
        de: '**Risikouebersicht**: wie viele Ihrer KI-Systeme hohes, begrenztes oder minimales Risiko haben, auf einen Blick.',
      },
      {
        en: '**Framework progress**: a percentage bar per law, EU AI Act, GDPR, NIS2, CRA and more, showing how far you have worked through each one.',
        de: '**Fortschritt je Regelwerk**: ein Prozentbalken pro Gesetz, EU AI Act, DSGVO, NIS2, CRA und mehr, der zeigt, wie weit Sie jeweils sind.',
      },
      {
        en: '**Open items by severity**: mandatory, recommended, and informational items, counted separately so you know what actually blocks compliance.',
        de: '**Offene Punkte nach Schweregrad**: verpflichtend, empfohlen und informativ, getrennt gezaehlt, damit klar ist, was tatsaechlich blockiert.',
      },
      {
        en: '**Recent activity**: a live feed of who did what and when, pulled straight from the audit log.',
        de: '**Letzte Aktivitaeten**: ein laufender Verlauf, wer was wann getan hat, direkt aus dem Audit-Log.',
      },
      {
        en: '**Export a report or CSV**: hand a PDF summary to leadership or an auditor, or a CSV of the same figures to build your own tracking on top of.',
        de: '**Bericht oder CSV exportieren**: ein PDF fuer die Leitung oder einen Pruefer, oder ein CSV derselben Zahlen fuer eigenes Tracking.',
      },
    ],
    shots: [
      { src: '/docs/dashboard.png', w: 1440, h: 1191, alt: { en: 'The Compliance Check dashboard, showing compliance standing, AI system counts, framework progress and recent activity', de: 'Das Compliance Check Dashboard mit Compliance-Stand, Anzahl der KI-Systeme, Fortschritt je Regelwerk und letzten Aktivitaeten' } },
    ],
  },
  {
    id: 'ai-systems',
    eyebrow: { en: 'AI system inventory', de: 'KI-System-Inventar' },
    title: { en: 'AI Systems: register everything you build or use', de: 'KI-Systeme: alles registrieren, was Sie bauen oder nutzen' },
    body: {
      en: [
        'Every AI system your company builds in-house or buys from a vendor gets its own record here: name, purpose, vendor, and lifecycle stage. This inventory is the starting point for everything else in the product. A system cannot be classified or checked off until it exists here.',
        'The table itself doubles as a status board: risk level, vendor, lifecycle stage, how many assessments are attached, and when the system was last classified, all visible without opening a single record. That starts to matter once you are past two or three systems, a five-person startup with one chatbot does not need this, but a company running a dozen AI tools across departments does, and the list is built to stay readable at either scale.',
      ],
      de: [
        'Jedes KI-System, das Ihr Unternehmen selbst entwickelt oder bei einem Anbieter einkauft, erhaelt hier einen eigenen Datensatz: Name, Zweck, Anbieter und Lebenszyklusphase. Dieses Inventar ist der Ausgangspunkt fuer alles Weitere im Produkt. Ein System kann erst eingestuft oder abgearbeitet werden, wenn es hier existiert.',
        'Die Tabelle selbst dient zugleich als Statusuebersicht: Risikostufe, Anbieter, Lebenszyklusphase, Anzahl der zugehoerigen Bewertungen und das Datum der letzten Einstufung, alles sichtbar ohne einen einzigen Datensatz zu oeffnen. Das wird relevant, sobald Sie mehr als zwei oder drei Systeme fuehren, ein fuenfkoepfiges Startup mit einem Chatbot braucht das nicht, ein Unternehmen mit einem Dutzend KI-Werkzeugen ueber mehrere Abteilungen hinweg schon, und die Liste bleibt auf beiden Groessenordnungen uebersichtlich.',
      ],
    },
    points: [
      {
        en: '**Works the same for both**: an in-house model and a third-party tool are registered the same way.',
        de: '**Funktioniert fuer beides gleich**: ein intern entwickeltes Modell und ein Werkzeug eines Anbieters werden gleich registriert.',
      },
      {
        en: '**Risk level and stage shown at a glance**: high, limited, or minimal risk, alongside whether the system is planned, deployed, or retired.',
        de: '**Risikostufe und Phase auf einen Blick**: hohes, begrenztes oder minimales Risiko, dazu ob das System geplant, im Einsatz oder ausgemustert ist.',
      },
      {
        en: '**A minute to register**: name, purpose and a short description is enough to get started. Classification comes next.',
        de: '**In einer Minute registriert**: Name, Zweck und eine kurze Beschreibung reichen zum Start. Die Einstufung folgt danach.',
      },
      {
        en: '**Doubles as a status board**: risk level, vendor, stage, assessment count, and classification date, all visible without opening a record.',
        de: '**Dient als Statusuebersicht**: Risikostufe, Anbieter, Phase, Anzahl der Bewertungen und Einstufungsdatum, alles sichtbar ohne einen Datensatz zu oeffnen.',
      },
    ],
    shots: [
      { src: '/docs/ai-systems-list.png', w: 1440, h: 900, alt: { en: 'The AI Systems inventory list, showing three registered systems with their risk levels, vendor and deployment stage', de: 'Die Liste der registrierten KI-Systeme mit Risikostufe, Anbieter und Einsatzphase' } },
    ],
  },
  {
    id: 'classification',
    eyebrow: { en: 'Risk classification', de: 'Risikoeinstufung' },
    title: { en: 'Classification: the EU AI Act questionnaire, made concrete', de: 'Einstufung: der EU AI Act als konkreter Fragebogen' },
    body: {
      en: [
        'Instead of asking you to interpret Article 5 and Annex III of the AI Act yourself, Compliance Check asks a series of plain **yes or no questions**, grouped into banned-use checks, high-risk checks, and transparency checks. Each question links back to the exact article that triggers it, and the system is classified the moment you submit your answers.',
        'The three groups run in a deliberate order. Banned-use checks come first because a "yes" there ends the process immediately, an AI system used for social scoring or banned biometric surveillance is not a compliance project to schedule, it is a system that should not be deployed. High-risk checks follow Annex III\'s own structure closely: recruitment and employment, credit and essential services, education, law enforcement, migration and justice, and safety components in regulated products each get their own question rather than one vague "is this high-risk" prompt. A system can trigger more than one group at once, an HR chatbot, for example, can be both high-risk (Annex III, recruitment) and subject to the transparency duties in Article 50, and both checklists get built for it.',
      ],
      de: [
        'Statt Sie Artikel 5 und Anhang III des AI Act selbst auslegen zu lassen, stellt Compliance Check eine Reihe klarer **Ja- oder Nein-Fragen**, gegliedert in Verbotspruefungen, Hochrisikopruefungen und Transparenzpruefungen. Jede Frage verweist auf den genauen Artikel, der sie ausloest, und das System wird direkt nach dem Absenden der Antworten eingestuft.',
        'Die drei Gruppen laufen in bewusster Reihenfolge. Verbotspruefungen kommen zuerst, weil ein "Ja" dort den Prozess sofort beendet, ein KI-System fuer Social Scoring oder verbotene biometrische Ueberwachung ist kein Compliance-Projekt zum Einplanen, sondern ein System, das nicht eingesetzt werden sollte. Hochrisikopruefungen folgen eng der Struktur von Anhang III: Personalauswahl und Beschaeftigung, Kreditwuerdigkeit und wesentliche Dienstleistungen, Bildung, Strafverfolgung, Migration und Justiz sowie Sicherheitsbauteile in regulierten Produkten erhalten jeweils eine eigene Frage statt einer vagen "ist das Hochrisiko"-Frage. Ein System kann mehrere Gruppen gleichzeitig ausloesen, ein HR-Chatbot etwa kann zugleich Hochrisiko (Anhang III, Personalauswahl) und transparenzpflichtig nach Art. 50 sein, beide Checklisten werden dann erstellt.',
      ],
    },
    points: [
      {
        en: '**Banned-use checks come first**: including the newer prohibitions on AI-generated child sexual abuse material and non-consensual intimate imagery, added by the Digital Omnibus.',
        de: '**Verbotspruefungen zuerst**: einschliesslich der neueren Verbote fuer KI-generiertes Material zu sexuellem Kindesmissbrauch und nicht einvernehmliche intime Aufnahmen, ergaenzt durch den Digital Omnibus.',
      },
      {
        en: '**High-risk checks**: cover Annex III areas such as recruitment, credit scoring, education, law enforcement, and safety components in products.',
        de: '**Hochrisikopruefungen**: decken Anhang-III-Bereiche wie Personalauswahl, Kreditwuerdigkeitspruefung, Bildung, Strafverfolgung und Sicherheitsbauteile in Produkten ab.',
      },
      {
        en: '**Transparency checks**: catch chatbots and content-generating systems that trigger the lighter Article 50 duties instead.',
        de: '**Transparenzpruefungen**: erfassen Chatbots und inhaltserzeugende Systeme, fuer die stattdessen die leichteren Pflichten aus Art. 50 gelten.',
      },
      {
        en: '**Answered once, explained clearly**: the result comes with a plain-language reason, not just a label, and the right checklists are built automatically.',
        de: '**Einmal beantwortet, klar erklaert**: das Ergebnis kommt mit einer verstaendlichen Begruendung, nicht nur mit einem Etikett, und die passenden Checklisten werden automatisch erstellt.',
      },
      {
        en: '**More than one outcome at once**: a system can be both high-risk and subject to transparency duties, for example an HR chatbot; both checklists are built.',
        de: '**Mehrere Ergebnisse gleichzeitig moeglich**: ein System kann zugleich Hochrisiko und transparenzpflichtig sein, etwa ein HR-Chatbot; beide Checklisten werden erstellt.',
      },
    ],
    shots: [
      { src: '/docs/classification-wizard.png', w: 1440, h: 3157, alt: { en: 'The AI system classification questionnaire, showing banned-use, high-risk and transparency check questions with EU AI Act article references', de: 'Der Einstufungsfragebogen mit Verbots-, Hochrisiko- und Transparenzpruefungen samt Verweisen auf den EU AI Act' } },
    ],
  },
  {
    id: 'ai-system-detail',
    eyebrow: { en: 'AI system profile', de: 'KI-System-Profil' },
    title: { en: 'AI System Profile: one record, every obligation', de: 'KI-System-Profil: ein Datensatz, alle Pflichten' },
    body: {
      en: [
        'Open a single AI system and you see its full compliance picture in one place: its risk level, the plain-language reason it was classified that way, and every assessment attached to it, across every applicable framework. A high-risk recruitment tool and a limited-risk chat assistant look genuinely different here, because their legal obligations are genuinely different.',
        'Re-classifying does not start from a blank page either, your previous answers are there to adjust, not re-enter from scratch. That matters in practice: a system\'s purpose does genuinely change, a tool that started as an internal notes summariser can end up processing customer support tickets six months later, and the classification needs to catch up when that happens, not stay frozen at whatever it was on day one. A **Data protection profile** button on the same page opens the system\'s GDPR-specific detail, purpose, legal basis, data categories, retention, kept separate from the AI Act classification because the two run on different legal bases and different review cycles.',
      ],
      de: [
        'Oeffnen Sie ein einzelnes KI-System und Sie sehen sein vollstaendiges Compliance-Bild an einem Ort: Risikostufe, die verstaendliche Begruendung der Einstufung und jede zugehoerige Bewertung, ueber alle anwendbaren Regelwerke hinweg. Ein Hochrisiko-Werkzeug fuer die Personalauswahl und ein Chat-Assistent mit begrenztem Risiko sehen hier wirklich unterschiedlich aus, weil ihre rechtlichen Pflichten wirklich unterschiedlich sind.',
        'Auch eine Neueinstufung beginnt nicht bei null, Ihre vorherigen Antworten stehen zur Anpassung bereit, statt von Grund auf neu erfasst zu werden. Das ist in der Praxis wichtig: Der Zweck eines Systems aendert sich tatsaechlich, ein Werkzeug, das als interner Notizen-Zusammenfasser begann, kann sechs Monate spaeter Kundensupport-Anfragen verarbeiten, und die Einstufung muss das nachvollziehen, statt beim Stand des ersten Tages einzufrieren. Ein Button **Datenschutzprofil** auf derselben Seite oeffnet das DSGVO-spezifische Detail des Systems, Zweck, Rechtsgrundlage, Datenkategorien, Aufbewahrung, getrennt von der AI-Act-Einstufung gefuehrt, da beide auf unterschiedlichen Rechtsgrundlagen und Pruefzyklen beruhen.',
      ],
    },
    points: [
      {
        en: '**The classification reason is never hidden**: a short paragraph explains exactly which rule applied, on the same page as the checklists it produced.',
        de: '**Die Einstufungsbegruendung bleibt sichtbar**: ein kurzer Absatz erklaert genau, welche Regel gegriffen hat, auf derselben Seite wie die daraus entstandenen Checklisten.',
      },
      {
        en: '**Every linked assessment in one table**: EU AI Act, GDPR, and any other framework the system triggers, with live status and progress.',
        de: '**Alle verknuepften Bewertungen in einer Tabelle**: EU AI Act, DSGVO und jedes weitere ausgeloeste Regelwerk, mit aktuellem Status und Fortschritt.',
      },
      {
        en: '**Re-classify at any time**: if a system\'s purpose changes, run the questionnaire again, your previous answers are there to adjust.',
        de: '**Jederzeit neu einstufen**: aendert sich der Zweck eines Systems, wird der Fragebogen einfach erneut beantwortet, die vorherigen Antworten stehen zur Anpassung bereit.',
      },
      {
        en: '**A GDPR profile, kept separate**: purpose, legal basis, data categories and retention live on their own Data protection profile page, since GDPR and the AI Act run on different legal bases.',
        de: '**Ein eigenes DSGVO-Profil**: Zweck, Rechtsgrundlage, Datenkategorien und Aufbewahrung liegen auf einer eigenen Datenschutzprofil-Seite, da DSGVO und AI Act auf unterschiedlichen Rechtsgrundlagen beruhen.',
      },
    ],
    shots: [
      { src: '/docs/ai-system-detail-high-risk.png', w: 1440, h: 900, alt: { en: 'A high-risk AI system profile, showing its classification reason and four linked compliance assessments', de: 'Ein Hochrisiko-KI-System-Profil mit Einstufungsbegruendung und vier verknuepften Bewertungen' } },
      { src: '/docs/ai-system-detail-limited-risk.png', w: 1440, h: 900, alt: { en: 'A limited-risk AI system profile, showing the lighter transparency obligation that applies instead', de: 'Ein Profil eines KI-Systems mit begrenztem Risiko und der stattdessen geltenden, leichteren Transparenzpflicht' } },
    ],
  },
  {
    id: 'checklist',
    eyebrow: { en: 'Checklists', de: 'Checklisten' },
    title: { en: 'Checklists: work through the law, one item at a time', de: 'Checklisten: das Gesetz Punkt fuer Punkt abarbeiten' },
    body: {
      en: [
        'Every requirement a framework imposes becomes one checklist item you can actually act on. Mark it **done**, **in progress**, or leave it open, write the documentation that proves it, assign it to a teammate, and attach evidence. A progress bar and a step tracker on the side keep the whole checklist visible while you work through it point by point.',
        'Opening a single point switches to a focused view: one requirement, its full explanation, the status you set, a text area for your documentation, an assignee picker drawn from your team, and a place to attach the file that proves it. A **Next point** button moves straight to the following requirement without a trip back to the overview table, so a busy compliance officer can work through fifteen requirements back to back without losing their place, and a small **saved** confirmation appears the moment your documentation text autosaves, so nothing is ever silently lost mid-sentence.',
      ],
      de: [
        'Jede Anforderung eines Regelwerks wird zu einem Checklistenpunkt, den Sie wirklich abarbeiten koennen. Markieren Sie ihn als **erledigt**, **in Bearbeitung** oder lassen Sie ihn offen, schreiben Sie die belegende Dokumentation, weisen Sie ihn einer Kollegin oder einem Kollegen zu, und haengen Sie Nachweise an. Ein Fortschrittsbalken und eine Schrittanzeige daneben halten die ganze Checkliste sichtbar, waehrend Sie sie Punkt fuer Punkt abarbeiten.',
        'Das Oeffnen eines einzelnen Punkts wechselt in eine fokussierte Ansicht: eine Anforderung, ihre vollstaendige Erklaerung, der von Ihnen gesetzte Status, ein Textfeld fuer Ihre Dokumentation, eine Zustaendigkeitsauswahl aus Ihrem Team, und ein Platz fuer die belegende Datei. Ein **Naechster Punkt**-Button springt direkt zur folgenden Anforderung, ohne einen Umweg ueber die Uebersichtstabelle, sodass eine vielbeschaeftigte Compliance-Verantwortliche fuenfzehn Anforderungen hintereinander abarbeiten kann, ohne den Ueberblick zu verlieren, und eine kleine **Gespeichert**-Bestaetigung erscheint in dem Moment, in dem Ihr Dokumentationstext automatisch gespeichert wird, sodass nie unbemerkt etwas mitten im Satz verloren geht.',
      ],
    },
    points: [
      {
        en: '**Required items are marked clearly**: so you always know what is mandatory versus recommended.',
        de: '**Pflichtpunkte sind klar markiert**: Sie sehen jederzeit, was verpflichtend und was nur empfohlen ist.',
      },
      {
        en: '**Autosave**: your documentation text saves automatically as you write it, with a visible confirmation.',
        de: '**Automatisches Speichern**: Ihr Dokumentationstext wird beim Schreiben automatisch gespeichert, mit sichtbarer Bestaetigung.',
      },
      {
        en: '**Comment on any item**: discuss a specific requirement with a teammate without leaving the page.',
        de: '**Jeden Punkt kommentieren**: eine konkrete Anforderung mit einer Kollegin oder einem Kollegen besprechen, ohne die Seite zu verlassen.',
      },
      {
        en: '**A focused, one-item-at-a-time view**: open a point and see just that requirement, its status, documentation, assignee and evidence, with a Next point button to keep moving.',
        de: '**Fokussierte Einzelansicht**: ein geoeffneter Punkt zeigt nur diese Anforderung mit Status, Dokumentation, Zustaendigkeit und Nachweis, dazu ein Weiter-Button fuer den naechsten Punkt.',
      },
    ],
    shots: [
      { src: '/docs/assessment-checklist.png', w: 1440, h: 900, alt: { en: 'A High-Risk AI Obligations checklist at 40 percent progress, with two items marked Done and a step tracker on the right', de: 'Eine Checkliste zu Hochrisiko-Pflichten bei 40 Prozent Fortschritt, mit zwei erledigten Punkten und einer Schrittanzeige rechts' } },
    ],
  },
  {
    id: 'assessments-overview',
    eyebrow: { en: 'Assessments', de: 'Bewertungen' },
    title: { en: 'Assessments: every checklist, across every system, in one view', de: 'Bewertungen: alle Checklisten, ueber alle Systeme, in einer Ansicht' },
    body: {
      en: [
        'Zoom out from a single checklist and the Assessments page groups every checklist you have, by AI system, plus an **organisation-wide** group for obligations that are not tied to one specific system, such as your NIS2 cybersecurity measures. Filter by system, see how many checklists are in progress, completed, or need review, and jump straight into any of them.',
        'A stat band at the top counts checklists, completed, in progress, and needing review, before you scroll to a single row, so a manager can see the state of the whole compliance programme without opening anything. Filter chips per AI system narrow the view instantly, and every row still carries its own **next review date**, so nothing here requires cross-referencing the Timeline separately just to know what is coming due.',
      ],
      de: [
        'Zoomen Sie aus einer einzelnen Checkliste heraus, und die Seite Bewertungen gruppiert alle Ihre Checklisten nach KI-System, dazu eine **organisationsweite** Gruppe fuer Pflichten, die nicht an ein bestimmtes System gebunden sind, etwa Ihre NIS2-Cybersicherheitsmassnahmen. Filtern Sie nach System, sehen Sie, wie viele Checklisten in Bearbeitung, abgeschlossen oder pruefungsbeduerftig sind, und springen Sie direkt in jede von ihnen.',
        'Eine Kennzahlenleiste oben zaehlt Checklisten, abgeschlossen, in Bearbeitung und pruefungsbeduerftig, noch bevor Sie zu einer einzigen Zeile scrollen, sodass eine Fuehrungskraft den Zustand des gesamten Compliance-Programms sieht, ohne etwas zu oeffnen. Filter-Chips je KI-System grenzen die Ansicht sofort ein, und jede Zeile traegt weiterhin ihr eigenes **naechstes Pruefdatum**, sodass hierfuer kein separater Abgleich mit der Zeitleiste noetig ist.',
      ],
    },
    points: [
      {
        en: '**Grouped by system, and by framework within each system**: EU AI Act, GDPR, NIS2, and CRA checklists never get mixed together.',
        de: '**Gruppiert nach System, und je System nach Regelwerk**: Checklisten zu EU AI Act, DSGVO, NIS2 und CRA werden nie vermischt.',
      },
      {
        en: '**Next review date on every row**: see what is coming due without opening each one.',
        de: '**Naechstes Pruefdatum in jeder Zeile**: erkennen, was faellig wird, ohne jede einzelne zu oeffnen.',
      },
      {
        en: '**Organisation-wide checklists**: obligations that apply to your company as a whole, not to a single AI system.',
        de: '**Organisationsweite Checklisten**: Pflichten, die fuer Ihr gesamtes Unternehmen gelten, nicht nur fuer ein einzelnes KI-System.',
      },
      {
        en: '**A stat band before you scroll**: total checklists, completed, in progress and needing review, visible immediately.',
        de: '**Kennzahlen ohne Scrollen**: Gesamtzahl der Checklisten, abgeschlossen, in Bearbeitung und pruefungsbeduerftig, sofort sichtbar.',
      },
    ],
    shots: [
      { src: '/docs/assessments-overview.png', w: 1440, h: 1754, alt: { en: 'The Assessments overview page, grouping checklists by AI system and by organisation-wide obligations, with status and progress for each', de: 'Die Uebersicht der Bewertungen, gruppiert nach KI-System und organisationsweiten Pflichten, mit Status und Fortschritt' } },
    ],
  },
  {
    id: 'law-explorer',
    eyebrow: { en: 'Law Explorer', de: 'Gesetzes-Explorer' },
    title: { en: 'Law Explorer: know exactly which laws apply to you', de: 'Gesetzes-Explorer: genau wissen, welche Gesetze gelten' },
    body: {
      en: [
        'The Law Explorer starts with a different question, not "is this AI system high-risk" but "what does your company actually do". Answer a short set of checkboxes, whether you process personal data, use AI in recruitment, run an online platform, or fall under a regulated sector like finance or healthcare, and the tool highlights which of the **37 laws** in the library likely apply, organised into EU-wide, German national, and sector-specific tiers.',
        'The checkbox categories mirror how a company actually describes itself, not how a lawyer would: data and privacy, people and work, content and AI building, platforms and markets, products and safety, and your sector, each with plain questions like "we use AI in HR or recruitment" or "we transfer personal data outside the EU". A results banner updates as you check boxes, showing how many laws likely apply and how many checklists you have already started for them, so the tool tells you not just what applies but how far along you already are. A **Watch list** section below the main directory covers laws not yet in force, the KI-MIG, a planned German deepfake law, and a proposed Employee Data Act, each marked "in development" so you can plan ahead without mistaking a draft for a binding requirement.',
      ],
      de: [
        'Der Gesetzes-Explorer beginnt mit einer anderen Frage, nicht "ist dieses KI-System Hochrisiko", sondern "was macht Ihr Unternehmen eigentlich". Beantworten Sie einige kurze Kontrollkaestchen, etwa ob Sie personenbezogene Daten verarbeiten, KI in der Personalauswahl einsetzen, eine Online-Plattform betreiben oder einem regulierten Sektor wie Finanzwesen oder Gesundheitswesen angehoeren, und das Werkzeug zeigt, welche der **37 Gesetze** in der Bibliothek voraussichtlich gelten, gegliedert in EU-weite, deutsche nationale und branchenspezifische Ebenen.',
        'Die Kategorien der Kontrollkaestchen spiegeln wider, wie ein Unternehmen sich selbst beschreibt, nicht wie eine Anwaeltin es taete: Daten und Datenschutz, Menschen und Arbeit, Inhalte und KI-Entwicklung, Plattformen und Maerkte, Produkte und Sicherheit sowie Ihr Sektor, jeweils mit einfachen Fragen wie "wir setzen KI in HR oder Personalauswahl ein" oder "wir uebermitteln personenbezogene Daten ausserhalb der EU". Ein Ergebnisbanner aktualisiert sich beim Ankreuzen und zeigt, wie viele Gesetze voraussichtlich gelten und fuer wie viele davon bereits Checklisten begonnen wurden, das Werkzeug zeigt also nicht nur, was gilt, sondern auch, wie weit Sie schon sind. Ein Abschnitt **Beobachtungsliste** unterhalb des Hauptverzeichnisses erfasst noch nicht geltende Gesetze, das KI-MIG, ein geplantes deutsches Deepfake-Gesetz und ein vorgeschlagenes Beschaeftigtendatengesetz, jeweils als "in Entwicklung" markiert, damit Sie vorausplanen koennen, ohne einen Entwurf mit geltendem Recht zu verwechseln.',
      ],
    },
    points: [
      {
        en: '**Guided, not a wall of text**: your selections are saved, and a short summary explains what applies before you read a single law.',
        de: '**Gefuehrt, keine Textwueste**: Ihre Auswahl wird gespeichert, eine kurze Zusammenfassung erklaert die Anwendbarkeit, bevor Sie ein einziges Gesetz lesen.',
      },
      {
        en: '**Free-text search too**: describe your company in your own words and the tool suggests likely laws.',
        de: '**Auch als Freitextsuche**: beschreiben Sie Ihr Unternehmen in eigenen Worten, das Werkzeug schlaegt passende Gesetze vor.',
      },
      {
        en: '**A full timeline included**: every key compliance date for every law, from bans already in force to deadlines still years away.',
        de: '**Mit vollstaendiger Zeitleiste**: jedes wichtige Compliance-Datum jedes Gesetzes, von bereits geltenden Verboten bis zu Fristen, die noch Jahre entfernt sind.',
      },
      {
        en: '**A watch list for laws not yet in force**: draft and pending legislation, marked "in development", so you can plan ahead without mistaking a draft for a binding rule.',
        de: '**Beobachtungsliste fuer kuenftige Gesetze**: geplante und noch nicht geltende Regelungen, markiert als "in Entwicklung", damit Sie vorausplanen koennen, ohne einen Entwurf mit geltendem Recht zu verwechseln.',
      },
    ],
    shots: [
      { src: '/docs/law-explorer.png', w: 1440, h: 4123, alt: { en: 'The Law Explorer page, showing the guided applicability questionnaire above a tiered directory of EU, German national and sector-specific laws', de: 'Der Gesetzes-Explorer mit dem gefuehrten Anwendbarkeitsfragebogen ueber einem gestuften Verzeichnis von EU-, deutschen und branchenspezifischen Gesetzen' } },
    ],
  },
  {
    id: 'frameworks',
    eyebrow: { en: 'Frameworks library', de: 'Regelwerk-Bibliothek' },
    title: { en: 'Frameworks: 37 laws, explained in plain language', de: 'Regelwerke: 37 Gesetze, verstaendlich erklaert' },
    body: {
      en: [
        'Every law in the catalogue, EU regulation or German national law, gets its own page: what you must do, who has to comply, who enforces it in Germany, the key dates, the penalties for getting it wrong, and every requirement written in plain language with its article number attached. Nothing here replaces legal advice, but it replaces the hours it would take to find this out from the regulation text itself.',
        'Each law page follows the same structure regardless of whether it is a sprawling regulation like the AI Act or a narrow sector rule, and enforcement is named specifically rather than left as "the relevant authority": the **Bundesnetzagentur** leads on the AI Act, alongside **BaFin** and **BfArM** for their sectors. A **Requirements in plain language** section breaks the law into individual duties, each tagged mandatory or not and linked to its own checklist, so reading the page and starting the work are the same action, not two separate steps, and a Discussion thread sits at the bottom of every law page for questions specific to that framework.',
      ],
      de: [
        'Jedes Gesetz im Katalog, EU-Verordnung oder deutsches Bundesrecht, erhaelt eine eigene Seite: was zu tun ist, wer es einhalten muss, wer es in Deutschland durchsetzt, die wichtigsten Fristen, die Sanktionen bei Verstoessen, und jede Anforderung verstaendlich formuliert mit dem zugehoerigen Artikel. Nichts davon ersetzt eine Rechtsberatung, aber es erspart die Stunden, die man braucht, um das aus dem Verordnungstext selbst herauszufinden.',
        'Jede Gesetzesseite folgt derselben Struktur, egal ob es sich um eine umfangreiche Verordnung wie den AI Act oder eine schmale Branchenregel handelt, und die zustaendige Behoerde wird konkret genannt statt nur als "die zustaendige Stelle": Die **Bundesnetzagentur** ist federfuehrend beim AI Act, dazu **BaFin** und **BfArM** fuer ihre Sektoren. Ein Abschnitt **Anforderungen in verstaendlicher Sprache** gliedert das Gesetz in einzelne Pflichten, jede als verpflichtend oder nicht markiert und mit einer eigenen Checkliste verknuepft, sodass das Lesen der Seite und der Start der Arbeit dieselbe Handlung sind, nicht zwei getrennte Schritte, und ein Diskussionsstrang steht am Ende jeder Gesetzesseite fuer Fragen speziell zu diesem Regelwerk.',
      ],
    },
    points: [
      {
        en: '**Requirements in plain language, cited by article**: Article 9 becomes "run a risk management process across the system\'s whole life", not a paragraph of legal text.',
        de: '**Anforderungen verstaendlich formuliert, mit Artikelangabe**: aus Artikel 9 wird "einen Risikomanagementprozess ueber das gesamte Systemleben betreiben", kein Absatz Gesetzestext.',
      },
      {
        en: '**Start a checklist directly from the law page**: no need to go back to an AI system first.',
        de: '**Checkliste direkt von der Gesetzesseite starten**: kein Umweg mehr ueber ein KI-System.',
      },
      {
        en: '**A discussion thread on every law**: ask a question or share how you documented a specific requirement.',
        de: '**Ein Diskussionsstrang je Gesetz**: eine Frage stellen oder teilen, wie eine bestimmte Anforderung dokumentiert wurde.',
      },
      {
        en: '**Enforcement named specifically**: each law page states who enforces it in Germany, the Bundesnetzagentur for the AI Act generally, BaFin and BfArM for their sectors, not just "the relevant authority."',
        de: '**Zustaendige Behoerde konkret genannt**: jede Gesetzesseite nennt, wer es in Deutschland durchsetzt, die Bundesnetzagentur fuer den AI Act allgemein, BaFin und BfArM fuer ihre Sektoren, nicht nur "die zustaendige Behoerde."',
      },
    ],
    shots: [
      { src: '/docs/frameworks-library.png', w: 1440, h: 1152, alt: { en: 'The Frameworks library, a paginated table of 34 laws with their tier, requirement count and available checklists', de: 'Die Regelwerk-Bibliothek, eine paginierte Tabelle von 34 Gesetzen mit Ebene, Anzahl der Anforderungen und verfuegbaren Checklisten' } },
      { src: '/docs/framework-detail.png', w: 1440, h: 4131, alt: { en: 'The EU AI Act framework page, showing what you must do, key dates, penalties, and requirements in plain language with article citations', de: 'Die Seite zum EU AI Act mit Pflichten, wichtigen Fristen, Sanktionen und verstaendlich formulierten Anforderungen mit Artikelangaben' } },
    ],
  },
  {
    id: 'timeline',
    eyebrow: { en: 'Compliance timeline', de: 'Compliance-Zeitleiste' },
    title: { en: 'Timeline: every deadline in one place', de: 'Zeitleiste: alle Fristen an einem Ort' },
    body: {
      en: [
        'AI regulation in Germany does not arrive on one date. The AI Act alone has phased deadlines stretching from 2025 to 2030, and every other framework in the library adds its own. The Compliance Timeline lists them all, grouped by year, alongside your own assessment review dates, so a milestone that already passed, a deadline three months away, and a review you scheduled yourself all live on the same page.',
        'Filter tabs narrow the list to **Upcoming**, **Regulatory** (dates set by law, not by you), or **My reviews** (dates you or a teammate scheduled), so a compliance officer preparing for a board update can pull just the regulatory deadlines, while someone planning their own week can pull just their reviews. The three counts at the top, upcoming, overdue, and done, update live as dates pass and reviews get completed, which makes the page useful as a standing reference, not just a one-time read, and an **Add to calendar** export turns any of it into dates your own calendar app can track.',
      ],
      de: [
        'KI-Regulierung in Deutschland kommt nicht an einem einzigen Datum. Allein der AI Act hat gestaffelte Fristen von 2025 bis 2030, und jedes weitere Regelwerk in der Bibliothek bringt eigene mit. Die Compliance-Zeitleiste listet sie alle, gruppiert nach Jahr, zusammen mit Ihren eigenen Pruefterminen, sodass ein bereits vergangener Meilenstein, eine Frist in drei Monaten und eine selbst geplante Pruefung auf derselben Seite stehen.',
        'Filter-Tabs grenzen die Liste ein auf **Anstehend**, **Regulatorisch** (gesetzlich festgelegte Termine, nicht selbst gesetzt) oder **Meine Pruefungen** (von Ihnen oder einer Kollegin geplante Termine), sodass eine Compliance-Verantwortliche fuer ein Vorstands-Update nur die regulatorischen Fristen abrufen kann, waehrend jemand, der die eigene Woche plant, nur die eigenen Pruefungen sieht. Die drei Zaehler oben, anstehend, ueberfaellig und erledigt, aktualisieren sich live, wenn Termine verstreichen und Pruefungen abgeschlossen werden, was die Seite zu einer dauerhaften Referenz macht, nicht nur zu einer einmaligen Lektuere, und ein Export **Zum Kalender hinzufuegen** macht daraus Termine, die die eigene Kalender-App verfolgen kann.',
      ],
    },
    points: [
      {
        en: '**Regulatory milestones and your own reviews, together**: not two lists to check separately.',
        de: '**Regulatorische Meilensteine und eigene Pruefungen zusammen**: keine zwei getrennten Listen mehr.',
      },
      {
        en: '**Done, upcoming, and overdue, counted clearly**: at the top of the page, before you scroll.',
        de: '**Erledigt, anstehend und ueberfaellig klar gezaehlt**: oben auf der Seite, noch vor dem Scrollen.',
      },
      {
        en: '**Filter by Upcoming, Regulatory, or My reviews**: pull just the dates you actually need for the task at hand.',
        de: '**Filter nach Anstehend, Regulatorisch oder Meine Pruefungen**: nur die Termine abrufen, die fuer die aktuelle Aufgabe gebraucht werden.',
      },
      {
        en: '**Add to calendar**: export the dates that matter to you into your own calendar app.',
        de: '**Zum Kalender hinzufuegen**: die fuer Sie wichtigen Termine in die eigene Kalender-App exportieren.',
      },
    ],
    shots: [
      { src: '/docs/compliance-timeline.png', w: 1440, h: 1010, alt: { en: 'The Compliance Timeline page with 2026 expanded, showing regulatory milestones such as the Cyber Resilience Act reporting duty start date', de: 'Die Compliance-Zeitleiste mit aufgeklapptem Jahr 2026, mit Meilensteinen wie dem Start der Meldepflicht des Cyber Resilience Act' } },
    ],
  },
  {
    id: 'documents',
    eyebrow: { en: 'Evidence', de: 'Nachweise' },
    title: { en: 'Documents: an encrypted evidence library', de: 'Dokumente: eine verschluesselte Nachweisbibliothek' },
    body: {
      en: [
        'Every file you attach to a checklist item also appears here, in one evidence library for the whole organisation. Nothing is stored in plaintext, not even temporarily: a document is encrypted with your organisation\'s own key before it is written to disk, and the same key decrypts it again the moment you download it.',
        'Because every file lives on this one page regardless of which checklist item it was uploaded from, it doubles as a single evidence inventory you can hand to an auditor: file name, type, size, and upload date for everything your organisation has on record, in one table, without hunting through individual assessments to reassemble the list.',
      ],
      de: [
        'Jede Datei, die Sie an einen Checklistenpunkt anhaengen, erscheint auch hier, in einer Nachweisbibliothek fuer die gesamte Organisation. Nichts wird im Klartext gespeichert, auch nicht voruebergehend: ein Dokument wird mit dem eigenen Schluessel Ihrer Organisation verschluesselt, bevor es gespeichert wird, und derselbe Schluessel entschluesselt es beim Herunterladen wieder.',
        'Da jede Datei unabhaengig davon, aus welchem Checklistenpunkt sie hochgeladen wurde, auf dieser einen Seite erscheint, dient sie zugleich als einziges Nachweisverzeichnis, das sich einem Pruefer uebergeben laesst: Dateiname, Typ, Groesse und Uploaddatum fuer alles, was Ihre Organisation dokumentiert hat, in einer Tabelle, ohne die Liste erst aus einzelnen Bewertungen zusammenzusuchen.',
      ],
    },
    points: [
      {
        en: '**Encrypted before it touches disk**: not after, and not optionally.',
        de: '**Verschluesselt, bevor es gespeichert wird**: nicht danach, und nicht optional.',
      },
      {
        en: '**Attached to the requirement it proves**: a file lives next to the checklist item it supports, not in a generic folder.',
        de: '**An die belegte Anforderung angehaengt**: eine Datei liegt beim zugehoerigen Checklistenpunkt, nicht in einem allgemeinen Ordner.',
      },
      {
        en: '**Delete at any time**: removing a document removes it for good, consistent with the data rights described in Settings.',
        de: '**Jederzeit loeschbar**: das Entfernen eines Dokuments loescht es endgueltig, konsistent mit den Betroffenenrechten in den Einstellungen.',
      },
      {
        en: '**One inventory for an auditor**: every file across every checklist, in one table, without reassembling the list from individual assessments.',
        de: '**Ein Verzeichnis fuer Pruefer**: jede Datei aus jeder Checkliste in einer Tabelle, ohne die Liste erst aus einzelnen Bewertungen zusammenzusuchen.',
      },
    ],
    shots: [
      { src: '/docs/documents.png', w: 1440, h: 900, alt: { en: 'The Documents evidence library, listing uploaded compliance files with their type, size and upload date', de: 'Die Nachweisbibliothek mit hochgeladenen Compliance-Dateien, Typ, Groesse und Uploaddatum' } },
    ],
  },
  {
    id: 'community',
    eyebrow: { en: 'Community', de: 'Community' },
    title: { en: 'Community: ask people solving the same problem', de: 'Community: fragen, wer dasselbe Problem loest' },
    body: {
      en: [
        'A compliance question rarely has one textbook answer, especially when the underlying law is new. The Community section is a place to ask other users how they documented a specific requirement, or to answer someone else\'s question, organised as public discussions or company-private ones, and anchored to a specific law when it helps to be precise.',
        'Every thread carries a **Public** or **Locked** (company-only) tag and, where relevant, the law it is anchored to, visible before you open it, so you know immediately whether you are reading something the whole user base can see or a conversation scoped to your own organisation. Voting and replies work the way any discussion forum\'s do, the goal is a place your team actually checks, not a support inbox that reads like one, and every answer here is clearly labelled as peer guidance, not legal advice.',
      ],
      de: [
        'Eine Compliance-Frage hat selten eine einzige Lehrbuchantwort, vor allem wenn das zugrunde liegende Gesetz neu ist. Die Community ist ein Ort, um andere Nutzerinnen und Nutzer zu fragen, wie sie eine bestimmte Anforderung dokumentiert haben, oder um die Frage einer anderen Person zu beantworten, oeffentlich oder unternehmensintern, und bei Bedarf an ein konkretes Gesetz angebunden.',
        'Jeder Diskussionsstrang traegt eine Markierung **Oeffentlich** oder **Gesperrt** (nur intern) und, wo relevant, das Gesetz, an das er angebunden ist, sichtbar bevor er geoeffnet wird, sodass sofort klar ist, ob es sich um etwas fuer die gesamte Nutzerbasis oder ein Gespraech innerhalb der eigenen Organisation handelt. Abstimmungen und Antworten funktionieren wie in jedem Diskussionsforum, das Ziel ist ein Ort, den Ihr Team tatsaechlich aufsucht, kein Support-Postfach, das sich nur so liest, und jede Antwort hier ist klar als Erfahrungsaustausch gekennzeichnet, nicht als Rechtsberatung.',
      ],
    },
    points: [
      {
        en: '**Public or company-only**: choose whether a discussion is visible to everyone or kept inside your own organisation.',
        de: '**Oeffentlich oder nur intern**: waehlen, ob eine Diskussion fuer alle sichtbar ist oder in der eigenen Organisation bleibt.',
      },
      {
        en: '**Anchored to a law**: start a discussion from a framework\'s own page and it stays linked to that context.',
        de: '**An ein Gesetz angebunden**: eine Diskussion direkt von der Regelwerkseite starten, sie bleibt mit diesem Kontext verknuepft.',
      },
      {
        en: '**Not legal advice**: clearly labelled as peer guidance, the same honesty standard the rest of the product holds to.',
        de: '**Keine Rechtsberatung**: klar als Erfahrungsaustausch gekennzeichnet, derselbe ehrliche Massstab wie im ganzen Produkt.',
      },
      {
        en: '**Visibility is clear before you open a thread**: the Public or company-only tag, and the law it is anchored to, show right in the list.',
        de: '**Sichtbarkeit ist vor dem Oeffnen klar**: die Markierung Oeffentlich oder nur intern sowie das angebundene Gesetz stehen bereits in der Liste.',
      },
    ],
    shots: [
      { src: '/docs/community.png', w: 1440, h: 900, alt: { en: 'The Community page showing public discussion threads about GDPR documentation and human oversight practices', de: 'Die Community-Seite mit oeffentlichen Diskussionen zu DSGVO-Dokumentation und menschlicher Aufsicht' } },
    ],
  },
  {
    id: 'audit-log',
    eyebrow: { en: 'Accountability', de: 'Nachvollziehbarkeit' },
    title: { en: 'Audit Log: a record of who did what, and when', de: 'Audit-Log: ein Protokoll, wer was wann getan hat' },
    body: {
      en: [
        'Every meaningful action in your organisation, a checklist item updated, an AI system created or classified, a document deleted, is written to an audit log you can filter, search, and export as CSV. This is the same kind of log an auditor or a regulator would expect to see, kept automatically rather than assembled after the fact.',
        'A dropdown filter narrows the log to one action type at a time, checklist item updates, AI system creation or classification, document deletions, and more, so answering "did anyone delete anything last month" takes one filter and a glance, not a manual read of a hundred rows. Entries older than **365 days** are pruned automatically rather than accumulating forever, long enough to cover a full annual review cycle, short enough that the log stays a genuinely useful record rather than an ever-growing archive nobody reads.',
      ],
      de: [
        'Jede relevante Aktion in Ihrer Organisation, ein aktualisierter Checklistenpunkt, ein angelegtes oder eingestuftes KI-System, ein geloeschtes Dokument, wird in ein Audit-Log geschrieben, das sich filtern, durchsuchen und als CSV exportieren laesst. Genau diese Art von Protokoll erwarten Pruefer oder Aufsichtsbehoerden, automatisch gefuehrt statt nachtraeglich zusammengestellt.',
        'Ein Dropdown-Filter grenzt das Log auf einen Aktionstyp gleichzeitig ein, aktualisierte Checklistenpunkte, angelegte oder eingestufte KI-Systeme, geloeschte Dokumente und mehr, sodass die Frage "hat letzten Monat jemand etwas geloescht" einen Filterklick braucht, keine manuelle Durchsicht von hundert Zeilen. Eintraege aelter als **365 Tage** werden automatisch entfernt statt sich endlos anzusammeln, lang genug fuer einen vollstaendigen Jahrespruefzyklus, kurz genug, damit das Log ein tatsaechlich nuetzliches Protokoll bleibt statt eines staendig wachsenden Archivs, das niemand liest.',
      ],
    },
    points: [
      {
        en: '**Every entry has a who, a what, and a when**: no anonymous changes.',
        de: '**Jeder Eintrag hat ein Wer, ein Was und ein Wann**: keine anonymen Aenderungen.',
      },
      {
        en: '**Filterable by action type**: find every classification, every deletion, or every document upload on its own.',
        de: '**Filterbar nach Aktionstyp**: jede Einstufung, jede Loeschung oder jeden Dokumenten-Upload einzeln finden.',
      },
      {
        en: '**Exportable**: download the full log as CSV when you need it outside the product.',
        de: '**Exportierbar**: das vollstaendige Protokoll als CSV herunterladen, wenn es ausserhalb des Produkts gebraucht wird.',
      },
      {
        en: '**Old entries are pruned, not hoarded forever**: kept for 365 days, long enough for a full annual review cycle, short enough to stay useful.',
        de: '**Alte Eintraege werden automatisch entfernt**: Aufbewahrung 365 Tage, lang genug fuer einen vollstaendigen Jahreszyklus, kurz genug, um nuetzlich zu bleiben.',
      },
    ],
    shots: [
      { src: '/docs/audit-log.png', w: 1440, h: 991, alt: { en: 'The Audit Log page, listing actions such as checklist item updates and AI system classifications with who performed them and when', de: 'Das Audit-Log mit Aktionen wie aktualisierten Checklistenpunkten und KI-System-Einstufungen samt Person und Zeitpunkt' } },
    ],
  },
  {
    id: 'notifications',
    eyebrow: { en: 'Staying on track', de: 'Am Ball bleiben' },
    title: { en: 'Notifications: reminders before anything falls due', de: 'Benachrichtigungen: Erinnerungen, bevor etwas faellig wird' },
    body: {
      en: [
        'A scheduled job checks every organisation\'s assessments every day, not once a year by hand, and raises a notification when an annual review is coming due. Notifications appear in-app and, per the schedule you set, by email as well, so a review date does not go quietly unnoticed.',
        'Every notification links directly to the assessment it concerns, so clicking Open from a reminder takes you straight into that checklist, not a generic list you then have to search. The **lead time** before a review is due, and whether a given checklist\'s reminders are on at all, are both configured per checklist in Settings, not fixed globally, so a system under active development can get shorter, more frequent nudges than one that has been stable for years.',
      ],
      de: [
        'Ein geplanter Job prueft taeglich die Bewertungen jeder Organisation, nicht einmal im Jahr von Hand, und erzeugt eine Benachrichtigung, wenn eine jaehrliche Pruefung ansteht. Benachrichtigungen erscheinen in der App und, je nach eingestelltem Vorlauf, auch per E-Mail, damit ein Pruefdatum nicht unbemerkt verstreicht.',
        'Jede Benachrichtigung verlinkt direkt auf die betroffene Bewertung, sodass ein Klick auf Oeffnen direkt in diese Checkliste fuehrt, keine allgemeine Liste, die erst durchsucht werden muss. Der **Vorlauf** vor einer faelligen Pruefung, und ob die Erinnerungen einer bestimmten Checkliste ueberhaupt aktiv sind, werden beide je Checkliste in den Einstellungen konfiguriert, nicht global festgelegt, sodass ein System in aktiver Entwicklung kuerzere, haeufigere Hinweise erhalten kann als eines, das seit Jahren stabil laeuft.',
      ],
    },
    points: [
      {
        en: '**Checked daily, not annually**: the review window is a setting, not a manual reminder someone has to remember to send.',
        de: '**Taeglich geprueft, nicht jaehrlich**: der Pruefvorlauf ist eine Einstellung, keine manuelle Erinnerung, die jemand verschicken muss.',
      },
      {
        en: '**Tied to a specific checklist**: a notification opens directly to the assessment it concerns.',
        de: '**An eine konkrete Checkliste gebunden**: eine Benachrichtigung oeffnet direkt die betroffene Bewertung.',
      },
      {
        en: '**Mark as read individually or all at once**: keep the list clean without losing the history.',
        de: '**Einzeln oder gesammelt als gelesen markieren**: die Liste uebersichtlich halten, ohne den Verlauf zu verlieren.',
      },
      {
        en: '**Lead time set per checklist, not globally**: a system under active development can get shorter, more frequent nudges than a stable one.',
        de: '**Vorlauf je Checkliste, nicht global**: ein System in aktiver Entwicklung kann kuerzere, haeufigere Hinweise erhalten als ein stabiles.',
      },
    ],
    shots: [
      { src: '/docs/notifications.png', w: 1440, h: 900, alt: { en: 'The Notifications page, listing annual review reminders for NIS2, BaFin AI and EU AI Act checklists', de: 'Die Benachrichtigungsseite mit jaehrlichen Erinnerungen zu NIS2-, BaFin-KI- und EU-AI-Act-Checklisten' } },
    ],
  },
  {
    id: 'team-settings',
    eyebrow: { en: 'Team and data rights', de: 'Team und Betroffenenrechte' },
    title: { en: 'Settings: your team, your roles, and your own data rights', de: 'Einstellungen: Ihr Team, Ihre Rollen, Ihre eigenen Betroffenenrechte' },
    body: {
      en: [
        'Settings covers three things that usually live in three different places: organisation and team management, role-based permissions, and the data rights Compliance Check asks every AI system to respect, applied to your own account. Invite a teammate, set their role, and see exactly what each role can and cannot do, all on one page.',
        'The **annual review reminders** table lists every checklist your organisation has, its cadence, its next reminder date, and a simple on or off toggle, paginated once you have more than a handful, so turning down the noise for a stable system or tightening it for a new one takes one click, not a support ticket. **Two-factor authentication** is available per account and clearly marked on when it is off, in keeping with the same plain-facts approach the rest of the product takes to security. The data rights section at the bottom, download or delete, is not a promise in a policy document, it is the same self-service export and deletion described on the Security page, available to run on your own account right now.',
      ],
      de: [
        'Die Einstellungen decken drei Dinge ab, die sonst an drei verschiedenen Orten liegen: Organisations- und Teamverwaltung, rollenbasierte Berechtigungen und die Betroffenenrechte, die Compliance Check von jedem KI-System einfordert, angewendet auf das eigene Konto. Eine Kollegin oder einen Kollegen einladen, die Rolle festlegen, und genau sehen, was jede Rolle darf und was nicht, alles auf einer Seite.',
        'Die Tabelle **Jaehrliche Erinnerungen** listet jede Checkliste Ihrer Organisation mit Rhythmus, naechstem Erinnerungstermin und einem einfachen An/Aus-Schalter, paginiert sobald es mehr als eine Handvoll sind, sodass das Herunterdrehen der Erinnerungen fuer ein stabiles System oder das Verschaerfen fuer ein neues nur einen Klick braucht, kein Support-Ticket. **Zwei-Faktor-Authentifizierung** ist je Konto verfuegbar und klar markiert, wenn sie ausgeschaltet ist, im selben nuechternen Stil, mit dem der Rest des Produkts Sicherheit behandelt. Der Abschnitt zu den Betroffenenrechten unten, herunterladen oder loeschen, ist kein Versprechen in einer Richtlinie, sondern derselbe Selbstbedienungs-Export und dieselbe Loeschung, die auf der Sicherheitsseite beschrieben sind, jederzeit auf dem eigenen Konto ausfuehrbar.',
      ],
    },
    points: [
      {
        en: '**Four roles, clearly scoped**: owner, admin, member, and viewer, each with a plain description of what it allows.',
        de: '**Vier klar abgegrenzte Rollen**: Inhaber, Admin, Mitglied und Betrachter, jeweils mit klarer Beschreibung der Berechtigungen.',
      },
      {
        en: '**Annual review reminders, per checklist**: turn a specific reminder on or off, or see its cadence and next date.',
        de: '**Jaehrliche Erinnerungen je Checkliste**: eine bestimmte Erinnerung ein- oder ausschalten, oder Rhythmus und naechsten Termin einsehen.',
      },
      {
        en: '**Your data and privacy, built in, not promised**: download a full export of everything held about your account, or permanently delete your account or your entire organisation, in the same page you manage your team.',
        de: '**Ihre Daten und Ihr Datenschutz, eingebaut statt nur versprochen**: einen vollstaendigen Export aller Kontodaten herunterladen, oder das eigene Konto beziehungsweise die gesamte Organisation endgueltig loeschen, auf derselben Seite, auf der Sie Ihr Team verwalten.',
      },
      {
        en: '**Two-factor authentication, clearly flagged when off**: available per account, the same honest, no-badge-inflation approach as the rest of the product.',
        de: '**Zwei-Faktor-Authentifizierung, klar markiert wenn aus**: je Konto verfuegbar, derselbe ehrliche Ansatz ohne Zertifikats-Aufblaehung wie im Rest des Produkts.',
      },
    ],
    shots: [
      { src: '/docs/settings-team.png', w: 1440, h: 2428, alt: { en: 'The Settings page, showing organisation profile, team members with roles, annual review reminders and data export and deletion controls', de: 'Die Einstellungsseite mit Organisationsprofil, Teammitgliedern mit Rollen, jaehrlichen Erinnerungen sowie Datenexport und Loeschung' } },
    ],
  },
];
