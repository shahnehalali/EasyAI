import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { SkeletonPage, ErrorState, RiskChip, EmptyState } from '@/components/ui/Ui';
import { formatDate } from '@/utils/format';
import { useT } from '@/hooks/useT';

export default function AiSystems() {
  const { t } = useT();
  const { data: systems = [], isLoading, error, refetch } = useQuery({ queryKey: ['ai-systems'], queryFn: aiSystemApi.list });

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="ai-systems">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('ai.eyebrow')}</div>
          <h1>{t('ai.title')}</h1>
          <p className="sub">{t('ai.sub')}</p>
        </div>
        <Link className="btn btn-primary" to="/ai-systems/new" data-testid="new-ai-system">{t('common.register')}</Link>
      </div>

      {systems.length === 0 ? (
        <div className="card"><EmptyState icon="◈" title={t('ai.empty.title')}>
          {t('ai.empty.body')}
        </EmptyState></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>{t('ai.col.system')}</th><th>{t('ai.col.risk')}</th><th>{t('ai.col.vendor')}</th><th>{t('ai.col.stage')}</th><th>{t('ai.col.assessments')}</th><th>{t('ai.col.classified')}</th></tr>
            </thead>
            <tbody>
              {systems.map((s) => (
                <tr key={s.id} data-testid="ai-system-row">
                  <td><Link to={`/ai-systems/${s.id}`}><strong>{s.name}</strong></Link><div className="muted small">{s.purpose}</div></td>
                  <td>{s.riskCategory ? <RiskChip risk={s.riskCategory} /> : <Link className="btn btn-gold btn-sm" to={`/ai-systems/${s.id}/classify`}>{t('common.classifyNow')}</Link>}</td>
                  <td className="muted small">{s.vendor === 'in_house' ? t('common.inHouse') : s.vendor === 'third_party' ? t('common.thirdParty') : '-'}</td>
                  <td className="muted small">{['planning', 'deployed', 'retired'].includes(s.lifecycleStage) ? t(`ain.${s.lifecycleStage}`) : s.lifecycleStage}</td>
                  <td>{s._count?.assessments || 0}</td>
                  <td className="muted small">{s.classifiedAt ? formatDate(s.classifiedAt) : t('common.notYet')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
