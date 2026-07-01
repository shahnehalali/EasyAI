import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Card, RiskChip, StatusChip, Progress, Banner } from '@/components/ui/Ui';
import { progressVariant } from '@/utils/format';
import BackLink from '@/components/BackLink';

export default function AiSystemDetail() {
  const { id } = useParams();
  const { t } = useT();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { data: system, isLoading, error, refetch } = useQuery({ queryKey: ['ai-system', id], queryFn: () => aiSystemApi.getById(id) });

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const onDelete = async () => {
    const count = system.assessments?.length || 0;
    const warning = count > 0
      ? t('asd.deleteConfirmCount').replace('{name}', system.name).replace('{n}', count)
      : t('asd.deleteConfirm').replace('{name}', system.name);
    if (!window.confirm(warning)) return;
    await aiSystemApi.remove(id);
    qc.invalidateQueries({ queryKey: ['ai-systems'] });
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    navigate('/ai-systems');
  };

  return (
    <div data-testid="ai-system-detail">
      <BackLink to="/ai-systems">{t('nav.aiSystems')}</BackLink>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{t('asd.eyebrow')}</div>
          <h1>{system.name}</h1>
          <p className="sub">{system.purpose}</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {system.riskCategory && <RiskChip risk={system.riskCategory} />}
          {can('compliance.edit') && (
            <Link className="btn btn-outline btn-sm" to={`/ai-systems/${id}/classify`}>
              {system.riskCategory ? t('asd.reclassify') : t('asd.classify')}
            </Link>
          )}
          <Link className="btn btn-outline btn-sm" to={`/ai-systems/${id}/profile`} data-testid="data-profile-link">{t('asd.dataProfile')}</Link>
          {can('compliance.edit') && (
            <button className="btn btn-danger btn-sm" data-testid="delete-ai-system" onClick={onDelete}>{t('common.delete')}</button>
          )}
        </div>
      </div>

      {system.classificationExplanation && (
        <Banner kind="info">{system.classificationExplanation}</Banner>
      )}

      <Card title={t('asd.assessmentsTitle')} variant="ruled" bodyClass="card-body table-wrap">
        {system.assessments?.length === 0 ? (
          <p className="muted small">{t('asd.noAssessments')}</p>
        ) : (
          <table className="table">
            <thead><tr><th>{t('asd.colAssessment')}</th><th>{t('as.col.framework')}</th><th>{t('as.col.status')}</th><th>{t('as.col.progress')}</th><th></th></tr></thead>
            <tbody>
              {system.assessments.map((a) => (
                <tr key={a.id}>
                  <td>{a.template?.name}</td>
                  <td className="muted small">{a.framework?.shortName || a.framework?.name}</td>
                  <td><StatusChip status={a.status} /></td>
                  <td style={{ width: 130 }}><Progress value={a.progressPct} variant={progressVariant(a.status, a.progressPct)} /><span className="muted small">{a.progressPct}%</span></td>
                  <td style={{ textAlign: 'right' }}><Link className="btn btn-outline btn-sm" to={`/assessments/${a.id}`}>{t('common.open')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
