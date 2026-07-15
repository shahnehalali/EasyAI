import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import Topbar from '@/components/Topbar';
import HelpAssistant from '@/components/HelpAssistant';
import TooltipLayer from '@/components/ui/TooltipLayer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { organizationApi } from '@/apis/organizationApi';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { assessmentApi } from '@/apis/assessmentApi';
import { Spinner } from '@/components/ui/Ui';
import { useT } from '@/hooks/useT';
import { FeedbackProvider } from '@rit-services/feedback-react';

const TITLES = [
  [/^\/$/, 'title.dashboard'],
  [/^\/law-explorer/, 'title.lawExplorer'],
  [/^\/community\/[^/]+/, 'title.thread'],
  [/^\/community/, 'title.community'],
  [/^\/faq/, 'title.faq'],
  [/^\/timeline/, 'title.timeline'],
  [/^\/ai-systems\/new/, 'title.registerAi'],
  [/^\/ai-systems\/[^/]+\/edit/, 'title.editAi'],
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
  const { t, lang } = useT();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: org } = useQuery({ queryKey: ['organization'], queryFn: organizationApi.current, enabled: status === 'authenticated' });

  // When we're inside a specific AI system (detail / edit / classify / profile),
  // name it in the top bar. The id is anything after /ai-systems/ that isn't the
  // "new" form. Shares the ['ai-system', id] cache with the detail page, so it's
  // usually already loaded.
  const aiSystemId = (() => {
    const m = location.pathname.match(/^\/ai-systems\/([^/]+)/);
    return m && m[1] !== 'new' ? m[1] : null;
  })();
  const { data: aiSystem } = useQuery({
    queryKey: ['ai-system', aiSystemId],
    queryFn: () => aiSystemApi.getById(aiSystemId),
    enabled: status === 'authenticated' && !!aiSystemId,
  });

  // Likewise, name the assessment you're viewing in the top bar. Shares the
  // ['assessment', id, lang] cache with the editor.
  const assessmentId = (() => {
    const m = location.pathname.match(/^\/assessments\/([^/]+)/);
    return m ? m[1] : null;
  })();
  const { data: assessment } = useQuery({
    queryKey: ['assessment', assessmentId, lang],
    queryFn: () => assessmentApi.getById(assessmentId, lang),
    enabled: status === 'authenticated' && !!assessmentId,
  });

  const titleKey = titleKeyFor(location.pathname);
  // The bare detail page falls under the "AI Systems" (list) title; make it
  // singular when we're viewing one, then append the entity's name.
  const baseTitle = titleKey === 'title.aiSystems' && aiSystemId ? t('asd.eyebrow') : t(titleKey);
  const detailName = aiSystem?.name || assessment?.template?.name || null;
  const pageTitle = (aiSystemId || assessmentId) && detailName ? `${baseTitle} — ${detailName}` : baseTitle;

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
        // 'manual': no floating button. The trigger lives in the profile card
        // (Topbar) via useFeedback().open(). The bottom-right corner is just the chat.
        mode: import.meta.env.VITE_FEEDBACK_MODE ?? 'manual',
        enabled: import.meta.env.VITE_FEEDBACK_ENABLED !== 'false',
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
          <Topbar title={pageTitle} orgName={org?.name} onMenu={() => setMenuOpen(true)} />
          <main id="main-content" className="content">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <MobileTabBar onMenu={() => setMenuOpen(true)} onNavigate={() => setMenuOpen(false)} />
        <HelpAssistant />
        <TooltipLayer />
      </div>
    </FeedbackProvider>
  );
}
