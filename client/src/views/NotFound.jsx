import { Link } from 'react-router-dom';
import { useT } from '@/hooks/useT';

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="card" data-testid="not-found"><div className="empty">
      <div className="big">404</div>
      <h3 style={{ marginBottom: 6 }}>{t('nf.title')}</h3>
      <p className="muted">{t('nf.body')}</p>
      <Link className="btn btn-primary btn-sm" to="/" style={{ marginTop: 14 }}>{t('nf.back')}</Link>
    </div></div>
  );
}
