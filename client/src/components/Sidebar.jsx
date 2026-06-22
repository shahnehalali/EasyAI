import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Scale, Cpu, ClipboardCheck, BookOpen, FileText,
  Bell, ScrollText, Settings, ShieldCheck, HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

const NAV = [
  { section: 'section.overview' },
  { to: '/', label: 'nav.dashboard', Icon: LayoutDashboard, end: true },
  { section: 'section.compliance' },
  { to: '/ai-systems', label: 'nav.aiSystems', Icon: Cpu },
  { to: '/assessments', label: 'nav.assessments', Icon: ClipboardCheck },
  { to: '/frameworks', label: 'nav.frameworks', Icon: BookOpen },
  { to: '/documents', label: 'nav.documents', Icon: FileText },
  { section: 'section.explore' },
  { to: '/law-explorer', label: 'nav.lawExplorer', Icon: Scale },
  { to: '/faq', label: 'nav.faq', Icon: HelpCircle },
  { section: 'section.account' },
  { to: '/notifications', label: 'nav.notifications', Icon: Bell },
  { to: '/audit', label: 'nav.audit', Icon: ScrollText },
  { to: '/settings', label: 'nav.settings', Icon: Settings },
];

export default function Sidebar({ open = false, onNavigate }) {
  const { isAdmin } = useAuth();
  const { t } = useT();
  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Primary">
      <div className="sidebar-brand">
        <img src="/trial.png" alt="" width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
        Easy AI
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV.map((item, i) => (
          item.section
            ? <div key={`s-${i}`} className="nav-section">{t(item.section)}</div>
            : (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <span className="ico" aria-hidden="true"><item.Icon size={17} strokeWidth={2} /></span>{t(item.label)}
              </NavLink>
            )
        ))}
        {isAdmin && (
          <>
            <div className="nav-section">{t('section.administration')}</div>
            <NavLink to="/admin" onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="ico" aria-hidden="true"><ShieldCheck size={17} strokeWidth={2} /></span>{t('nav.catalogAdmin')}
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
