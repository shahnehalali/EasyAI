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
  en: 'I can help with that. Try one of the topics below, or ask about: getting started, classifying an AI system, working on a checklist, annual reviews, the Law Explorer, frameworks, or exporting a report.',
  de: 'Dabei helfe ich gern. Probieren Sie eines der Themen unten oder fragen Sie nach: erste Schritte, ein KI-System einstufen, eine Checkliste bearbeiten, jaehrliche Pruefungen, dem Gesetzes-Explorer, Rechtsrahmen oder einen Bericht exportieren.',
};

export const HELP_GREETING = {
  en: 'Hi! I am your JurisAI help assistant. Ask me how to use the app, or pick a topic to get started.',
  de: 'Hallo! Ich bin Ihr JurisAI-Hilfe-Assistent. Fragen Sie mich, wie Sie die App nutzen, oder waehlen Sie ein Thema.',
};
