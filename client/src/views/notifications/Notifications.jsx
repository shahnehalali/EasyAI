import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Spinner, Banner, EmptyState, Card } from '@/components/ui/Ui';
import { fromNow, formatDate } from '@/utils/format';
import { useT } from '@/hooks/useT';

export default function Notifications() {
  const { t } = useT();
  const { list, markRead, markAllRead } = useNotifications();
  if (list.isLoading) return <Spinner />;
  if (list.error) return <Banner kind="error">{list.error.message}</Banner>;
  const items = list.data || [];

  return (
    <div data-testid="notifications-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('notif.eyebrow')}</div>
          <h1>{t('notif.title')}</h1>
          <p className="sub">{t('notif.sub')}</p>
        </div>
        {items.some((n) => !n.readAt) && <button className="btn btn-outline" onClick={() => markAllRead.mutate()}>{t('common.markAllRead')}</button>}
      </div>

      {items.length === 0 ? (
        <Card><EmptyState icon="◔" title={t('notif.empty.title')}>{t('notif.empty.body')}</EmptyState></Card>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {items.map((n) => (
            <div key={n.id} data-testid="notification-row" className="card" style={{ borderLeft: n.readAt ? '1px solid var(--hairline)' : '3px solid var(--gold)' }}>
              <div className="card-body row-between">
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{n.title}</strong>
                    {!n.readAt && <span className="tag-pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>{t('common.new')}</span>}
                  </div>
                  <p className="muted small" style={{ margin: '4px 0 0' }}>{n.body}</p>
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{formatDate(n.createdAt)} ({fromNow(n.createdAt)})</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {n.link && <Link className="btn btn-primary btn-sm" to={n.link} onClick={() => !n.readAt && markRead.mutate(n.id)}>{t('common.open')}</Link>}
                  {!n.readAt && <button className="btn btn-ghost btn-sm" onClick={() => markRead.mutate(n.id)}>{t('common.markRead')}</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
