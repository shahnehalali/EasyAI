import { Outlet } from 'react-router-dom';
import { useT } from '@/hooks/useT';
import NeuralBackground from '@/components/NeuralBackground';
import LanguageSwitch from '@/components/ui/LanguageSwitch';

export default function AuthLayout() {
  const { t } = useT();
  return (
    <div className="auth-wrap">
      <div className="auth-watermark" aria-hidden="true">Compliance</div>
      <NeuralBackground />
      <div className="auth-lang"><LanguageSwitch /></div>
      <div className="auth-card">
        <div className="auth-body">
          <div className="row" style={{ gap: 10, marginBottom: 4 }}>
            <img src="/trial.png" alt="Compliance Check" width={30} height={30} style={{ borderRadius: 7 }} />
            <span className="auth-brand">Compliance Check</span>
          </div>
          <p className="muted small" style={{ marginBottom: 22 }}>{t('auth.tagline')}</p>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
