import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { frameworkApi } from '@/apis/frameworkApi';
import { SkeletonPage, ErrorState, Chip } from '@/components/ui/Ui';
import { tierLabel } from '@/utils/format';
import { useT } from '@/hooks/useT';

// null = show every framework; otherwise filter by tier number.
const TIER_FILTERS = [
  { key: 'all', labelKey: 'fw.filter.all', tier: null },
  { key: 'eu', labelKey: 'fw.filter.eu', tier: 1 },
  { key: 'national', labelKey: 'fw.filter.national', tier: 2 },
  { key: 'sector', labelKey: 'fw.filter.sector', tier: 3 },
];

export default function Frameworks() {
  const { t, lang } = useT();
  const { data: frameworks = [], isLoading, error, refetch } = useQuery({ queryKey: ['frameworks'], queryFn: frameworkApi.list });
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: frameworks.length, 1: 0, 2: 0, 3: 0 };
    for (const f of frameworks) c[f.tier] = (c[f.tier] || 0) + 1;
    return c;
  }, [frameworks]);

  const visible = useMemo(() => {
    const active = TIER_FILTERS.find((t) => t.key === filter);
    if (!active || active.tier === null) return frameworks;
    return frameworks.filter((f) => f.tier === active.tier);
  }, [frameworks, filter]);

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="frameworks">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('fw.eyebrow')}</div>
          <h1>{t('fw.title')}</h1>
          <p className="sub">{t('fw.sub')}</p>
        </div>
      </div>

      <div className="row" role="group" aria-label={t('fw.filterAria')} data-testid="framework-filters" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TIER_FILTERS.map((tf) => {
          const active = filter === tf.key;
          const count = tf.tier === null ? counts.all : (counts[tf.tier] || 0);
          return (
            <button
              key={tf.key}
              data-testid={`framework-filter-${tf.key}`}
              onClick={() => setFilter(tf.key)}
              aria-pressed={active}
              className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
            >
              {t(tf.labelKey)}<span className="muted small" style={{ marginLeft: 6, color: active ? 'rgba(255,255,255,0.8)' : undefined }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>{t('fw.col.framework')}</th><th>{t('fw.col.reference')}</th><th>{t('fw.col.tier')}</th><th>{t('fw.col.requirements')}</th><th>{t('fw.col.checklists')}</th><th></th></tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={6} className="muted small" style={{ textAlign: 'center', padding: '24px 0' }}>{t('fw.empty')}</td></tr>
            )}
            {visible.map((f) => (
              <tr key={f.key} data-testid={`framework-row-${f.key}`}>
                <td><strong>{f.shortName || f.name}</strong><div className="muted small">{f.name}</div></td>
                <td className="muted small">{f.reference}</td>
                <td><Chip className={f.tier === 1 ? 'chip-navy' : f.tier === 2 ? 'chip-gold' : 'chip-grey'} dot={false}>{tierLabel(f.tier, lang)}</Chip></td>
                <td>{f._count?.requirements || 0}</td>
                <td>{f._count?.templates || 0}</td>
                <td style={{ textAlign: 'right' }}><Link className="btn btn-outline btn-sm" to={`/frameworks/${f.key}`}>{t('common.open')}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
