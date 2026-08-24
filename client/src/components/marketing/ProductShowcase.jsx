import { CheckCircle2, Circle, Clock, FileText, Lock } from 'lucide-react';
import { useLangStore } from '@/store/langStore';

// Five stylised previews of real screens, built from the app's own design
// tokens rather than screenshots, so they never go stale when the UI
// changes. All shown at once, side by side, nothing to click through:
// labelled clearly as previews, not presented as literal screenshots.

function DashboardMock({ lang }) {
  const tiles = [
    { label: { en: 'Overall standing', de: 'Gesamtstand' }, value: '78%' },
    { label: { en: 'AI systems', de: 'KI-Systeme' }, value: '5' },
    { label: { en: 'Open items', de: 'Offene Punkte' }, value: '12' },
    { label: { en: 'Reviews due', de: 'Faellige Pruefungen' }, value: '2' },
  ];
  return (
    <div className="mkt-mock-grid">
      {tiles.map((t) => (
        <div key={t.label.en} className="mkt-mock-tile">
          <div className="mkt-mock-tile-value">{t.value}</div>
          <div className="mkt-mock-tile-label">{t.label[lang]}</div>
        </div>
      ))}
      <div className="mkt-mock-bar-row">
        <div className="mkt-mock-bar"><div className="mkt-mock-bar-fill" style={{ width: '78%' }} /></div>
      </div>
    </div>
  );
}

function ChecklistMock({ lang }) {
  const items = [
    { status: 'done', text: { en: 'Register the AI system', de: 'KI-System registrieren' } },
    { status: 'done', text: { en: 'Run risk classification', de: 'Risikoeinstufung durchfuehren' } },
    { status: 'progress', text: { en: 'Document data governance measures', de: 'Massnahmen zur Daten-Governance dokumentieren' } },
    { status: 'open', text: { en: 'Set up human oversight process', de: 'Prozess fuer menschliche Aufsicht einrichten' } },
  ];
  const ICON = { done: CheckCircle2, progress: Clock, open: Circle };
  return (
    <div className="mkt-mock-list">
      {items.map((it) => {
        const Icon = ICON[it.status];
        return (
          <div key={it.text.en} className={`mkt-mock-item mkt-mock-item-${it.status}`}>
            <Icon size={16} />
            <span>{it.text[lang]}</span>
          </div>
        );
      })}
    </div>
  );
}

function ExplorerMock({ lang }) {
  const rows = [
    { name: 'EU AI Act', tag: { en: 'Applies', de: 'Gilt' }, on: true },
    { name: 'GDPR', tag: { en: 'Applies', de: 'Gilt' }, on: true },
    { name: 'DORA', tag: { en: 'Not applicable', de: 'Nicht einschlaegig' }, on: false },
    { name: 'NIS2', tag: { en: 'Applies', de: 'Gilt' }, on: true },
  ];
  return (
    <div className="mkt-mock-list">
      {rows.map((r) => (
        <div key={r.name} className="mkt-mock-row">
          <span style={{ fontWeight: 600 }}>{r.name}</span>
          <span className={`chip ${r.on ? 'chip-green' : 'chip-grey'}`}>{r.tag[lang]}</span>
        </div>
      ))}
    </div>
  );
}

function DocumentsMock() {
  const files = ['DPIA_Recommender.pdf', 'Risk_Assessment_v2.docx', 'Vendor_Contract.pdf'];
  return (
    <div className="mkt-mock-list">
      {files.map((name) => (
        <div key={name} className="mkt-mock-row">
          <span className="row mkt-mock-file">
            <FileText size={15} className="muted" />
            <span className="mkt-mock-filename">{name}</span>
          </span>
          <Lock size={12} className="muted" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function TeamMock({ lang }) {
  const members = [
    { name: 'Sven W.', role: { en: 'Owner', de: 'Inhaber' }, chip: 'chip-navy' },
    { name: 'Matthias W.', role: { en: 'Admin', de: 'Admin' }, chip: 'chip-gold' },
    { name: 'Nehal A.', role: { en: 'Member', de: 'Mitglied' }, chip: 'chip-grey' },
  ];
  return (
    <div className="mkt-mock-list">
      {members.map((m) => (
        <div key={m.name} className="mkt-mock-row">
          <span className="row" style={{ gap: 8 }}>
            <span className="mkt-mock-avatar">{m.name.split(' ').map((p) => p[0]).join('')}</span>
            <span style={{ fontWeight: 600 }}>{m.name}</span>
          </span>
          <span className={`chip ${m.chip}`}>{m.role[lang]}</span>
        </div>
      ))}
    </div>
  );
}

const PANELS = [
  { id: 'dashboard', label: { en: 'Dashboard', de: 'Dashboard' }, Panel: DashboardMock },
  { id: 'checklist', label: { en: 'Checklist', de: 'Checkliste' }, Panel: ChecklistMock },
  { id: 'explorer', label: { en: 'Law Explorer', de: 'Gesetzes-Explorer' }, Panel: ExplorerMock },
  { id: 'documents', label: { en: 'Documents', de: 'Dokumente' }, Panel: DocumentsMock },
  { id: 'team', label: { en: 'Team & roles', de: 'Team & Rollen' }, Panel: TeamMock },
];

export default function ProductShowcase() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div data-testid="product-showcase">
      <div className="mkt-showcase-grid">
        {PANELS.map((p, i) => (
          <div
            key={p.id}
            className="mkt-showcase-frame"
            style={{ animationDelay: `${i * 90}ms` }}
            data-testid={`showcase-panel-${p.id}`}
          >
            <div className="mkt-showcase-chrome">
              <span className="mkt-showcase-dot" /><span className="mkt-showcase-dot" /><span className="mkt-showcase-dot" />
              <span className="mkt-showcase-chrome-label">{p.label[lang]}</span>
            </div>
            <div className="mkt-showcase-body">
              <p.Panel lang={lang} />
            </div>
          </div>
        ))}
      </div>
      <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>
        {lang === 'de' ? 'Stilisierte Vorschauen, keine tatsaechlichen Screenshots.' : 'Stylised previews, not literal screenshots.'}
      </p>
    </div>
  );
}
