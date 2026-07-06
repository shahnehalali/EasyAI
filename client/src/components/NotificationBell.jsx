import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadCount, useNotifications } from '@/hooks/useNotifications';
import { fromNow } from '@/utils/format';
import { useT } from '@/hooks/useT';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { data: count = 0 } = useUnreadCount();
  const { list, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const items = list.data || [];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="bell" aria-label={t('nb.aria')} data-testid="notif-bell" onClick={() => setOpen((o) => !o)}>
        <Bell size={19} strokeWidth={2} />
        {count > 0 && <span className="count" data-testid="notif-count">{count > 9 ? '9+' : count}</span>}
      </button>
      {open && (
        <div className="dropdown">
          <div className="row-between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--hairline)' }}>
            <strong style={{ fontSize: 13 }}>{t('nb.title')}</strong>
            {count > 0 && <button className="btn btn-ghost btn-sm" onClick={() => markAllRead.mutate()}>{t('nb.markAllRead')}</button>}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.length === 0 && <div className="muted small" style={{ padding: 16 }}>{t('nb.empty')}</div>}
            {items.map((n) => (
              <button key={n.id} data-testid="notif-item"
                onClick={() => { if (!n.readAt) markRead.mutate(n.id); if (n.link) navigate(n.link); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px',
                  borderBottom: '1px solid var(--hairline-2)', background: n.readAt ? 'var(--surface)' : 'var(--blue-bg)',
                  cursor: 'pointer', border: 'none', borderLeft: n.readAt ? '3px solid transparent' : '3px solid var(--gold)',
                }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                <div className="muted small">{n.body}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{fromNow(n.createdAt, lang)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
