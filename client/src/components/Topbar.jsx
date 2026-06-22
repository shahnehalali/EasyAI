import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { useLangStore } from '@/store/langStore';
import { useT } from '@/hooks/useT';
import { initials } from '@/utils/format';
import NotificationBell from './NotificationBell';

export default function Topbar({ title, orgName, onMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useThemeStore();
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="row" style={{ gap: 4 }}>
        <button className="hamburger" aria-label="Open navigation menu" onClick={onMenu}><Menu size={20} /></button>
        <div className="topbar-title" data-testid="page-title">{title}</div>
      </div>
      <div className="topbar-right">
        {orgName && <span className="tag-pill" data-testid="org-name">{orgName}</span>}
        <div className="lang-switch" role="group" aria-label={t('lang.label')} data-testid="lang-switch">
          <button
            data-testid="lang-en"
            className={`lang-opt${lang === 'en' ? ' active' : ''}`}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >EN</button>
          <button
            data-testid="lang-de"
            className={`lang-opt${lang === 'de' ? ' active' : ''}`}
            aria-pressed={lang === 'de'}
            onClick={() => setLang('de')}
          >DE</button>
        </div>
        <button
          className="theme-toggle"
          data-testid="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
          title={theme === 'dark' ? 'Day mode' : 'Night mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationBell />
        <div ref={ref} style={{ position: 'relative' }}>
          <button className="avatar" data-testid="account-menu" onClick={() => setOpen((o) => !o)}>
            {initials(user?.fullName) || 'U'}
          </button>
          {open && (
            <div className="dropdown" style={{ width: 220 }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--hairline)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.fullName}</div>
                <div className="muted small">{user?.email}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
                onClick={() => { setOpen(false); navigate('/settings'); }}>{t('account.settings')}</button>
              <button className="btn btn-ghost btn-sm" data-testid="logout" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', color: 'var(--red)' }}
                onClick={onLogout}>{t('account.signOut')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
