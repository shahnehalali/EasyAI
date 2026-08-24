import { Routes, Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import MarketingLayout from '@/layouts/MarketingLayout';

import Landing from '@/views/marketing/Landing';
import About from '@/views/marketing/About';
import Security from '@/views/marketing/Security';
import PrivacyDraft from '@/views/marketing/PrivacyDraft';
import ImprintDraft from '@/views/marketing/ImprintDraft';

import Login from '@/views/auth/Login';
import Register from '@/views/auth/Register';
import VerifyEmail from '@/views/auth/VerifyEmail';
import ForgotPassword from '@/views/auth/ForgotPassword';
import ResetPassword from '@/views/auth/ResetPassword';
import AcceptInvite from '@/views/auth/AcceptInvite';

import Dashboard from '@/views/dashboard/Dashboard';
import LawExplorer from '@/views/lawExplorer/LawExplorer';
import Frameworks from '@/views/frameworks/Frameworks';
import FrameworkDetail from '@/views/frameworks/FrameworkDetail';
import Community from '@/views/community/Community';
import ThreadDetail from '@/views/community/ThreadDetail';
import Timeline from '@/views/timeline/Timeline';
import AiSystems from '@/views/aiSystems/AiSystems';
import AiSystemNew from '@/views/aiSystems/AiSystemNew';
import AiSystemEdit from '@/views/aiSystems/AiSystemEdit';
import AiSystemClassify from '@/views/aiSystems/AiSystemClassify';
import AiSystemProfile from '@/views/aiSystems/AiSystemProfile';
import AiSystemDetail from '@/views/aiSystems/AiSystemDetail';
import Assessments from '@/views/assessments/Assessments';
import AssessmentEditor from '@/views/assessments/AssessmentEditor';
import Documents from '@/views/documents/Documents';
import Faq from '@/views/faq/Faq';
import NotificationsView from '@/views/notifications/Notifications';
import Settings from '@/views/settings/Settings';
import Audit from '@/views/audit/Audit';
import Admin from '@/views/admin/Admin';
import NotFound from '@/views/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing site. Not gated by auth, reachable by anyone. */}
      <Route element={<MarketingLayout />}>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/security" element={<Security />} />
        <Route path="/privacy" element={<PrivacyDraft />} />
        <Route path="/impressum" element={<ImprintDraft />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/law-explorer" element={<LawExplorer />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<ThreadDetail />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/frameworks" element={<Frameworks />} />
        <Route path="/frameworks/:key" element={<FrameworkDetail />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/ai-systems" element={<AiSystems />} />
        <Route path="/ai-systems/new" element={<AiSystemNew />} />
        <Route path="/ai-systems/:id/edit" element={<AiSystemEdit />} />
        <Route path="/ai-systems/:id/classify" element={<AiSystemClassify />} />
        <Route path="/ai-systems/:id/profile" element={<AiSystemProfile />} />
        <Route path="/ai-systems/:id" element={<AiSystemDetail />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/assessments/:id" element={<AssessmentEditor />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/notifications" element={<NotificationsView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
