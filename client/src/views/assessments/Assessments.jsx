import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assessmentApi } from '@/apis/assessmentApi';
import { SkeletonPage, ErrorState, StatusChip, RiskChip, Progress, Chip, EmptyState } from '@/components/ui/Ui';
import { formatDate, progressVariant } from '@/utils/format';
import { useT } from '@/hooks/useT';

const TIER_CHIP = { 1: 'chip-navy', 2: 'chip-gold', 3: 'chip-grey' };

export default function Assessments() {
  const { t } = useT();
  const { data: assessments = [], isLoading, error, refetch } = useQuery({ queryKey: ['assessments'], queryFn: assessmentApi.list });

  // Group by scope: each AI system, plus an organisation-wide group.
  const groups = useMemo(() => {
    const map = new Map();
    for (const a of assessments) {
      const key = a.aiSystem?.id || 'org';
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: a.aiSystem?.name || null,
          risk: a.aiSystem?.riskCategory || null,
          isOrg: !a.aiSystem,
          rows: [],
        });
      }
      map.get(key).rows.push(a);
    }
    // Organisation-wide group last.
    return [...map.values()].sort((x, y) => (x.isOrg === y.isOrg ? 0 : x.isOrg ? 1 : -1));
  }, [assessments]);

  const summary = useMemo(() => {
    const s = { total: assessments.length, completed: 0, inProgress: 0, needsReview: 0 };
    for (const a of assessments) {
      if (a.status === 'completed') s.completed += 1;
      else if (a.status === 'needs_review') s.needsReview += 1;
      else if (a.status === 'in_progress') s.inProgress += 1;
    }
    return s;
  }, [assessments]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="assessments">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('as.eyebrow')}</div>
          <h1>{t('as.title')}</h1>
          <p className="sub">{t('as.sub')}</p>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="card"><EmptyState icon="☑" title={t('as.empty.title')}>
          {t('as.empty.body')}
        </EmptyState></div>
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 18 }}>
            <div className="card stat"><div className="num">{summary.total}</div><div className="label">{t('as.stat.checklists')}</div></div>
            <div className="card stat"><div className="num" style={{ color: 'var(--green)' }}>{summary.completed}</div><div className="label">{t('as.stat.completed')}</div></div>
            <div className="card stat"><div className="num" style={{ color: 'var(--amber)' }}>{summary.inProgress}</div><div className="label">{t('as.stat.inProgress')}</div></div>
            <div className="card stat"><div className="num" style={{ color: 'var(--red)' }}>{summary.needsReview}</div><div className="label">{t('as.stat.needReview')}</div></div>
          </div>

          <div className="stack">
            {groups.map((g) => (
              <div key={g.key} className="card" data-testid="assessment-group">
                <div className="card-head">
                  <div className="row" style={{ gap: 10 }}>
                    <h3 style={{ fontSize: 14.5 }}>{g.isOrg ? t('as.orgWide') : g.name}</h3>
                    {g.risk && <RiskChip risk={g.risk} />}
                    <span className="muted small">{g.rows.length} {g.rows.length === 1 ? t('as.col.checklist') : t('as.stat.checklists')}</span>
                  </div>
                  {!g.isOrg && <Link className="small" to={`/ai-systems/${g.key}`}>{t('as.viewSystem')} →</Link>}
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th>{t('as.col.framework')}</th><th>{t('as.col.checklist')}</th><th>{t('as.col.status')}</th><th style={{ width: 150 }}>{t('as.col.progress')}</th><th>{t('as.col.items')}</th><th>{t('as.col.nextReview')}</th><th></th></tr>
                    </thead>
                    <tbody>
                      {g.rows.map((a) => (
                        <tr key={a.id} data-testid="assessment-row">
                          <td><Chip className={TIER_CHIP[a.framework?.tier] || 'chip-grey'} dot={false}>{a.framework?.shortName || a.framework?.name}</Chip></td>
                          <td><strong>{a.template?.name || a.title}</strong></td>
                          <td><StatusChip status={a.status} /></td>
                          <td>
                            <Progress value={a.progressPct} variant={progressVariant(a.status, a.progressPct)} />
                            <span className="muted small">{a.progressPct}%</span>
                          </td>
                          <td className="muted small">{a._count?.responses ?? '-'}</td>
                          <td className="muted small">{formatDate(a.nextReviewDueAt)}</td>
                          <td style={{ textAlign: 'right' }}><Link className="btn btn-primary btn-sm" to={`/assessments/${a.id}`}>{t('common.open')}</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
