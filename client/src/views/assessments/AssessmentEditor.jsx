import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '@/apis/assessmentApi';
import { organizationApi } from '@/apis/organizationApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Banner, Card, StatusChip, Progress, RiskChip } from '@/components/ui/Ui';
import { formatDate, fromNow, progressVariant } from '@/utils/format';
import ChecklistItem from '@/components/assessments/ChecklistItem';

function humanizeAction(a) {
  return a.replace(/[._]/g, ' ');
}

export default function AssessmentEditor() {
  const { id } = useParams();
  const { t, lang } = useT();
  const qc = useQueryClient();
  const { can } = useAuth();
  const { data: assessment, isLoading, error, refetch } = useQuery({ queryKey: ['assessment', id, lang], queryFn: () => assessmentApi.getById(id, lang) });
  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: organizationApi.members });
  const { data: activity = [], refetch: refetchActivity } = useQuery({ queryKey: ['assessment-activity', id], queryFn: () => assessmentApi.activity(id) });
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState(null);
  const [reviewedMsg, setReviewedMsg] = useState('');

  useEffect(() => {
    if (assessment) { setProgress(assessment.progressPct); setStatus(assessment.status); }
  }, [assessment]);

  if (isLoading) return <SkeletonPage rows={4} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const onChanged = (p) => {
    if (p) { setProgress(p.progressPct); setStatus(p.status); }
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    refetchActivity();
  };

  const markReviewed = async () => {
    const updated = await assessmentApi.markReviewed(id);
    setStatus(updated.status);
    setReviewedMsg(t('ae.reviewedMsg').replace('{date}', formatDate(updated.nextReviewDueAt)));
    qc.invalidateQueries({ queryKey: ['assessment', id] });
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    refetchActivity();
  };

  return (
    <div data-testid="assessment-editor">
      <Link className="small" to="/assessments">← {t('nav.assessments')}</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{assessment.framework?.name}</div>
          <h1>{assessment.template?.name}</h1>
          <p className="sub">{assessment.template?.description}</p>
          <div className="row" style={{ gap: 10, marginTop: 8 }}>
            {assessment.aiSystem && <span className="tag-pill">{assessment.aiSystem.name}</span>}
            {assessment.aiSystem?.riskCategory && <RiskChip risk={assessment.aiSystem.riskCategory} />}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {can('export') && (
            <a className="btn btn-outline" href={reportApi.assessmentPdfUrl(id)} data-testid="export-assessment-pdf">
              {t('ae.exportPdf')}
            </a>
          )}
          <button className="btn btn-gold" onClick={markReviewed} data-testid="mark-reviewed">{t('ae.markReviewed')}</button>
        </div>
      </div>

      {reviewedMsg && <Banner kind="success">{reviewedMsg}</Banner>}

      <div className="card ruled" style={{ marginBottom: 18 }}>
        <div className="card-body row-between">
          <div className="row" style={{ gap: 14 }}>
            <span><span className="muted small">{t('ae.status')} </span><StatusChip status={status} /></span>
            <span className="muted small">{t('ae.nextReview')} {formatDate(assessment.nextReviewDueAt)}</span>
          </div>
          <div style={{ width: 220 }}>
            <div className="row-between" style={{ marginBottom: 4 }}>
              <span className="muted small">{t('ae.progress')}</span>
              <strong data-testid="assessment-progress">{progress}%</strong>
            </div>
            <Progress value={progress} variant={progressVariant(status, progress)} />
          </div>
        </div>
      </div>

      <div className="editor-grid">
        <div>
          <Banner kind="info">{t('ae.docHint')}</Banner>
          {assessment.responses.map((r) => (
            <ChecklistItem key={r.id} response={r} members={members} onChanged={onChanged} />
          ))}
        </div>

        <Card title={t('ae.activity')} variant="ruled" data-testid="activity-panel">
          {activity.length === 0 ? (
            <p className="muted small" style={{ margin: 0 }}>{t('ae.noActivity')}</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {activity.map((a) => (
                <div key={a.id} data-testid="activity-item" style={{ borderBottom: '1px solid var(--border-2)', paddingBottom: 8 }}>
                  <div className="small" style={{ textTransform: 'capitalize' }}>{humanizeAction(a.action)}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{a.actor} · {fromNow(a.createdAt, lang)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
