import { Link, Outlet } from 'react-router-dom';
import { useT } from '@/hooks/useT';
import { useLangStore } from '@/store/langStore';
import NeuralBackground from '@/components/NeuralBackground';
import LanguageSwitch from '@/components/ui/LanguageSwitch';

export default function AuthLayout() {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  return (
    <div className="auth-wrap">
      <div className="auth-watermark" aria-hidden="true">Compliance</div>
      <NeuralBackground />
      <div className="auth-lang"><LanguageSwitch /></div>
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 430 }}>
        <div className="auth-card" style={{ position: 'static' }}>
          <div className="auth-body">
            <Link to="/welcome" className="row" style={{ gap: 10, marginBottom: 4, textDecoration: 'none' }} data-testid="auth-brand-link">
              <img src="/trial.png" alt="Compliance Check" width={30} height={30} style={{ borderRadius: 7 }} />
              <span className="auth-brand">Compliance Check</span>
            </Link>
            <p className="muted small" style={{ marginBottom: 22 }}>{t('auth.tagline')}</p>
            <Outlet />
          </div>
        </div>
        <div className="row small muted" style={{ gap: 14 }}>
          <Link to="/welcome" className="small">{lang === 'de' ? 'Startseite' : 'Home'}</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/about" className="small">{lang === 'de' ? 'Ueber uns' : 'About'}</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/welcome#faq" className="small">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
