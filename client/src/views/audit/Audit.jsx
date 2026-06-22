import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/apis/auditApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonPage, ErrorState, EmptyState } from '@/components/ui/Ui';
import { formatDate, fromNow } from '@/utils/format';

export default function Audit() {
  const { can } = useAuth();
  const [action, setAction] = useState('');
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', action],
    queryFn: () => auditApi.list(action ? { action } : {}),
  });

  if (isLoading) return <SkeletonPage rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const logs = data.logs || [];

  return (
    <div data-testid="audit-page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Accountability</div>
          <h1>Audit log</h1>
          <p className="sub">A record of important actions in your organisation: who did what, and when.</p>
        </div>
        {can('export') && (
          <a className="btn btn-outline" href={reportApi.auditCsvUrl()} data-testid="export-audit-csv">Export CSV</a>
        )}
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 14 }}>
        <select className="select" data-testid="audit-filter" style={{ maxWidth: 260 }} value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All actions</option>
          {(data.actions || []).map((a) => <option key={a} value={a}>{a.replace(/[._]/g, ' ')}</option>)}
        </select>
        <span className="muted small">{logs.length} entries</span>
      </div>

      {logs.length === 0 ? (
        <div className="card"><EmptyState icon="≡" title="No activity yet">Actions your team takes will be recorded here.</EmptyState></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Area</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} data-testid="audit-row">
                  <td className="muted small">{formatDate(l.createdAt)} <span style={{ opacity: 0.7 }}>({fromNow(l.createdAt)})</span></td>
                  <td>{l.actor}</td>
                  <td style={{ textTransform: 'capitalize' }}>{l.action.replace(/[._]/g, ' ')}</td>
                  <td className="muted small">{l.entityType || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
