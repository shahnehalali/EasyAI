import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scale, Cpu, ClipboardCheck, BookOpen, FileText,
  Bell, ScrollText, Settings, ShieldCheck, HelpCircle, MessagesSquare,
  ChevronsLeft, ChevronsRight,
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
  { to: '/community', label: 'nav.community', Icon: MessagesSquare },
  { to: '/faq', label: 'nav.faq', Icon: HelpCircle },
  { section: 'section.account' },
  { to: '/notifications', label: 'nav.notifications', Icon: Bell },
  { to: '/audit', label: 'nav.audit', Icon: ScrollText },
  { to: '/settings', label: 'nav.settings', Icon: Settings },
];

// Group each section heading with the nav items that follow it, so the
// sidebar can draw a guide line from the heading down through its items.
const GROUPS = NAV.reduce((acc, item) => {
  if (item.section) acc.push({ section: item.section, items: [] });
  else acc[acc.length - 1].items.push(item);
  return acc;
}, []);

const STORE_KEY = 'aic_sidebar_collapsed';

export default function Sidebar({ open = false, onNavigate }) {
  const { isAdmin } = useAuth();
  const { t, lang } = useT();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORE_KEY) === '1'; } catch { return false; }
  });
  // A single glass "pill" that slides to whichever nav item is active, instead
  // of each item painting its own highlight. We measure the active link's box
  // relative to the nav and move the pill there; CSS transitions the slide.
  const navRef = useRef(null);
  const collapseTimer = useRef(0);
  const [pill, setPill] = useState({ top: 0, left: 0, width: 0, height: 0, ready: false });
  const [anim, setAnim] = useState(false);

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('.nav-link.active');
    if (!active) { setPill((p) => ({ ...p, ready: false })); return; }
    const nr = nav.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    setPill({
      top: ar.top - nr.top + nav.scrollTop,
      left: ar.left - nr.left + nav.scrollLeft,
      width: ar.width, height: ar.height, ready: true,
    });
  }, []);

  const toggle = () => {
    // While the sidebar width transitions, let the pill track it tightly (no
    // slide easing) so it does not lag behind; restore smooth slides after.
    setAnim(false);
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setAnim(true), 260);
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(STORE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  // Expose the collapsed state globally so the floating feedback button (which
  // lives outside the sidebar) can slide to follow the sidebar's edge.
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);
  useEffect(() => () => document.body.classList.remove('sidebar-collapsed'), []);

  // Re-measure on route / language / admin changes (active item moves).
  useLayoutEffect(() => { measure(); }, [location.pathname, lang, isAdmin, measure]);

  // Keep the pill glued to the active item as the nav resizes (while the
  // sidebar collapses/expands) and on window resize. The first paint enables
  // the slide so the pill starts in place instead of flying in from the corner.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(nav);
    window.addEventListener('resize', measure);
    const id = requestAnimationFrame(() => setAnim(true));
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(id);
      clearTimeout(collapseTimer.current);
    };
  }, [measure]);

  const navItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? t(item.label) : undefined}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
    >
      <span className="ico" aria-hidden="true"><item.Icon size={17} strokeWidth={2} /></span>
      <span className="nav-label">{t(item.label)}</span>
    </NavLink>
  );

  return (
    <aside className={`sidebar${open ? ' open' : ''}${collapsed ? ' collapsed' : ''}`} aria-label={t('app.primaryNav')}>
      <div className="sidebar-brand">
        <img src="/trial.png" alt="" width={30} height={30} style={{ borderRadius: 8, flexShrink: 0 }} />
        <span className="brand-name">Compliance Check</span>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggle}
          aria-label={collapsed ? t('app.expandSidebar') : t('app.collapseSidebar')}
          title={collapsed ? t('app.expandSidebar') : t('app.collapseSidebar')}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
      <nav ref={navRef} className="sidebar-nav" aria-label={t('app.mainNav')}>
        <span
          className={`nav-pill${anim ? ' anim' : ''}`}
          aria-hidden="true"
          style={{
            transform: `translate(${pill.left}px, ${pill.top}px)`,
            width: pill.width, height: pill.height,
            opacity: pill.ready ? 1 : 0,
          }}
        />
        {GROUPS.map((g) => (
          <div className="nav-group" key={g.section}>
            <div className="nav-section">{t(g.section)}</div>
            <div className="nav-group-items">{g.items.map(navItem)}</div>
          </div>
        ))}
        {isAdmin && (
          <div className="nav-group">
            <div className="nav-section">{t('section.administration')}</div>
            <div className="nav-group-items">
              <NavLink to="/admin" onClick={onNavigate} title={collapsed ? t('nav.catalogAdmin') : undefined}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <span className="ico" aria-hidden="true"><ShieldCheck size={17} strokeWidth={2} /></span>
                <span className="nav-label">{t('nav.catalogAdmin')}</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
