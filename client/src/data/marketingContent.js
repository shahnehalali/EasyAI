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
