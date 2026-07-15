import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { assessmentApi } from '@/apis/assessmentApi';
import { organizationApi } from '@/apis/organizationApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Banner, Card, StatusChip, Progress, RiskChip } from '@/components/ui/Ui';
import { formatDate, progressVariant } from '@/utils/format';
import ChecklistItem from '@/components/assessments/ChecklistItem';
import AssessmentStepper from '@/components/assessments/AssessmentStepper';
import BackLink from '@/components/BackLink';

const isOpen = (r) => r.status === 'not_started' || r.status === 'in_progress';

export default function AssessmentEditor() {
  const { id } = useParams();
  const { t, lang } = useT();
  const qc = useQueryClient();
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: assessment, isLoading, error, refetch } = useQuery({ queryKey: ['assessment', id, lang], queryFn: () => assessmentApi.getById(id, lang) });
  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: organizationApi.members });
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState(null);
  const [reviewedMsg, setReviewedMsg] = useState('');
  // Bumped whenever a point is saved, so the stepper re-reads the (in-place
  // mutated) response statuses and reflects progress immediately.
  const [, setTick] = useState(0);

  useEffect(() => {
    if (assessment) { setProgress(assessment.progressPct); setStatus(assessment.status); }
  }, [assessment]);

  if (isLoading) return <SkeletonPage rows={4} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const responses = assessment.responses || [];
  const openCount = responses.filter(isOpen).length;

  // A valid ?point=N (1-based) puts us in single-point focus mode; anything else
  // is the overview table.
  const raw = Number(searchParams.get('point'));
  const focusIdx = Number.isInteger(raw) && raw >= 1 && raw <= responses.length ? raw - 1 : null;
  const inFocus = focusIdx !== null;

  const goToPoint = (idx) => setSearchParams({ point: String(idx + 1) });
  const goOverview = () => setSearchParams({});
  const goNextOpen = () => {
    const n = responses.length;
    const from = focusIdx ?? -1;
    for (let step = 1; step <= n; step += 1) {
      const idx = (from + step) % n;
      if (isOpen(responses[idx])) { goToPoint(idx); return; }
    }
  };

  const onChanged = (p) => {
    if (p) { setProgress(p.progressPct); setStatus(p.status); }
    setTick((n) => n + 1);
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const markReviewed = async () => {
    const updated = await assessmentApi.markReviewed(id);
    setStatus(updated.status);
    setReviewedMsg(t('ae.reviewedMsg').replace('{date}', formatDate(updated.nextReviewDueAt)));
    qc.invalidateQueries({ queryKey: ['assessment', id] });
    qc.invalidateQueries({ queryKey: ['assessments'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div data-testid="assessment-editor">
      {inFocus
        ? <BackLink to={`/assessments/${id}`}>{t('ae.backToPoints')}</BackLink>
        : <BackLink to="/assessments">{t('nav.assessments')}</BackLink>}

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
          {can('compliance.edit') && <button className="btn btn-outline" onClick={markReviewed} data-testid="mark-reviewed">{t('ae.markReviewed')}</button>}
        </div>
      </div>

      {reviewedMsg && <Banner kind="success">{reviewedMsg}</Banner>}

      {inFocus && (
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
      )}

      <div className="assessment-body">
        {/* Vertical delivery-tracker rail: click a point to jump to it; saved
            points fill in as you go. Replaces the old activity sidebar. */}
        {responses.length > 0 && (
          <aside className="stepper-col">
            <div className="stepper-wrap">
              <div className="stepper-title">{t('ae.stepsLabel')}</div>
              <AssessmentStepper responses={responses} currentIdx={focusIdx ?? -1} onSelect={goToPoint} />
            </div>
          </aside>
        )}

        <div className="assessment-main">
      {inFocus ? (
        <div>
          <div className="checklist-nav" data-testid="checklist-nav">
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={() => goToPoint(focusIdx - 1)}
                disabled={focusIdx <= 0} aria-label={t('ae.prevPoint')} title={t('ae.prevPoint')}>
                <ArrowLeft size={15} />
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => goToPoint(focusIdx + 1)}
                disabled={focusIdx >= responses.length - 1} aria-label={t('ae.nextPoint')} title={t('ae.nextPoint')}>
                <ArrowRight size={15} />
              </button>
              <span className="muted small" data-testid="checklist-position" style={{ whiteSpace: 'nowrap' }}>
                {t('ae.point')} {focusIdx + 1} / {responses.length}
              </span>
            </div>
            {openCount > 0 ? (
              <button className="btn btn-primary btn-sm" onClick={goNextOpen} data-testid="next-open-point">
                {t('ae.nextOpen')} <ArrowRight size={14} />
                <span className="checklist-nav-count">{openCount}</span>
              </button>
            ) : (
              <span className="row small" data-testid="all-addressed" style={{ gap: 6, color: 'var(--green)', fontWeight: 600 }}>
                <CheckCircle2 size={15} /> {t('ae.allAddressed')}
              </span>
            )}
          </div>

          {/* key on the index so the card remounts and fades in on each move */}
          <div key={focusIdx} className="focus-point" data-testid="focus-point">
            <ChecklistItem response={responses[focusIdx]} members={members} onChanged={onChanged} />
          </div>

          <div className="row-between" style={{ marginTop: 6 }}>
            <button className="btn btn-outline btn-sm" onClick={() => goToPoint(focusIdx - 1)} disabled={focusIdx <= 0}>
              <ArrowLeft size={14} /> {t('ae.prevPoint')}
            </button>
            {focusIdx < responses.length - 1 ? (
              <button className="btn btn-primary btn-sm" data-testid="focus-next" onClick={() => goToPoint(focusIdx + 1)}>
                {t('ae.nextPoint')} <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" data-testid="focus-done" onClick={goOverview}>
                {t('ae.backToPoints')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="row-between" style={{ alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, margin: '0 0 4px' }}>{t('ae.pointsOverview')}</h2>
              <p className="muted small" style={{ margin: 0 }}>{t('ae.selectHint')}</p>
            </div>
            <div className="mini-progress" data-testid="assessment-progress-card">
              <div className="mini-progress-top">
                <span className="mini-progress-label">{t('ae.progress')}</span>
                <strong className="mini-progress-num" data-testid="assessment-progress">{progress}%</strong>
              </div>
              <Progress value={progress} variant={progressVariant(status, progress)} />
            </div>
          </div>

          <Card variant="ruled" bodyClass="card-body table-wrap" data-testid="points-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th>{t('ae.colPoint')}</th>
                  <th>{t('as.col.status')}</th>
                  <th>{t('ae.colOwner')}</th>
                  <th style={{ textAlign: 'center' }}>{t('ae.colDocs')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={r.id} className="point-row" data-testid={`point-row-${i}`} onClick={() => goToPoint(i)}>
                    <td className="muted">{i + 1}</td>
                    <td>
                      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontWeight: 600 }}>{r.templateItem.title}</strong>
                        {r.templateItem.isRequired && (
                          <span className="tag-pill" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>{t('ci.required')}</span>
                        )}
                      </div>
                    </td>
                    <td><StatusChip status={r.status} /></td>
                    <td className="muted small">{r.assignee?.fullName || t('ci.unassigned')}</td>
                    <td style={{ textAlign: 'center' }}>
                      {r.documents?.length
                        ? <span className="row small" style={{ gap: 4, justifyContent: 'center' }}><FileText size={13} /> {r.documents.length}</span>
                        : <span className="muted">—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        data-testid={`open-point-${i}`}
                        onClick={(e) => { e.stopPropagation(); goToPoint(i); }}
                      >
                        {t('ae.openPoint')} <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
