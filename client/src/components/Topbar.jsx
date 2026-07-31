import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, ChevronLeft, Sun, Moon, ShieldCheck, Cpu, ClipboardCheck, Building2, ArrowRight, LogOut, Megaphone } from 'lucide-react';
import { useFeedback } from '@rit-services/feedback-react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { useT } from '@/hooks/useT';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import { initials } from '@/utils/format';
import { organizationApi } from '@/apis/organizationApi';
import { dashboardApi } from '@/apis/dashboardApi';
import TextEffect from '@/components/ui/TextEffect';
import NotificationBell from './NotificationBell';

const prettyRole = (role) => (role || '').replace(/_/g, ' ');

export default function Topbar({ title, orgName, onMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useThemeStore();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const { open: openFeedback, config: fbConfig } = useFeedback();
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Sub-pages (e.g. /ai-systems/:id) are not reachable from the bottom tabs, so
  // show a back button on mobile to return.
  const isSubPage = location.pathname.split('/').filter(Boolean).length > 1;

  // Profile card data (org profile + high-level compliance stats). Loaded when
  // the menu opens; both reuse existing query caches so it is usually instant.
  const { data: org } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current, enabled: open });
  const { data: summary } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.summary, enabled: open });

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="row" style={{ gap: 4 }}>
        <button className="hamburger" aria-label={t('app.openMenu')} onClick={onMenu}><Menu size={20} /></button>
        {isSubPage && (
          <button className="topbar-back" aria-label={t('common.back')} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="topbar-title" data-testid="page-title">
          <TextEffect per="char" preset="slide">{title}</TextEffect>
        </div>
      </div>
      <div className="topbar-right">
        <LanguageSwitch />
        <span className="topbar-sep" aria-hidden="true" />
        <button
          className={`theme-switch${theme === 'dark' ? ' night' : ' day'}`}
          data-testid="theme-toggle"
          role="switch"
          aria-checked={theme === 'dark'}
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
          title={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
        >
          <span className="ts-label">{theme === 'dark' ? t('theme.night') : t('theme.day')}</span>
          <span className="ts-knob" aria-hidden="true">{theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}</span>
        </button>
        <NotificationBell />
        <div ref={ref} style={{ position: 'relative' }}>
          <button className="avatar" data-testid="account-menu" onClick={() => setOpen((o) => !o)}>
            {initials(user?.fullName) || 'U'}
          </button>
          {open && (
            <div className="profile-card" role="menu" data-testid="profile-card">
              <div className="profile-banner" />
              <div className="profile-avatar" aria-hidden="true">{initials(user?.fullName) || 'U'}</div>
              <div className="profile-body">
                <div className="profile-idrow">
                  <div className="profile-name">{user?.fullName}</div>
                  {user?.role && <span className="profile-role">{prettyRole(user.role)}</span>}
                </div>
                <div className="profile-email">{user?.email}</div>

                <div className="profile-stats">
                  <div className="pstat">
                    <ShieldCheck size={15} strokeWidth={2} />
                    <div className="pstat-num">{summary ? `${summary.overall}%` : '—'}</div>
                    <div className="pstat-label">{t('profile.compliance')}</div>
                  </div>
                  <div className="pstat">
                    <Cpu size={15} strokeWidth={2} />
                    <div className="pstat-num">{summary?.counts?.aiSystems ?? '—'}</div>
                    <div className="pstat-label">{t('profile.aiSystems')}</div>
                  </div>
                  <div className="pstat">
                    <ClipboardCheck size={15} strokeWidth={2} />
                    <div className="pstat-num">{summary?.counts?.assessments ?? '—'}</div>
                    <div className="pstat-label">{t('profile.assessments')}</div>
                  </div>
                </div>

                <div className="profile-org">
                  <Building2 size={16} strokeWidth={2} />
                  <div className="profile-org-text">
                    <div className="profile-org-name">{org?.name || orgName || t('profile.orgLabel')}</div>
                    <div className="profile-org-meta">
                      {[org?.industry, org?.country].filter(Boolean).join(' · ') || t('profile.orgLabel')}
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="profile-cta" data-testid="account-settings"
                    onClick={() => { setOpen(false); navigate('/settings'); }}>
                    <span className="profile-cta-arrow"><ArrowRight size={15} /></span>
                    {t('account.settings')}
                  </button>
                  {fbConfig.enabled !== false && (
                    <button className="profile-cta profile-cta-alt" data-testid="account-feedback"
                      onClick={() => { setOpen(false); openFeedback(); }}>
                      <span className="profile-cta-arrow"><Megaphone size={14} /></span>
                      {t('account.feedback')}
                    </button>
                  )}
                </div>
                <button className="profile-signout" data-testid="logout" onClick={onLogout}>
                  <LogOut size={14} /> {t('account.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
