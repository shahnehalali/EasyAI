import { useEffect, useRef, useState } from 'react';
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
        width={shot.w}
        height={shot.h}
      />
    </div>
  );
}

function DocSection({ section, lang, registerRef }) {
  const multi = section.shots.length > 1;
  return (
    <section id={section.id} className="mkt-docs-section" ref={(el) => registerRef(section.id, el)}>
      <div className="mkt-docs-section-head">
        <div className="eyebrow">{section.eyebrow[lang]}</div>
        <h2 className="mkt-docs-title">{section.title[lang]}</h2>
        {section.body[lang].map((para, i) => (
          <p className="mkt-docs-body" key={i}>{renderBold(para)}</p>
        ))}
        <ul className="mkt-row-points mkt-docs-points">
          {section.points.map((p, i) => (
            <li key={i}><span className="mkt-docs-dot" aria-hidden="true" /><span>{renderBold(p[lang])}</span></li>
          ))}
        </ul>
      </div>
      <div className={multi ? 'mkt-docs-shots mkt-docs-shots-2' : 'mkt-docs-shots'}>
        {section.shots.map((shot) => <DocShot key={shot.src} shot={shot} lang={lang} />)}
      </div>
    </section>
  );
}

export default function Documentation() {
  const lang = useLangStore((s) => s.lang);
  const [activeId, setActiveId] = useState(DOCS_SECTIONS[0]?.id);
  const sectionEls = useRef({});

  const registerRef = (id, el) => {
    if (el) sectionEls.current[id] = el;
    else delete sectionEls.current[id];
  };

  // Tracks every section currently inside the "active" band, not just the
  // last one IntersectionObserver happens to report: right after a jump,
  // two adjacent sections can both intersect for a moment, and picking
  // "whichever fired last" flickers to the wrong link. Instead this keeps
  // the full intersecting set and always highlights the topmost of them,
  // in document order, which is the one a reader actually sees first.
  useEffect(() => {
    const els = Object.values(sectionEls.current);
    if (!els.length) return undefined;
    const intersecting = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        });
        const topmost = DOCS_SECTIONS.find((s) => intersecting.has(s.id));
        if (topmost) setActiveId(topmost.id);
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <div data-testid="marketing-docs">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 780 }}>
          <div className="eyebrow">{DOCS_HERO.eyebrow[lang]}</div>
          <h1 className="mkt-h1" style={{ fontSize: 38, textAlign: 'left' }}>{DOCS_HERO.title[lang]}</h1>
          <p className="mkt-lead" style={{ textAlign: 'left', margin: '16px 0 0' }}>{DOCS_HERO.subtitle[lang]}</p>
        </div>
      </section>

      <div className="content mkt-docs-shell" style={{ maxWidth: 1240 }}>
        <aside className="mkt-docs-sidebar" aria-label={lang === 'de' ? 'Auf dieser Seite' : 'On this page'}>
          <nav>
            {DOCS_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`mkt-docs-sidebar-link${activeId === s.id ? ' active' : ''}`}
                aria-current={activeId === s.id ? 'true' : undefined}
              >
                {s.title[lang].split(':')[0]}
              </a>
            ))}
          </nav>
        </aside>

        <div className="mkt-docs-main">
          {DOCS_SECTIONS.map((section) => (
            <DocSection key={section.id} section={section} lang={lang} registerRef={registerRef} />
          ))}
        </div>
      </div>

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
