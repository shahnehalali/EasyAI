// Knowledge base for the in-app Help Assistant (English + German).
// Each topic has language-agnostic id, matching keywords (EN + DE), and a
// localised title and answer. No external AI call is made, so help is instant
// and works offline. The matcher can later be swapped for a live model endpoint.

export const HELP_TOPICS = [
  {
    id: 'getting-started',
    keywords: ['start', 'begin', 'getting started', 'first', 'new', 'setup', 'how to use', 'overview', 'what do i do', 'anfang', 'beginnen', 'loslegen', 'starten', 'erste schritte', 'wie nutze'],
    title: { en: 'How do I get started?', de: 'Wie fange ich an?' },
    answer: {
      en: 'Welcome. Here is the short path through the app:\n\n1. Register an AI system (the AI tool your company uses).\n2. Classify it by answering a few yes/no questions.\n3. The app creates the right compliance checklists for you.\n4. Work through each checklist item and record your evidence.\n5. Keep them reviewed once a year.\n\nStart from the dashboard by clicking "Register an AI system".',
      de: 'Willkommen. Hier ist der kurze Weg durch die App:\n\n1. Legen Sie ein KI-System an (das KI-Werkzeug, das Ihr Unternehmen nutzt).\n2. Stufen Sie es ein, indem Sie ein paar Ja/Nein-Fragen beantworten.\n3. Die App erstellt die passenden Compliance-Checklisten fuer Sie.\n4. Arbeiten Sie jeden Punkt durch und halten Sie Ihre Nachweise fest.\n5. Pruefen Sie sie einmal pro Jahr.\n\nBeginnen Sie auf der Uebersicht mit "KI-System anlegen".',
    },
  },
  {
    id: 'compliance',
    keywords: ['compliance', 'how does compliance', 'comply', 'what is compliance', 'module', 'requirements', 'vorschrift', 'einhaltung', 'anforderungen'],
    title: { en: 'How does compliance work here?', de: 'Wie funktioniert Compliance hier?' },
    answer: {
      en: 'Compliance here means working through plain-language checklists that come from EU and German AI law.\n\nThe flow is: register your AI, classify its risk, get the matching checklists (called assessments), fill each item with your evidence, and review them yearly. Your dashboard rolls it all up into one compliance standing, and you can export proof as PDF or CSV.',
      de: 'Compliance bedeutet hier, verstaendliche Checklisten abzuarbeiten, die aus dem EU- und dem deutschen KI-Recht stammen.\n\nDer Ablauf: KI anlegen, Risiko einstufen, passende Checklisten (Bewertungen) erhalten, jeden Punkt mit Nachweisen fuellen und jaehrlich pruefen. Ihre Uebersicht fasst alles zu einem Compliance-Stand zusammen, und Sie koennen Nachweise als PDF oder CSV exportieren.',
    },
  },
  {
    id: 'register-system',
    keywords: ['register', 'add system', 'new system', 'ai system', 'create system', 'add ai', 'ki-system', 'system anlegen', 'hinzufuegen'],
    title: { en: 'How do I register an AI system?', de: 'Wie lege ich ein KI-System an?' },
    answer: {
      en: 'Go to "AI systems" in the sidebar (or the dashboard) and click "Register an AI system". Give it a name, its purpose, and the vendor. Once saved, open it and click "Classify this system" to find out which rules apply.',
      de: 'Gehen Sie in der Seitenleiste (oder auf der Uebersicht) zu "KI-Systeme" und klicken Sie auf "KI-System anlegen". Geben Sie Name, Zweck und Anbieter an. Nach dem Speichern oeffnen Sie es und klicken auf "Dieses System einstufen", um zu sehen, welche Regeln gelten.',
    },
  },
  {
    id: 'classification',
    keywords: ['classify', 'classification', 'risk', 'questionnaire', 'questions', 'high risk', 'prohibited', 'limited', 'minimal', 'category', 'einstufen', 'einstufung', 'risiko', 'fragebogen', 'kategorie'],
    title: { en: 'How does risk classification work?', de: 'Wie funktioniert die Risikoeinstufung?' },
    answer: {
      en: 'Open an AI system and click "Classify this system". You answer a set of yes/no questions about what the AI does. A "Yes" usually points to a riskier use, so those buttons turn red, and "No" turns green.\n\nBased on your answers the app labels the system as Prohibited, High, Limited, or Minimal risk, and explains why. The higher the risk, the more obligations apply, and the app builds the matching checklists automatically.',
      de: 'Oeffnen Sie ein KI-System und klicken Sie auf "Dieses System einstufen". Sie beantworten Ja/Nein-Fragen dazu, was die KI tut. Ein "Ja" deutet meist auf eine riskantere Nutzung hin, daher werden diese Schaltflaechen rot und "Nein" wird gruen.\n\nAnhand Ihrer Antworten stuft die App das System als Verboten, Hoch, Begrenzt oder Minimal ein und erklaert warum. Je hoeher das Risiko, desto mehr Pflichten gelten, und die App erstellt die passenden Checklisten automatisch.',
    },
  },
  {
    id: 'assessments',
    keywords: ['assessment', 'checklist', 'item', 'document', 'documentation', 'evidence', 'status', 'fill', 'work on', 'progress', 'bewertung', 'checkliste', 'nachweis', 'dokumentation', 'fortschritt'],
    title: { en: 'How do I work on an assessment / checklist?', de: 'Wie bearbeite ich eine Bewertung / Checkliste?' },
    answer: {
      en: 'Open "Assessments" in the sidebar and pick a checklist. Each row is one requirement in plain language. For each item you can:\n\n- Set a status: Not started, In progress, Done, or Not applicable (Done shows green, In progress shows amber).\n- Write your evidence or notes in the text box (it saves automatically).\n- Assign it to a teammate, attach a document, or add a comment.\n- Click the law link to read the official source.\n\nThe progress bar fills as you complete items.',
      de: 'Oeffnen Sie "Bewertungen" in der Seitenleiste und waehlen Sie eine Checkliste. Jede Zeile ist eine Anforderung in verstaendlicher Sprache. Pro Punkt koennen Sie:\n\n- Einen Status setzen: Nicht begonnen, In Bearbeitung, Erledigt oder Nicht zutreffend (Erledigt ist gruen, In Bearbeitung ist gelb).\n- Ihre Nachweise oder Notizen in das Textfeld schreiben (wird automatisch gespeichert).\n- Den Punkt einem Teammitglied zuweisen, ein Dokument anhaengen oder einen Kommentar hinzufuegen.\n- Auf den Gesetzeslink klicken, um die offizielle Quelle zu lesen.\n\nDer Fortschrittsbalken fuellt sich, waehrend Sie Punkte erledigen.',
    },
  },
  {
    id: 'reviews',
    keywords: ['review', 'reminder', 'annual', 'yearly', 'due', 'mark reviewed', 'notification', 'overdue', 'next review', 'pruefung', 'erinnerung', 'jaehrlich', 'faellig', 'ueberfaellig'],
    title: { en: 'What are annual reviews and reminders?', de: 'Was sind jaehrliche Pruefungen und Erinnerungen?' },
    answer: {
      en: 'Compliance is not "once and done". Each assessment has a next review date. When it comes due, the app sends you a notification and flags the assessment as "needs review". Open it and click "Mark reviewed" to confirm it is current, which resets the clock for another year.',
      de: 'Compliance ist nicht "einmal und fertig". Jede Bewertung hat ein naechstes Pruefdatum. Wird es faellig, sendet die App eine Benachrichtigung und kennzeichnet die Bewertung als "Pruefung noetig". Oeffnen Sie sie und klicken Sie auf "Als geprueft markieren", um zu bestaetigen, dass sie aktuell ist; damit beginnt das Jahr von vorn.',
    },
  },
  {
    id: 'law-explorer',
    keywords: ['law explorer', 'explorer', 'which laws', 'apply to me', 'laws', 'does this apply', 'wizard', 'watchlist', 'timeline', 'gesetz', 'gesetze', 'gilt fuer mich', 'explorer'],
    title: { en: 'What is the Law Explorer?', de: 'Was ist der Gesetzes-Explorer?' },
    answer: {
      en: 'The Law Explorer helps you learn which laws govern AI use in Germany before you commit to checklists. You can browse the laws in tiers (EU, German national, sector), use "Does this apply to me?" to highlight the ones relevant to your business, open a law to read a plain-language summary and its regulator, and start a checklist straight from a law.',
      de: 'Der Gesetzes-Explorer hilft Ihnen zu verstehen, welche Gesetze die KI-Nutzung in Deutschland regeln, bevor Sie Checklisten beginnen. Sie koennen die Gesetze in Ebenen durchsuchen (EU, deutsche, sektorbezogene), mit "Gilt das fuer mich?" die fuer Ihr Unternehmen relevanten hervorheben, ein Gesetz oeffnen, um eine verstaendliche Zusammenfassung und die Aufsichtsbehoerde zu lesen, und direkt aus einem Gesetz eine Checkliste starten.',
    },
  },
  {
    id: 'frameworks',
    keywords: ['framework', 'frameworks', 'library', 'reference', 'tier', 'filter', 'eu', 'national', 'sector', 'rechtsrahmen', 'bibliothek', 'ebene', 'sektor', 'national'],
    title: { en: 'What are Frameworks?', de: 'Was sind Rechtsrahmen?' },
    answer: {
      en: 'Frameworks is the reference library of every law tracked in the app. Use the filter above the table to show only EU, National law, or Sector frameworks. Open any one to read its requirements in plain language, see the official law link, and view its checklists.',
      de: 'Rechtsrahmen ist die Referenzbibliothek aller in der App erfassten Gesetze. Nutzen Sie den Filter ueber der Tabelle, um nur EU-, nationale oder sektorbezogene Rechtsrahmen anzuzeigen. Oeffnen Sie einen, um die Anforderungen verstaendlich zu lesen, den offiziellen Gesetzeslink zu sehen und die Checklisten anzuzeigen.',
    },
  },
  {
    id: 'reports',
    keywords: ['export', 'report', 'pdf', 'csv', 'download', 'auditor', 'audit', 'proof', 'exportieren', 'bericht', 'herunterladen', 'pruefer', 'nachweis'],
    title: { en: 'How do I export a report?', de: 'Wie exportiere ich einen Bericht?' },
    answer: {
      en: 'You can export from two places. On the dashboard, use "Export report (PDF)" or "Export (CSV)" for your whole organisation. Inside an assessment, use "Export PDF" for that single checklist. These are handy to show an auditor or regulator your compliance status and evidence.',
      de: 'Sie koennen an zwei Stellen exportieren. Auf der Uebersicht nutzen Sie "Bericht exportieren (PDF)" oder "Exportieren (CSV)" fuer Ihr gesamtes Unternehmen. In einer Bewertung nutzen Sie "PDF exportieren" fuer diese eine Checkliste. Das ist praktisch, um einem Pruefer oder einer Behoerde Ihren Compliance-Stand und Ihre Nachweise zu zeigen.',
    },
  },
  {
    id: 'team-roles',
    keywords: ['team', 'member', 'invite', 'role', 'roles', 'colleague', 'owner', 'admin', 'permission', 'settings', 'einladen', 'rolle', 'mitglied', 'berechtigung', 'einstellungen'],
    title: { en: 'How do I invite teammates or change roles?', de: 'Wie lade ich Teammitglieder ein oder aendere Rollen?' },
    answer: {
      en: 'Go to Settings to manage your organisation. An owner or admin can invite teammates by email, change a member\'s role, or remove them. Roles control who can edit compliance, manage members, and export reports.',
      de: 'Gehen Sie zu den Einstellungen, um Ihr Unternehmen zu verwalten. Ein Eigentuemer oder Admin kann Teammitglieder per E-Mail einladen, die Rolle eines Mitglieds aendern oder es entfernen. Rollen steuern, wer Compliance bearbeiten, Mitglieder verwalten und Berichte exportieren darf.',
    },
  },
  {
    id: 'theme',
    keywords: ['dark', 'light', 'night', 'day', 'theme', 'mode', 'colour', 'color', 'dunkel', 'hell', 'nacht', 'tag', 'modus', 'sprache', 'language', 'german', 'english', 'deutsch'],
    title: { en: 'How do I switch language or day / night mode?', de: 'Wie wechsle ich Sprache oder Tag-/Nachtmodus?' },
    answer: {
      en: 'In the top bar you will find two controls next to the notification bell: the EN / DE switch changes the whole app language, and the sun/moon button switches day or night mode. Both choices are remembered for your next visit.',
      de: 'In der oberen Leiste finden Sie neben der Glocke zwei Schalter: Der EN / DE-Schalter aendert die Sprache der gesamten App, und die Sonne/Mond-Schaltflaeche wechselt zwischen Tag- und Nachtmodus. Beide Einstellungen werden fuer Ihren naechsten Besuch gespeichert.',
    },
  },
];

// Pick the best-matching topic for a free-text question (matches EN + DE keywords).
export function matchTopic(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;
  let best = null;
  let bestScore = 0;
  for (const topic of HELP_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (q.includes(kw)) score += kw.includes(' ') ? 2 : 1; // phrase hits weigh more
    }
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return bestScore > 0 ? best : null;
}

export const HELP_FALLBACK = {
  en: 'I can help with that. Try one of the topics below, or ask about: getting started, classifying an AI system, working on a checklist, annual reviews, the Law Explorer, frameworks, or exporting a report.\n\nI can also explain a law ("what is the EU AI Act?") or a term ("what is an AVV?", "what does high risk mean?").',
  de: 'Dabei helfe ich gern. Probieren Sie eines der Themen unten oder fragen Sie nach: erste Schritte, ein KI-System einstufen, eine Checkliste bearbeiten, jaehrliche Pruefungen, dem Gesetzes-Explorer, Rechtsrahmen oder einen Bericht exportieren.\n\nIch erkläre Ihnen auch ein Gesetz ("Was ist die KI-Verordnung?") oder einen Begriff ("Was ist ein AVV?", "Was bedeutet hohes Risiko?").',
};

export const HELP_GREETING = {
  en: 'Hi! I am your Compliance Check help assistant. Ask me how to use the app, what a law says, or what a term like AVV or high risk means.',
  de: 'Hallo! Ich bin Ihr Compliance Check-Hilfe-Assistent. Fragen Sie mich, wie Sie die App nutzen, was ein Gesetz sagt oder was ein Begriff wie AVV oder hohes Risiko bedeutet.',
};

// ---------------------------------------------------------------------------
// Glossary: the jargon the app throws at you (the tag pills, the risk labels,
// the GDPR vocabulary). Matched when the user names the term, e.g. "what is an
// AVV?". Laws themselves are NOT here: they are answered from the live law
// catalog (see matchLaw / formatLawAnswer) so there is one source of truth.
export const HELP_GLOSSARY = [
  {
    id: 'avv',
    terms: ['avv', 'auftragsverarbeitungsvertrag', 'data processing agreement', 'processing agreement', 'dpa'],
    answer: {
      en: 'AVV (Auftragsverarbeitungsvertrag), in English a data processing agreement, is the contract GDPR Art. 28 requires whenever a provider processes personal data on your behalf.\n\nIt must fix the subject matter, duration, purpose and type of processing, and the categories of data. It must bind the provider to: act only on your instructions, keep the data confidential and secure, help you answer data-subject requests, delete or return the data at the end, and get your permission before adding a sub-processor.',
      de: 'Ein AVV (Auftragsverarbeitungsvertrag) ist der Vertrag, den Art. 28 DSGVO verlangt, sobald ein Anbieter personenbezogene Daten in Ihrem Auftrag verarbeitet.\n\nEr muss Gegenstand, Dauer, Zweck und Art der Verarbeitung sowie die Datenkategorien festlegen. Der Anbieter muss verpflichtet werden: nur nach Ihren Weisungen zu handeln, die Daten vertraulich und sicher zu halten, Ihnen bei Betroffenenanfragen zu helfen, die Daten am Ende zu löschen oder zurückzugeben und vor dem Einsatz eines Unterauftragsverarbeiters Ihre Erlaubnis einzuholen.',
    },
  },
  {
    id: 'dpf',
    terms: ['dpf', 'data privacy framework', 'eu-us data privacy framework', 'eu us data privacy framework'],
    answer: {
      en: 'The EU-US Data Privacy Framework (DPF) is an adequacy decision by the European Commission. A US company that certifies to it is treated as offering adequate protection, so you may send personal data to it without extra safeguards such as Standard Contractual Clauses.\n\nCheck the provider is actually on the DPF list and that your data falls inside its certification. If it is not certified, you need another transfer safeguard.',
      de: 'Das EU-US Data Privacy Framework (DPF) ist ein Angemessenheitsbeschluss der Europäischen Kommission. Ein zertifiziertes US-Unternehmen gilt als angemessen geschützt, sodass Sie personenbezogene Daten ohne zusätzliche Garantien wie Standardvertragsklauseln übermitteln dürfen.\n\nPrüfen Sie, ob der Anbieter tatsächlich auf der DPF-Liste steht und ob Ihre Daten von der Zertifizierung erfasst sind. Ist er nicht zertifiziert, brauchen Sie eine andere Transfergarantie.',
    },
  },
  {
    id: 'scc',
    terms: ['scc', 'standard contractual clauses', 'standardvertragsklauseln'],
    answer: {
      en: 'Standard Contractual Clauses (SCC) are contract terms pre-approved by the European Commission. Signing them makes a transfer of personal data to a country without an adequacy decision lawful.\n\nSCC alone are usually not enough: you also need a transfer impact assessment (TIA) showing the destination country cannot undermine the protection, plus extra technical measures such as encryption where it can.',
      de: 'Standardvertragsklauseln (SCC) sind von der Europäischen Kommission vorab genehmigte Vertragsklauseln. Ihre Unterzeichnung macht eine Übermittlung personenbezogener Daten in ein Land ohne Angemessenheitsbeschluss zulässig.\n\nSCC allein genügen meist nicht: Sie brauchen zusätzlich ein Transfer Impact Assessment (TIA), das zeigt, dass das Zielland den Schutz nicht aushebeln kann, und ergänzende technische Maßnahmen wie Verschlüsselung, wo dies möglich ist.',
    },
  },
  {
    id: 'tia',
    terms: ['tia', 'transfer impact assessment'],
    answer: {
      en: 'A Transfer Impact Assessment (TIA) is the check you run before sending personal data to a third country under Standard Contractual Clauses. You look at the laws and practice of the destination country, especially government access to data, and decide whether your safeguards really hold.\n\nIf they do not, you must add measures (for example strong encryption where you keep the keys) or stop the transfer.',
      de: 'Ein Transfer Impact Assessment (TIA) ist die Prüfung vor einer Übermittlung personenbezogener Daten in ein Drittland auf Grundlage von Standardvertragsklauseln. Sie bewerten Recht und Praxis des Ziellands, insbesondere staatliche Zugriffe auf Daten, und entscheiden, ob Ihre Garantien tatsächlich tragen.\n\nTun sie das nicht, müssen Sie Maßnahmen ergänzen (etwa starke Verschlüsselung, deren Schlüssel bei Ihnen bleiben) oder die Übermittlung unterlassen.',
    },
  },
  {
    id: 'dpia',
    terms: ['dpia', 'data protection impact assessment', 'datenschutz-folgenabschätzung', 'folgenabschätzung'],
    answer: {
      en: 'A Data Protection Impact Assessment (DPIA) is required by GDPR Art. 35 when a processing operation is likely to cause a high risk to people, for example large-scale profiling, automated decisions with legal effects, or systematic monitoring.\n\nYou describe the processing and its purpose, test whether it is necessary and proportionate, assess the risks to people, and record the measures that reduce them. If a high risk remains, you must consult your supervisory authority before you start.',
      de: 'Eine Datenschutz-Folgenabschätzung (DSFA) verlangt Art. 35 DSGVO, wenn eine Verarbeitung voraussichtlich ein hohes Risiko für Personen bedeutet, etwa umfangreiches Profiling, automatisierte Entscheidungen mit Rechtswirkung oder systematische Überwachung.\n\nSie beschreiben die Verarbeitung und ihren Zweck, prüfen Notwendigkeit und Verhältnismäßigkeit, bewerten die Risiken für die Betroffenen und halten die risikomindernden Maßnahmen fest. Bleibt ein hohes Risiko, müssen Sie vor dem Start Ihre Aufsichtsbehörde konsultieren.',
    },
  },
  {
    id: 'dpo',
    terms: ['dpo', 'data protection officer', 'datenschutzbeauftragter', 'datenschutzbeauftragte'],
    answer: {
      en: 'A Data Protection Officer (DPO) is the person who oversees data protection in your organisation: advising on obligations, monitoring compliance, being the contact point for the supervisory authority and for people whose data you handle.\n\nUnder the GDPR and the German BDSG you generally need one if you are a public body, if your core activity is large-scale monitoring or processing of sensitive data, or (in Germany) if at least 20 people are constantly engaged in automated processing of personal data.',
      de: 'Ein Datenschutzbeauftragter (DSB) überwacht den Datenschutz in Ihrer Organisation: Er berät zu Pflichten, kontrolliert die Einhaltung und ist Anlaufstelle für die Aufsichtsbehörde und für die Betroffenen.\n\nNach DSGVO und BDSG brauchen Sie ihn in der Regel als öffentliche Stelle, wenn Ihre Kerntätigkeit in umfangreicher Überwachung oder in der Verarbeitung sensibler Daten besteht, oder (in Deutschland) wenn mindestens 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind.',
    },
  },
  {
    id: 'controller-processor',
    terms: ['controller', 'verantwortlicher', 'processor', 'auftragsverarbeiter'],
    answer: {
      en: 'The controller decides why and how personal data is processed. The processor only processes it on the controller\'s instructions.\n\nThat split decides your duties. A controller picks the legal basis, informs people, and answers their requests. A processor must follow instructions, keep the data secure, and help the controller. The two must have a data processing agreement (AVV) under GDPR Art. 28.',
      de: 'Der Verantwortliche entscheidet über Zwecke und Mittel der Verarbeitung. Der Auftragsverarbeiter verarbeitet die Daten nur nach Weisung des Verantwortlichen.\n\nDiese Rollenteilung bestimmt Ihre Pflichten. Der Verantwortliche wählt die Rechtsgrundlage, informiert die Betroffenen und beantwortet deren Anfragen. Der Auftragsverarbeiter muss Weisungen befolgen, die Daten sichern und den Verantwortlichen unterstützen. Zwischen beiden ist nach Art. 28 DSGVO ein AVV erforderlich.',
    },
  },
  {
    id: 'sub-processor',
    terms: ['sub-processor', 'subprocessor', 'sub processor', 'unterauftragsverarbeiter'],
    answer: {
      en: 'A sub-processor is a company your processor brings in to help handle your data, for example the cloud host behind your SaaS vendor.\n\nGDPR Art. 28 says a processor may not engage one without your prior written authorisation (specific or general), must pass the same data protection duties down the chain, and stays fully liable to you for what the sub-processor does. You should keep an up-to-date list of them.',
      de: 'Ein Unterauftragsverarbeiter ist ein Unternehmen, das Ihr Auftragsverarbeiter hinzuzieht, etwa der Cloud-Anbieter hinter Ihrem SaaS-Anbieter.\n\nNach Art. 28 DSGVO darf er ohne Ihre vorherige schriftliche Genehmigung (spezifisch oder allgemein) keinen einsetzen, muss dieselben Datenschutzpflichten weitergeben und haftet Ihnen gegenüber weiterhin voll für dessen Handeln. Führen Sie eine aktuelle Liste dieser Unterauftragsverarbeiter.',
    },
  },
  {
    id: 'high-risk',
    terms: ['high risk', 'high-risk', 'hochrisiko', 'hohes risiko'],
    answer: {
      en: 'High risk is the EU AI Act category for AI that can seriously affect people\'s safety or rights. It covers the uses listed in Annex III (recruitment, credit and insurance decisions, education, essential services, law enforcement, migration, justice, biometric identification, critical infrastructure) and AI that is a safety component of a regulated product.\n\nIf your system is high risk, the full set of duties applies: risk management, data governance, technical documentation, logging, human oversight, and accuracy, robustness and cybersecurity testing.',
      de: 'Hohes Risiko ist die Kategorie der KI-Verordnung für KI, die Sicherheit oder Rechte von Menschen erheblich beeinträchtigen kann. Sie umfasst die in Anhang III genannten Anwendungen (Personalauswahl, Kredit- und Versicherungsentscheidungen, Bildung, grundlegende Dienste, Strafverfolgung, Migration, Justiz, biometrische Identifizierung, kritische Infrastruktur) sowie KI als Sicherheitskomponente eines regulierten Produkts.\n\nGilt Ihr System als hochriskant, greifen alle Pflichten: Risikomanagement, Daten-Governance, technische Dokumentation, Protokollierung, menschliche Aufsicht sowie Prüfungen zu Genauigkeit, Robustheit und Cybersicherheit.',
    },
  },
  {
    id: 'prohibited',
    terms: ['prohibited practice', 'banned practice', 'article 5', 'art. 5', 'artikel 5', 'verbotene praktik', 'verbotene praktiken'],
    answer: {
      en: 'Art. 5 of the EU AI Act lists the practices that are simply banned. They include social scoring by public authorities, manipulative or exploitative techniques that distort behaviour and cause harm, emotion recognition at work or in schools, biometric categorisation that infers sensitive traits, untargeted scraping of facial images, predicting crime purely from profiling, and real-time remote biometric identification in public for law enforcement (with narrow exceptions).\n\nIf your system falls here, stop the use and take legal advice. Fines reach 35 million euros or 7% of worldwide turnover.',
      de: 'Art. 5 der KI-Verordnung nennt die schlicht verbotenen Praktiken: Social Scoring durch Behörden, manipulative oder ausbeuterische Techniken, die Verhalten verzerren und Schaden verursachen, Emotionserkennung am Arbeitsplatz oder in der Schule, biometrische Kategorisierung zur Ableitung sensibler Merkmale, ungezieltes Auslesen von Gesichtsbildern, Vorhersage von Straftaten allein durch Profiling sowie biometrische Fernidentifizierung in Echtzeit im öffentlichen Raum zu Strafverfolgungszwecken (mit engen Ausnahmen).\n\nFällt Ihr System darunter, stellen Sie die Nutzung ein und holen Sie Rechtsrat ein. Die Bußgelder reichen bis 35 Millionen Euro oder 7% des weltweiten Umsatzes.',
    },
  },
  {
    id: 'annex-iii',
    terms: ['annex iii', 'annex 3', 'anhang iii', 'anhang 3'],
    answer: {
      en: 'Annex III of the EU AI Act is the list of high-risk use areas: biometrics, critical infrastructure, education and vocational training, employment and worker management, access to essential private and public services (including credit scoring and insurance pricing), law enforcement, migration and border control, and the administration of justice and democratic processes.\n\nIf your AI is used in one of these areas, it is high risk and the full high-risk duties apply.',
      de: 'Anhang III der KI-Verordnung listet die Hochrisiko-Anwendungsbereiche: Biometrie, kritische Infrastruktur, allgemeine und berufliche Bildung, Beschäftigung und Personalmanagement, Zugang zu grundlegenden privaten und öffentlichen Diensten (einschließlich Kreditwürdigkeitsprüfung und Versicherungstarifierung), Strafverfolgung, Migration und Grenzkontrolle sowie Rechtspflege und demokratische Prozesse.\n\nWird Ihre KI in einem dieser Bereiche eingesetzt, ist sie hochriskant und es gelten alle Hochrisikopflichten.',
    },
  },
  {
    id: 'article-50',
    terms: ['article 50', 'art. 50', 'artikel 50', 'transparency obligation', 'transparenzpflicht'],
    answer: {
      en: 'Art. 50 of the EU AI Act sets the transparency duties for limited-risk AI. People must be told when they are interacting with an AI (for example a chatbot), unless it is obvious. AI-generated or manipulated text, image, audio and video, including deepfakes, must be labelled as artificially generated in a machine-readable way.\n\nThese duties apply on top of any other obligations, and they are usually the only ones for limited-risk systems.',
      de: 'Art. 50 der KI-Verordnung regelt die Transparenzpflichten für KI mit begrenztem Risiko. Menschen müssen darüber informiert werden, dass sie mit einer KI interagieren (etwa einem Chatbot), sofern das nicht offensichtlich ist. KI-erzeugte oder veränderte Texte, Bilder, Audios und Videos, einschließlich Deepfakes, müssen maschinenlesbar als künstlich erzeugt gekennzeichnet werden.\n\nDiese Pflichten gelten zusätzlich zu anderen und sind bei Systemen mit begrenztem Risiko meist die einzigen.',
    },
  },
  {
    id: 'gpai',
    terms: ['gpai', 'general-purpose ai', 'general purpose ai', 'foundation model', 'allzweck-ki'],
    answer: {
      en: 'General-purpose AI (GPAI) is a model trained broadly enough to do many different tasks, such as a large language model. The EU AI Act gives its providers their own duties: technical documentation, information for downstream deployers, a copyright policy, and a public summary of the training data.\n\nModels with systemic risk (very high compute) additionally must run model evaluations, assess and mitigate systemic risks, report serious incidents and ensure cybersecurity.',
      de: 'Allzweck-KI (GPAI) ist ein Modell, das breit genug trainiert wurde, um viele verschiedene Aufgaben zu erfüllen, etwa ein großes Sprachmodell. Die KI-Verordnung legt seinen Anbietern eigene Pflichten auf: technische Dokumentation, Informationen für nachgelagerte Betreiber, eine Urheberrechts-Policy und eine öffentliche Zusammenfassung der Trainingsdaten.\n\nModelle mit systemischem Risiko (sehr hohe Rechenleistung) müssen zusätzlich Modellbewertungen durchführen, systemische Risiken bewerten und mindern, schwerwiegende Vorfälle melden und Cybersicherheit gewährleisten.',
    },
  },
  {
    id: 'personal-data',
    terms: ['personal data', 'personenbezogene daten'],
    answer: {
      en: 'Personal data is any information relating to an identified or identifiable living person: a name, an email address, an IP address, a customer number, a photo, location data, or any combination that lets you single someone out.\n\nIf your AI system touches personal data anywhere in its lifecycle, including training data and prompts, the GDPR applies to it.',
      de: 'Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare lebende Person beziehen: Name, E-Mail-Adresse, IP-Adresse, Kundennummer, Foto, Standortdaten oder jede Kombination, mit der sich jemand herausgreifen lässt.\n\nBerührt Ihr KI-System an irgendeiner Stelle personenbezogene Daten, auch in Trainingsdaten und Prompts, gilt dafür die DSGVO.',
    },
  },
  {
    id: 'special-categories',
    terms: ['special categories', 'special category', 'sensitive data', 'besondere kategorien', 'sensible daten'],
    answer: {
      en: 'Special categories of personal data (GDPR Art. 9) are data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, plus genetic and biometric data used to identify someone, health data, and data about sex life or sexual orientation.\n\nProcessing them is forbidden unless a specific exception applies, for example explicit consent or a substantial public interest laid down in law. Using them in AI almost always calls for a DPIA.',
      de: 'Besondere Kategorien personenbezogener Daten (Art. 9 DSGVO) sind Daten, die rassische oder ethnische Herkunft, politische Meinungen, religiöse oder weltanschauliche Überzeugungen oder die Gewerkschaftszugehörigkeit offenbaren, außerdem genetische und zur Identifizierung genutzte biometrische Daten, Gesundheitsdaten sowie Daten zum Sexualleben oder zur sexuellen Orientierung.\n\nIhre Verarbeitung ist untersagt, sofern keine Ausnahme greift, etwa ausdrückliche Einwilligung oder ein gesetzlich geregeltes erhebliches öffentliches Interesse. Ihr Einsatz in KI erfordert fast immer eine DSFA.',
    },
  },
  {
    id: 'third-country',
    terms: ['third country', 'drittland', 'international transfer', 'internationale übermittlung', 'data transfer'],
    answer: {
      en: 'A third country is any country outside the EU and the EEA. Sending personal data there is an international transfer, governed by Chapter V of the GDPR.\n\nIt is only lawful with a safeguard: an adequacy decision for that country (for example the EU-US Data Privacy Framework for certified US companies), Standard Contractual Clauses plus a transfer impact assessment, binding corporate rules, or a narrow derogation. Remote access from a third country counts as a transfer too.',
      de: 'Ein Drittland ist jedes Land außerhalb der EU und des EWR. Personenbezogene Daten dorthin zu senden, ist eine internationale Übermittlung und richtet sich nach Kapitel V DSGVO.\n\nSie ist nur mit einer Garantie zulässig: ein Angemessenheitsbeschluss für dieses Land (etwa das EU-US Data Privacy Framework für zertifizierte US-Unternehmen), Standardvertragsklauseln samt Transfer Impact Assessment, verbindliche interne Datenschutzvorschriften oder eine enge Ausnahme. Auch ein Fernzugriff aus einem Drittland gilt als Übermittlung.',
    },
  },
  {
    id: 'legal-basis',
    terms: ['legal basis', 'lawful basis', 'rechtsgrundlage', 'legitimate interest', 'berechtigtes interesse'],
    answer: {
      en: 'Every processing of personal data needs a legal basis from GDPR Art. 6: consent, performance of a contract, a legal obligation, vital interests, a public task, or legitimate interests.\n\nLegitimate interests require a balancing test: your interest against the rights and reasonable expectations of the people concerned, written down. Consent must be freely given, specific, informed and as easy to withdraw as to give. Pick the basis before you start, and tell people which one you rely on.',
      de: 'Jede Verarbeitung personenbezogener Daten braucht eine Rechtsgrundlage nach Art. 6 DSGVO: Einwilligung, Vertragserfüllung, rechtliche Verpflichtung, lebenswichtige Interessen, öffentliche Aufgabe oder berechtigte Interessen.\n\nBerechtigte Interessen verlangen eine dokumentierte Abwägung: Ihr Interesse gegen die Rechte und vernünftigen Erwartungen der Betroffenen. Eine Einwilligung muss freiwillig, spezifisch und informiert sein und so leicht widerrufbar wie erteilbar. Wählen Sie die Grundlage vor dem Start und nennen Sie sie den Betroffenen.',
    },
  },
  {
    id: 'records-of-processing',
    terms: ['records of processing', 'record of processing', 'verarbeitungsverzeichnis', 'verzeichnis von verarbeitungstätigkeiten', 'ropa'],
    answer: {
      en: 'The record of processing activities (GDPR Art. 30) is the internal register of what you do with personal data: the purposes, the categories of people and data, who receives it, any transfers to third countries, the retention periods and the security measures.\n\nIt is not published, but a supervisory authority can demand it at any time, so keep it current. It is usually the first thing asked for in an audit.',
      de: 'Das Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO) ist Ihr internes Register dessen, was Sie mit personenbezogenen Daten tun: Zwecke, Kategorien von Betroffenen und Daten, Empfänger, Übermittlungen in Drittländer, Löschfristen und Sicherheitsmaßnahmen.\n\nEs wird nicht veröffentlicht, kann aber jederzeit von der Aufsichtsbehörde verlangt werden. Halten Sie es aktuell, es ist meist das Erste, wonach eine Prüfung fragt.',
    },
  },
];

// Abbreviations and native-language names that are not in the catalog data.
const LAW_ALIASES = {
  gdpr: ['dsgvo', 'datenschutz-grundverordnung', 'datenschutzgrundverordnung'],
  eu_ai_act: ['ki-verordnung', 'ki verordnung', 'ai act', 'aia', 'kivo'],
};

const LAW_LABELS = {
  en: {
    applies: 'Who must comply:', mustDo: 'What you must do:', regulator: 'Regulator:',
    penalties: 'Penalties:', dates: 'Key dates:', source: 'Official text:',
    more: 'Open the Law Explorer for the full detail.',
  },
  de: {
    applies: 'Wer betroffen ist:', mustDo: 'Was Sie tun müssen:', regulator: 'Aufsichtsbehörde:',
    penalties: 'Bußgelder:', dates: 'Wichtige Termine:', source: 'Gesetzestext:',
    more: 'Öffnen Sie den Gesetzes-Explorer für alle Details.',
  },
};

// Some catalog fields are arrays (whatYouMustDo, keyDates) and some are strings.
function asText(value) {
  if (Array.isArray(value)) return value.map((v) => `- ${v}`).join('\n');
  return value ? String(value) : '';
}

// The longest matching term wins, so "data processing agreement" beats "dpa".
export function matchGlossary(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;
  let best = null;
  let bestLen = 0;
  for (const entry of HELP_GLOSSARY) {
    for (const term of entry.terms) {
      if (term.length > bestLen && q.includes(term)) { best = entry; bestLen = term.length; }
    }
  }
  return best;
}

// Match a law the user named, against its English and German names, short name,
// key, official reference, and any extra abbreviation we know about.
export function matchLaw(query, frameworks = []) {
  const q = (query || '').toLowerCase().trim();
  if (!q || !frameworks.length) return null;
  let best = null;
  let bestLen = 0;
  for (const f of frameworks) {
    const names = [
      f.shortName, f.name, f.reference,
      f.translations?.de?.name,
      f.key ? f.key.replace(/_/g, ' ') : null,
      ...(LAW_ALIASES[f.key] || []),
    ];
    for (const raw of names) {
      if (!raw) continue;
      const term = String(raw).toLowerCase();
      if (term.length >= 3 && term.length > bestLen && q.includes(term)) { best = f; bestLen = term.length; }
    }
  }
  return best;
}

// Build a chat answer for a law straight from the catalog, so the Law Explorer
// stays the single source of truth. `localise` is i18n/lawExplorer's tLaw.
export function formatLawAnswer(framework, lang = 'en', localise = (f) => f) {
  const L = localise(framework, lang);
  const lbl = LAW_LABELS[lang] || LAW_LABELS.en;
  const lines = [framework.reference ? `${L.name} (${framework.reference})` : L.name];
  const section = (label, value) => {
    const text = asText(value);
    if (text) lines.push('', `${label}\n${text}`);
  };
  if (L.shortDescription) lines.push('', L.shortDescription);
  section(lbl.applies, L.appliesTo);
  section(lbl.mustDo, L.whatYouMustDo);
  section(lbl.regulator, L.regulator);
  section(lbl.penalties, L.penalties);
  if (framework.lawReferenceUrl) lines.push('', `${lbl.source} ${framework.lawReferenceUrl}`);
  lines.push('', lbl.more);
  return lines.join('\n');
}

// Phrases that mean "define this for me". They let a named law or term beat an
// otherwise-plausible how-to topic (e.g. "what is the EU AI Act" must not land
// on the "frameworks" topic just because it contains "eu").
const DEFINITION_CUES = [
  'what is', 'what are', 'what does', 'what do', 'define', 'definition', 'meaning', 'mean',
  'explain', 'stand for', 'tell me about',
  'was ist', 'was sind', 'was bedeutet', 'bedeutet', 'erkläre', 'erklär', 'wofür steht', 'erklären',
];

// The single entry point the chat uses: how-to topic, glossary term, or law.
export function answerFor(query, lang = 'en', frameworks = [], localise) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return HELP_FALLBACK[lang] || HELP_FALLBACK.en;

  const topic = matchTopic(q);
  const topicScore = topic ? topic.keywords.filter((kw) => q.includes(kw)).length : 0;
  const term = matchGlossary(q);
  const law = matchLaw(q, frameworks);
  const wantsDefinition = DEFINITION_CUES.some((cue) => q.includes(cue));

  // A named term or law wins when the user asks for a definition, or when the
  // topic match is only a weak single-keyword hit.
  if (wantsDefinition || topicScore < 2) {
    if (term) return term.answer[lang] || term.answer.en;
    if (law) return formatLawAnswer(law, lang, localise);
  }
  if (topic) return topic.answer[lang] || topic.answer.en;
  if (term) return term.answer[lang] || term.answer.en;
  if (law) return formatLawAnswer(law, lang, localise);
  return HELP_FALLBACK[lang] || HELP_FALLBACK.en;
}
