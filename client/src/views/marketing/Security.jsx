import { Link } from 'react-router-dom';
import {
  Scale, KeyRound, Globe, Database, UserCheck, Clock, Share2,
  AlertTriangle, FileText, BadgeCheck, ClipboardList, ArrowRight,
} from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { GDPR_SECTIONS, GDPR_INTRO, GDPR_LAST_REVIEWED } from '@/data/marketingContent';
import { highlightTerms } from '@/utils/highlightTerms';

const ICONS = {
  Scale, KeyRound, Globe, Database, UserCheck, Clock, Share2,
  AlertTriangle, FileText, BadgeCheck, ClipboardList,
};

function PillarCard({ section, lang }) {
  const Icon = ICONS[section.icon];
  return (
    <div className={`card mkt-pillar mkt-pillar-${section.color}`} data-testid={`gdpr-pillar-${section.id}`}>
      <div className="card-body">
        <div className={`mkt-pillar-icon mkt-pillar-icon-${section.color}`}><Icon size={18} /></div>
        <div className={`mkt-pillar-stat mkt-pillar-stat-${section.color}`}>{section.stat[lang]}</div>
        <h3 className="mkt-pillar-q">{section.q[lang]}</h3>
        <p className="mkt-pillar-a">{highlightTerms(section.a[lang])}</p>
      </div>
    </div>
  );
}

function StraightRow({ section, lang }) {
  const Icon = ICONS[section.icon];
  return (
    <div className="mkt-straight-row" data-testid={`gdpr-straight-${section.id}`}>
      <div className="mkt-straight-icon mkt-straight-icon-amber"><Icon size={16} /></div>
      <div>
        <div className="mkt-straight-q">{section.q[lang]}</div>
        <p className="mkt-straight-a">{highlightTerms(section.a[lang])}</p>
      </div>
    </div>
  );
}

export default function Security() {
  const lang = useLangStore((s) => s.lang);
  const pillars = GDPR_SECTIONS.filter((s) => s.group === 'pillar');
  const straight = GDPR_SECTIONS.filter((s) => s.group === 'straight');

  return (
    <div data-testid="marketing-security">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="eyebrow">{lang === 'de' ? 'Sicherheit und DSGVO' : 'Security and GDPR'}</div>
          <h1 className="mkt-h1" style={{ fontSize: 38, textAlign: 'left' }}>
            {lang === 'de' ? 'Wie wir Ihre Daten schuetzen' : 'How we protect your data'}
          </h1>
          <p className="mkt-lead" style={{ textAlign: 'left', margin: '16px 0 0' }}>
            {highlightTerms(GDPR_INTRO[lang])}
          </p>
          <p className="muted small" style={{ marginTop: 12 }} data-testid="gdpr-last-reviewed">
            {lang === 'de' ? 'Zuletzt geprueft am' : 'Last reviewed'}: {GDPR_LAST_REVIEWED[lang]}
          </p>
        </div>
      </section>

      <section id="gdpr" className="mkt-section" style={{ paddingTop: 8 }}>
        <div className="content">
          <div className="grid grid-3 mkt-pillar-grid">
            {pillars.map((s) => <PillarCard key={s.id} section={s} lang={lang} />)}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="content" style={{ maxWidth: 780 }}>
          <div className="mkt-section-head" style={{ textAlign: 'left', margin: '0 0 24px' }}>
            <div className="eyebrow">{lang === 'de' ? 'Ehrliche Antworten' : 'Straight answers'}</div>
            <h2 style={{ marginTop: 8 }}>
              {lang === 'de' ? 'Was wir noch nicht haben, gesagt wie es ist' : 'What we do not have yet, said plainly'}
            </h2>
          </div>
          <div className="card">
            <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
              {straight.map((s) => <StraightRow key={s.id} section={s} lang={lang} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-cta-band">
        <div className="content" style={{ textAlign: 'center' }}>
          <h2>{lang === 'de' ? 'Weitere Fragen zur Sicherheit?' : 'More security questions?'}</h2>
          <p className="mkt-lead-sm" style={{ margin: '10px auto 22px' }}>
            {lang === 'de'
              ? 'Fuer eine Auftragsverarbeitungsvereinbarung oder weitere Unterlagen kontaktieren Sie uns.'
              : 'For a Data Processing Agreement or further documentation, contact us.'}
          </p>
          <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
            <Link to="/about" className="btn btn-outline">{lang === 'de' ? 'Ueber uns' : 'About'}</Link>
            <Link to="/register" className="btn btn-primary">
              {lang === 'de' ? 'Kostenlos starten' : 'Start for free'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
