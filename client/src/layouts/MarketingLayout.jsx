import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import { useThemeStore } from '@/store/themeStore';
import { useLangStore } from '@/store/langStore';
import { FOOTER, RIT_SERVICES_URL } from '@/data/marketingContent';

// Public layout for the marketing site: landing page, about page, and the
// draft legal pages. Not gated by AppLayout's auth guard, reachable by anyone.
//
// Normally used as a react-router layout Route (renders whatever nested route
// matched, via <Outlet/>). AppLayout also renders it directly with an
// explicit `children` for the "/" route: an anonymous visit to "/" shows the
// landing page in place, so `children` wins over <Outlet/> when supplied.
export default function MarketingLayout({ children }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const lang = useLangStore((s) => s.lang);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  const anchorLinks = [
    { to: '/welcome#how-it-works', label: { en: 'How it works', de: 'So funktioniert es' } },
    { to: '/welcome#frameworks', label: { en: 'Frameworks', de: 'Regelwerke' } },
    { to: '/welcome#faq', label: { en: 'FAQ', de: 'FAQ' } },
  ];
  const routeLinks = [
    { to: '/docs', label: { en: 'Documentation', de: 'Dokumentation' } },
    { to: '/security', label: { en: 'Security', de: 'Sicherheit' } },
    { to: '/about', label: { en: 'About', de: 'Ueber uns' } },
  ];

  return (
    <div className="mkt-page" data-testid="marketing-page">
      <header className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link to="/welcome" className="mkt-brand" data-testid="mkt-logo">
            <img src="/trial.png" alt="" width={26} height={26} style={{ borderRadius: 6 }} />
            <span>Compliance Check</span>
          </Link>

          <nav className="mkt-nav-links" aria-label="Main">
            {anchorLinks.map((l) => (
              <a key={l.to} href={l.to} className="mkt-nav-link">{l.label[lang]}</a>
            ))}
            {routeLinks.map((l) => (
              <Link key={l.to} to={l.to} className="mkt-nav-link">{l.label[lang]}</Link>
            ))}
          </nav>

          <div className="mkt-nav-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              data-testid="mkt-theme-toggle"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <LanguageSwitch />
            <Link to="/login" className="btn btn-outline btn-sm">{lang === 'de' ? 'Anmelden' : 'Sign in'}</Link>
            <Link to="/register" className="btn btn-primary btn-sm">{lang === 'de' ? 'Kostenlos starten' : 'Start for free'}</Link>
            <button
              className="btn btn-ghost btn-sm mkt-nav-burger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mkt-nav-mobile">
            {anchorLinks.map((l) => (
              <a key={l.to} href={l.to} className="mkt-nav-link" onClick={() => setMenuOpen(false)}>{l.label[lang]}</a>
            ))}
            {routeLinks.map((l) => (
              <Link key={l.to} to={l.to} className="mkt-nav-link" onClick={() => setMenuOpen(false)}>{l.label[lang]}</Link>
            ))}
          </div>
        )}
      </header>

      <main key={location.pathname}>
        {children || <Outlet />}
      </main>

      <footer className="mkt-footer">
        <div className="mkt-footer-inner">
          <div className="mkt-footer-brand">
            <div className="row" style={{ gap: 9 }}>
              <img src="/trial.png" alt="" width={24} height={24} style={{ borderRadius: 6 }} />
              <span className="mkt-footer-name">Compliance Check</span>
            </div>
            <p className="muted small" style={{ maxWidth: 260, marginTop: 10 }}>{FOOTER.tagline[lang]}</p>
            <a
              href={RIT_SERVICES_URL}
              target="_blank"
              rel="noreferrer"
              className="mkt-footer-link mkt-footer-rit"
              data-testid="footer-rit-services-link"
            >
              rit.services &#8599;
            </a>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title.en} className="mkt-footer-col">
              <div className="mkt-footer-heading">{col.title[lang]}</div>
              {col.links.map((l) => (
                <Link key={l.to} to={l.to} className="mkt-footer-link">{l.label[lang]}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mkt-footer-bottom">
          <span>&copy; {year} {FOOTER.copyright[lang]}</span>
          <span className="muted small">RIT Services &middot; compliance.rit.services</span>
        </div>
      </footer>
    </div>
  );
}
