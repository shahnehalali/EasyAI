// Bilingual FAQ content. Grouped into categories; each item has a question (q)
// and answer (a) in English and German. Plain language, no legal advice.

export const FAQ_CATEGORIES = [
  {
    id: 'basics',
    title: { en: 'Getting started', de: 'Erste Schritte' },
    items: [
      {
        id: 'what-is',
        q: { en: 'What is Easy AI?', de: 'Was ist Easy AI?' },
        a: {
          en: 'Easy AI helps companies in Germany meet the rules for using AI. It turns EU and German law into plain-language checklists you can work through, document, and keep reviewed each year.',
          de: 'Easy AI hilft Unternehmen in Deutschland, die Regeln für den Einsatz von KI einzuhalten. Es übersetzt EU- und deutsches Recht in verständliche Checklisten, die Sie abarbeiten, dokumentieren und jährlich prüfen können.',
        },
      },
      {
        id: 'first-steps',
        q: { en: 'How do I get started?', de: 'Wie fange ich an?' },
        a: {
          en: 'Register an AI system, answer a short questionnaire to classify its risk, and Easy AI builds the right checklists for you. Then work through each item and record your evidence.',
          de: 'Legen Sie ein KI-System an, beantworten Sie einen kurzen Fragebogen zur Risikoeinstufung, und Easy AI erstellt die passenden Checklisten für Sie. Arbeiten Sie dann jeden Punkt durch und halten Sie Ihre Nachweise fest.',
        },
      },
      {
        id: 'is-legal-advice',
        q: { en: 'Is this legal advice?', de: 'Ist das eine Rechtsberatung?' },
        a: {
          en: 'No. Easy AI gives plain-language guidance for orientation only. For binding interpretation of the law, consult a qualified lawyer.',
          de: 'Nein. Easy AI bietet verständliche Hinweise nur zur Orientierung. Für eine verbindliche Auslegung des Rechts wenden Sie sich an eine qualifizierte Anwältin oder einen qualifizierten Anwalt.',
        },
      },
    ],
  },
  {
    id: 'classification',
    title: { en: 'Risk classification', de: 'Risikoeinstufung' },
    items: [
      {
        id: 'how-classify',
        q: { en: 'How is an AI system classified?', de: 'Wie wird ein KI-System eingestuft?' },
        a: {
          en: 'You answer yes/no questions about what the AI does. Based on your answers, the system is labelled Prohibited, High, Limited, or Minimal risk, with an explanation. A "Yes" usually flags a riskier use, so it shows red; "No" shows green.',
          de: 'Sie beantworten Ja/Nein-Fragen dazu, was die KI tut. Anhand Ihrer Antworten wird das System als Verboten, Hoch, Begrenzt oder Minimal eingestuft, mit einer Erklärung. Ein "Ja" deutet meist auf eine riskantere Nutzung hin und wird rot; "Nein" wird grün.',
        },
      },
      {
        id: 'reclassify',
        q: { en: 'Can I re-classify a system later?', de: 'Kann ich ein System später neu einstufen?' },
        a: {
          en: 'Yes. If your AI changes purpose or how it is used, open the system and run the classification again. The checklists update to match the new risk level.',
          de: 'Ja. Wenn sich Zweck oder Nutzung Ihrer KI ändern, öffnen Sie das System und führen Sie die Einstufung erneut durch. Die Checklisten passen sich an die neue Risikostufe an.',
        },
      },
    ],
  },
  {
    id: 'assessments',
    title: { en: 'Assessments and reviews', de: 'Bewertungen und Prüfungen' },
    items: [
      {
        id: 'what-assessment',
        q: { en: 'What is an assessment?', de: 'Was ist eine Bewertung?' },
        a: {
          en: 'An assessment is one checklist: a framework applied to an AI system or to your whole organisation. Each row is a requirement you document with a status, evidence text, owner, and attachments.',
          de: 'Eine Bewertung ist eine Checkliste: ein Rechtsrahmen, angewandt auf ein KI-System oder Ihr gesamtes Unternehmen. Jede Zeile ist eine Anforderung, die Sie mit Status, Nachweistext, Verantwortlichem und Anhängen dokumentieren.',
        },
      },
      {
        id: 'autosave',
        q: { en: 'Are my changes saved automatically?', de: 'Werden meine Änderungen automatisch gespeichert?' },
        a: {
          en: 'Yes. Status changes and evidence text save as you go. You will see a saved confirmation on each item.',
          de: 'Ja. Statusänderungen und Nachweistexte werden laufend gespeichert. Bei jedem Punkt sehen Sie eine Speicherbestätigung.',
        },
      },
      {
        id: 'reviews',
        q: { en: 'Why do I get review reminders?', de: 'Warum erhalte ich Prüf-Erinnerungen?' },
        a: {
          en: 'Compliance must stay current. Each assessment has an annual review date. When it is due, you get a notification and the assessment is flagged "needs review". Click "Mark reviewed" to reset it for another year.',
          de: 'Compliance muss aktuell bleiben. Jede Bewertung hat ein jährliches Prüfdatum. Wird es fällig, erhalten Sie eine Benachrichtigung und die Bewertung wird als "Prüfung nötig" markiert. Klicken Sie auf "Als geprüft markieren", um sie für ein weiteres Jahr zurückzusetzen.',
        },
      },
      {
        id: 'export',
        q: { en: 'How do I show my compliance to an auditor?', de: 'Wie zeige ich meine Compliance einem Prüfer?' },
        a: {
          en: 'Export a PDF or CSV. The dashboard exports your whole organisation; an assessment exports that single checklist with its evidence.',
          de: 'Exportieren Sie ein PDF oder CSV. Die Übersicht exportiert Ihr gesamtes Unternehmen; eine Bewertung exportiert diese eine Checkliste mit ihren Nachweisen.',
        },
      },
    ],
  },
  {
    id: 'account',
    title: { en: 'Account, team and language', de: 'Konto, Team und Sprache' },
    items: [
      {
        id: 'invite',
        q: { en: 'How do I invite my team?', de: 'Wie lade ich mein Team ein?' },
        a: {
          en: 'Go to Settings. An owner or admin can invite teammates by email, set their role, or remove them. Roles control who can edit compliance, manage members, and export reports.',
          de: 'Gehen Sie zu den Einstellungen. Ein Eigentümer oder Admin kann Teammitglieder per E-Mail einladen, ihre Rolle festlegen oder sie entfernen. Rollen steuern, wer Compliance bearbeiten, Mitglieder verwalten und Berichte exportieren darf.',
        },
      },
      {
        id: 'language',
        q: { en: 'How do I change the language or theme?', de: 'Wie ändere ich Sprache oder Design?' },
        a: {
          en: 'Use the EN / DE switch in the top bar to change the language, and the sun/moon button next to it for day or night mode. Both are remembered for your next visit.',
          de: 'Nutzen Sie den EN / DE-Schalter in der oberen Leiste, um die Sprache zu ändern, und die Sonne/Mond-Schaltfläche daneben für den Tag- oder Nachtmodus. Beides wird für Ihren nächsten Besuch gespeichert.',
        },
      },
      {
        id: 'data',
        q: { en: 'Is my data private to my organisation?', de: 'Sind meine Daten auf mein Unternehmen beschränkt?' },
        a: {
          en: 'Yes. Your AI systems, assessments, documents, and evidence are scoped to your organisation and only visible to your members.',
          de: 'Ja. Ihre KI-Systeme, Bewertungen, Dokumente und Nachweise sind auf Ihr Unternehmen beschränkt und nur für Ihre Mitglieder sichtbar.',
        },
      },
    ],
  },
];
