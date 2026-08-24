import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { ABOUT, FOUNDER, RIT_SERVICES_URL } from '@/data/marketingContent';

export default function About() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div data-testid="marketing-about">
      <section className="mkt-section" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="eyebrow">{ABOUT.eyebrow[lang]}</div>
          <h1 className="mkt-h1" style={{ fontSize: 38, textAlign: 'left' }}>{ABOUT.title[lang]}</h1>
          <p className="mkt-lead" style={{ textAlign: 'left', margin: '16px 0 0' }}>{ABOUT.intro[lang]}</p>
          <a
            href={RIT_SERVICES_URL}
            target="_blank"
            rel="noreferrer"
            className="mkt-rit-badge"
            data-testid="about-rit-badge"
          >
            <img src="/rit-logo.svg" alt="RIT Services" className="mkt-rit-badge-logo" />
            <span>{lang === 'de' ? 'Teil von RIT Services' : 'Part of RIT Services'} &#8599;</span>
          </a>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 12 }}>
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="card mkt-founder-card" data-testid="founder-card">
            <div className="mkt-founder-photo-wrap">
              <img src={FOUNDER.photo} alt={FOUNDER.name} className="mkt-founder-photo" />
            </div>
            <div className="card-body mkt-founder-body">
              <div className="eyebrow">{lang === 'de' ? 'Gruender' : 'Founder'}</div>
              <h3 style={{ marginTop: 4 }}>{FOUNDER.name}</h3>
              <div className="mkt-founder-title">{FOUNDER.title[lang]}</div>
              <p className="mkt-founder-bio">&ldquo;{FOUNDER.bio[lang]}&rdquo;</p>
              <a href={RIT_SERVICES_URL} target="_blank" rel="noreferrer" className="mkt-founder-link">
                rit.services &#8599;
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-alt">
        <div className="content" style={{ maxWidth: 760 }}>
          <div className="stack" style={{ gap: 34 }}>
            {ABOUT.whySections.map((s) => (
              <div key={s.title.en}>
                <h3 style={{ marginBottom: 8 }}>{s.title[lang]}</h3>
                <p className="muted" style={{ lineHeight: 1.7 }}>{s.body[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta-band">
        <div className="content" style={{ textAlign: 'center' }}>
          <h2>{lang === 'de' ? 'Fragen an uns?' : 'Questions for us?'}</h2>
          <p className="mkt-lead-sm" style={{ margin: '10px auto 22px' }}>
            {lang === 'de'
              ? 'Schreiben Sie uns, oder sehen Sie sich die haeufig gestellten Fragen auf der Startseite an.'
              : 'Write to us, or check the frequently asked questions on the landing page.'}
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
