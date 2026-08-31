import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { DOCS_HERO, DOCS_SECTIONS } from '@/data/marketingContent';
import { renderBold } from '@/utils/renderBold';

function DocShot({ shot, lang }) {
  return (
    <div className="mkt-shot-frame" data-testid="doc-shot">
      <div className="mkt-shot-chrome">
        <span className="mkt-showcase-dot" /><span className="mkt-showcase-dot" /><span className="mkt-showcase-dot" />
        <span className="mkt-shot-url">compliance.rit.services</span>
      </div>
      <img
        className="mkt-shot-img"
        src={shot.src}
        alt={shot.alt[lang]}
        loading="lazy"
        width={1440}
        height={900}
      />
    </div>
  );
}

function DocSection({ section, lang, index }) {
  const multi = section.shots.length > 1;
  return (
    <section id={section.id} className={`mkt-section mkt-docs-section${index % 2 === 1 ? ' mkt-section-alt' : ''}`}>
      <div className="content" style={{ maxWidth: 980 }}>
        <div className="mkt-docs-section-head">
          <div className="eyebrow">{section.eyebrow[lang]}</div>
          <h2 className="mkt-docs-title">{section.title[lang]}</h2>
          <p className="mkt-docs-body">{renderBold(section.body[lang])}</p>
          <ul className="mkt-row-points mkt-docs-points">
            {section.points.map((p, i) => (
              <li key={i}><span className="mkt-docs-dot" aria-hidden="true" /><span>{renderBold(p[lang])}</span></li>
            ))}
          </ul>
        </div>
        <div className={multi ? 'mkt-docs-shots mkt-docs-shots-2' : 'mkt-docs-shots'}>
          {section.shots.map((shot) => <DocShot key={shot.src} shot={shot} lang={lang} />)}
        </div>
      </div>
    </section>
  );
}

export default function Documentation() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div data-testid="marketing-docs">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 780 }}>
          <div className="eyebrow">{DOCS_HERO.eyebrow[lang]}</div>
          <h1 className="mkt-h1" style={{ fontSize: 38, textAlign: 'left' }}>{DOCS_HERO.title[lang]}</h1>
          <p className="mkt-lead" style={{ textAlign: 'left', margin: '16px 0 0' }}>{DOCS_HERO.subtitle[lang]}</p>
        </div>
      </section>

      <nav className="mkt-docs-quicknav" aria-label={lang === 'de' ? 'Auf dieser Seite' : 'On this page'}>
        <div className="content mkt-docs-quicknav-inner" style={{ maxWidth: 980 }}>
          {DOCS_SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="mkt-docs-quicknav-link">{s.title[lang].split(':')[0]}</a>
          ))}
        </div>
      </nav>

      {DOCS_SECTIONS.map((section, i) => (
        <DocSection key={section.id} section={section} lang={lang} index={i} />
      ))}

      <section className="mkt-cta-band">
        <div className="content" style={{ textAlign: 'center' }}>
          <h2>{lang === 'de' ? 'Bereit, es selbst zu sehen?' : 'Ready to see it yourself?'}</h2>
          <p className="mkt-lead-sm" style={{ margin: '10px auto 22px' }}>
            {lang === 'de'
              ? 'Erstellen Sie ein kostenloses Konto und registrieren Sie Ihr erstes KI-System in wenigen Minuten.'
              : 'Create a free account and register your first AI system in a few minutes.'}
          </p>
          <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
            <Link to="/welcome#faq" className="btn btn-outline">FAQ</Link>
            <Link to="/register" className="btn btn-primary">
              {lang === 'de' ? 'Kostenlos starten' : 'Start for free'} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
