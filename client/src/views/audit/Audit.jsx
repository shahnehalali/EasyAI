import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/apis/auditApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, EmptyState } from '@/components/ui/Ui';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatDate, fromNow } from '@/utils/format';

export default function Audit() {
  const { can } = useAuth();
  const { t, lang } = useT();
  const [action, setAction] = useState('');
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', action],
    queryFn: () => auditApi.list(action ? { action } : {}),
  });
  const logs = data?.logs || [];
  const { page, setPage, pageItems, pageCount, total, pageSize } = usePagination(logs, 12);

  if (isLoading) return <SkeletonPage rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="audit-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('aud.eyebrow')}</div>
          <h1>{t('aud.title')}</h1>
          <p className="sub">{t('aud.sub')}</p>
        </div>
        {can('export') && (
          <a className="btn btn-outline" href={reportApi.auditCsvUrl()} data-testid="export-audit-csv">{t('aud.exportCsv')}</a>
        )}
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 14 }}>
        <select className="select" data-testid="audit-filter" style={{ maxWidth: 260 }} value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">{t('aud.allActions')}</option>
          {(data.actions || []).map((a) => <option key={a} value={a}>{a.replace(/[._]/g, ' ')}</option>)}
        </select>
        <span className="muted small">{logs.length} {t('aud.entries')}</span>
      </div>

      {logs.length === 0 ? (
        <div className="card"><EmptyState icon="≡" title={t('aud.emptyTitle')}>{t('aud.emptyBody')}</EmptyState></div>
      ) : (
        <div className="card">
         <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{t('aud.colWhen')}</th><th>{t('aud.colWho')}</th><th>{t('aud.colAction')}</th><th>{t('aud.colArea')}</th></tr></thead>
            <tbody>
              {pageItems.map((l) => (
                <tr key={l.id} data-testid="audit-row">
                  <td className="muted small">{formatDate(l.createdAt)} <span style={{ opacity: 0.7 }}>({fromNow(l.createdAt, lang)})</span></td>
                  <td>{l.actor}</td>
                  <td style={{ textTransform: 'capitalize' }}>{l.action.replace(/[._]/g, ' ')}</td>
                  <td className="muted small">{l.entityType || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      )}
    </div>
  );
}
