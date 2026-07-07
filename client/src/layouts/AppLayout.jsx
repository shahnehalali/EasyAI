import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Topbar from '@/components/Topbar';
import HelpAssistant from '@/components/HelpAssistant';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { organizationApi } from '@/apis/organizationApi';
import { Spinner } from '@/components/ui/Ui';
import { useT } from '@/hooks/useT';
import { FeedbackProvider } from '@rit-services/feedback-react';

const TITLES = [
  [/^\/$/, 'title.dashboard'],
  [/^\/law-explorer/, 'title.lawExplorer'],
  [/^\/community\/[^/]+/, 'title.thread'],
  [/^\/community/, 'title.community'],
  [/^\/faq/, 'title.faq'],
  [/^\/ai-systems\/new/, 'title.registerAi'],
  [/^\/ai-systems\/[^/]+\/classify/, 'title.classifyAi'],
  [/^\/ai-systems\/[^/]+\/profile/, 'title.dataProfile'],
  [/^\/ai-systems/, 'title.aiSystems'],
  [/^\/assessments\/[^/]+/, 'title.assessment'],
  [/^\/assessments/, 'title.assessments'],
  [/^\/frameworks\/[^/]+/, 'title.framework'],
  [/^\/frameworks/, 'title.frameworks'],
  [/^\/documents/, 'title.documents'],
  [/^\/notifications/, 'title.notifications'],
  [/^\/settings/, 'title.settings'],
  [/^\/admin/, 'title.admin'],
];

function titleKeyFor(path) {
  const found = TITLES.find(([re]) => re.test(path));
  return found ? found[1] : 'title.fallback';
}

export default function AppLayout() {
  const { status } = useAuth();
  const { t } = useT();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: org } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current, enabled: status === 'authenticated' });

  // Close the mobile menu on navigation.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // While the feedback plugin captures a screenshot, glass cards (backdrop-filter)
  // would collapse into a dark translucent blob because html-to-image cannot
  // render backdrop-filter. Flag <html> for the capture window so CSS can swap
  // them to a solid background. The page is hidden behind the feedback modal
  // during this, so the user never sees the swap.
  useEffect(() => {
    const onOpen = () => {
      document.documentElement.classList.add('ss-capturing');
      window.setTimeout(() => document.documentElement.classList.remove('ss-capturing'), 6000);
    };
    window.addEventListener('feedback:open', onOpen);
    return () => window.removeEventListener('feedback:open', onOpen);
  }, []);

  if (status === 'loading') return <div className="auth-wrap"><Spinner label={t('app.loadingWorkspace')} /></div>;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <FeedbackProvider
      config={{
        apiUrl: '/api/feedback', // relative: Vite proxy in dev, same API origin in prod
        mode: import.meta.env.VITE_FEEDBACK_MODE ?? 'floating',
        enabled: import.meta.env.VITE_FEEDBACK_ENABLED !== 'false',
        floatingPosition: 'bottom-left', // bottom-right is taken by the Help chat launcher
        buttonLabel: 'Feedback',
        meta: { app: 'jurisai' },
      }}
    >
      <div className="app-shell">
        <a href="#main-content" className="skip-link">{t('app.skipToContent')}</a>
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <div
          className={`sidebar-backdrop${menuOpen ? ' show' : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <div className="main">
          <Topbar title={t(titleKeyFor(location.pathname))} orgName={org?.name} onMenu={() => setMenuOpen(true)} />
          <main id="main-content" className="content">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <MobileTabBar onMenu={() => setMenuOpen(true)} onNavigate={() => setMenuOpen(false)} />
        <HelpAssistant />
      </div>
    </FeedbackProvider>
  );
}
