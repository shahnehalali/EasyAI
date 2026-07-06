import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, ClipboardCheck, Scale, Menu } from 'lucide-react';
import { useT } from '@/hooks/useT';

// Primary destinations for the mobile bottom navigation. Everything else lives
// behind the "Menu" tab, which opens the full sidebar drawer.
const TABS = [
  { to: '/', label: 'tab.home', Icon: LayoutDashboard, end: true },
  { to: '/ai-systems', label: 'tab.systems', Icon: Cpu },
  { to: '/assessments', label: 'tab.assess', Icon: ClipboardCheck },
  { to: '/law-explorer', label: 'tab.explore', Icon: Scale },
];

export default function MobileTabBar({ onMenu, onNavigate }) {
  const { t } = useT();
  return (
    <nav className="tabbar" aria-label={t('app.mainNav')}>
      {TABS.map((tb) => (
        <NavLink
          key={tb.to}
          to={tb.to}
          end={tb.end}
          onClick={onNavigate}
          className={({ isActive }) => `tabbar-item${isActive ? ' active' : ''}`}
        >
          <span className="tabbar-ico" aria-hidden="true"><tb.Icon size={20} strokeWidth={2} /></span>
          <span className="tabbar-label">{t(tb.label)}</span>
        </NavLink>
      ))}
      <button type="button" className="tabbar-item" onClick={onMenu} aria-label={t('app.openMenu')}>
        <span className="tabbar-ico" aria-hidden="true"><Menu size={20} strokeWidth={2} /></span>
        <span className="tabbar-label">{t('app.menu')}</span>
      </button>
    </nav>
  );
}
