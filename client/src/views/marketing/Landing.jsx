import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ListChecks, Compass, CalendarClock, Users, Lock,
  ArrowRight, ChevronDown, CheckCircle2, ShieldQuestion,
} from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import NeuralBackground from '@/components/NeuralBackground';
import ClassificationDemo from '@/components/marketing/ClassificationDemo';
import ProductShowcase from '@/components/marketing/ProductShowcase';
import FrameworkDirectory from '@/components/marketing/FrameworkDirectory';
import ProcessFlow from '@/components/marketing/ProcessFlow';
import {
  HERO, STATS, FEATURES, SECURITY_POINTS, PUBLIC_FAQ,
} from '@/data/marketingContent';

const ICONS = { ShieldCheck, ListChecks, Compass, CalendarClock, Users, Lock };

function FaqAccordion() {
  const lang = useLangStore((s) => s.lang);
  const [open, setOpen] = useState(() => new Set([PUBLIC_FAQ[0]?.id]));
  const toggle = (id) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return (
    <div className="card" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {PUBLIC_FAQ.map((item) => {
          const isOpen = open.has(item.id);
          return (
            <div key={item.id} className="faq-item">
              <button className="faq-q" aria-expanded={isOpen} onClick={() => toggle(item.id)} data-testid={`mkt-faq-q-${item.id}`}>
                <span>{item.q[lang]}</span>
                <ChevronDown size={17} className="faq-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
              </button>
              {isOpen && <p className="faq-a" data-testid={`mkt-faq-a-${item.id}`}>{item.a[lang]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Landing() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div data-testid="marketing-landing">
      <section className="mkt-hero">
        <NeuralBackground />
        <div className="mkt-hero-inner">
          <div className="eyebrow" style={{ marginBottom: 14 }}>{HERO.eyebrow[lang]}</div>
          <h1 className="mkt-h1">{HERO.title[lang]}</h1>
          <p className="mkt-lead">{HERO.subtitle[lang]}</p>
          <div className="row" style={{ gap: 12, marginTop: 26, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" data-testid="mkt-cta-primary">
              {HERO.ctaPrimary[lang]} <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-outline" data-testid="mkt-cta-secondary">{HERO.ctaSecondary[lang]}</Link>
          </div>
          <p className="muted small" style={{ marginTop: 18 }}>{HERO.trustLine[lang]}</p>
        </div>
      </section>

      <div className="mkt-stats-band">
        <div className="content mkt-stats-row">
          {STATS.map((s) => (
            <div key={s.label.en} className="mkt-stat">
              <div className="mkt-stat-value">{s.value}</div>
              <div className="mkt-stat-label">{s.label[lang]}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="how-it-works" className="mkt-section">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'Ablauf' : 'How it works'}</div>
            <h2>{lang === 'de' ? 'Von der Registrierung zur dokumentierten Compliance' : 'From registration to documented compliance'}</h2>
            <p className="mkt-lead-sm">
              {lang === 'de'
                ? 'Schritt 2 zeigt, wohin die Einstufung tatsaechlich fuehrt, mit allen vier moeglichen Ergebnissen.'
                : 'Step 2 shows exactly where the classification actually leads, with all four possible outcomes.'}
            </p>
          </div>
          <ProcessFlow />
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'Ausprobieren' : 'Try it'}</div>
            <h2>{lang === 'de' ? 'Wie ein KI-System eingestuft wird' : 'How an AI system gets classified'}</h2>
            <p className="mkt-lead-sm">
              {lang === 'de'
                ? 'Waehlen Sie eine Kategorie. Der Text ist die echte Erklaerung, die die Anwendung nach der Einstufung anzeigt.'
                : 'Pick a category. The text is the real explanation the app shows once a system is classified.'}
            </p>
          </div>
          <ClassificationDemo />
        </div>
      </section>

      <section className="mkt-section">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'In der Praxis' : 'In practice'}</div>
            <h2>{lang === 'de' ? 'Vom Dashboard bis zur Checkliste' : 'From the dashboard to the checklist'}</h2>
          </div>
          <ProductShowcase />
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'Funktionen' : 'Features'}</div>
            <h2>{lang === 'de' ? 'Alles, was Ihr Compliance-Team braucht' : 'Everything your compliance team needs'}</h2>
          </div>
          <div className="grid grid-3 mkt-feature-grid">
            {FEATURES.map((f) => {
              const Icon = ICONS[f.icon];
              return (
                <div key={f.icon} className="card mkt-feature-card">
                  <div className="card-body">
                    <div className="mkt-feature-icon"><Icon size={20} /></div>
                    <h3 style={{ marginTop: 12 }}>{f.title[lang]}</h3>
                    <p className="muted small">{f.body[lang]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="frameworks" className="mkt-section">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'Regelwerke' : 'Frameworks'}</div>
            <h2>{lang === 'de' ? '37 Gesetze, ein Ort' : '37 laws, one place'}</h2>
            <p className="mkt-lead-sm">
              {lang === 'de'
                ? 'EU-Verordnungen und deutsches Recht, durchsuchbar. Dies ist die vollstaendige, echte Liste, keine Auswahl.'
                : 'EU regulations and German law, searchable. This is the complete, real list, not a highlight reel.'}
            </p>
          </div>
          <FrameworkDirectory />
        </div>
      </section>

      <section id="security" className="mkt-section mkt-section-alt">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">{lang === 'de' ? 'Sicherheit' : 'Security'}</div>
            <h2>{lang === 'de' ? 'Ein Compliance-Werkzeug muss selbst sauber sein' : 'A compliance tool has to be clean itself'}</h2>
          </div>
          <div className="mkt-security-list">
            {SECURITY_POINTS.map((p) => (
              <div key={p.en} className="mkt-security-item">
                <CheckCircle2 size={18} className="mkt-security-check" aria-hidden="true" />
                <span>{p[lang]}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/security" className="btn btn-outline" data-testid="mkt-security-link">
              <ShieldQuestion size={16} /> {lang === 'de' ? 'Vollstaendige Sicherheits- und DSGVO-Seite' : 'Full security and GDPR page'}
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mkt-section">
        <div className="content">
          <div className="mkt-section-head">
            <div className="eyebrow">FAQ</div>
            <h2>{lang === 'de' ? 'Haeufig gestellte Fragen' : 'Frequently asked questions'}</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <section className="mkt-cta-band">
        <div className="content" style={{ textAlign: 'center' }}>
          <h2>{lang === 'de' ? 'Bereit anzufangen?' : 'Ready to get started?'}</h2>
          <p className="mkt-lead-sm" style={{ margin: '10px auto 22px' }}>
            {lang === 'de'
              ? 'Erstellen Sie ein kostenloses Konto und stufen Sie Ihr erstes KI-System in wenigen Minuten ein.'
              : 'Create a free account and classify your first AI system in a few minutes.'}
          </p>
          <Link to="/register" className="btn btn-primary" data-testid="mkt-cta-bottom">
            {HERO.ctaPrimary[lang]} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
