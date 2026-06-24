import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { frameworkApi } from '@/apis/frameworkApi';
import { assessmentApi } from '@/apis/assessmentApi';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonPage, ErrorState, Card, SeverityChip, Chip, Banner } from '@/components/ui/Ui';
import { riskLabel, formatDate, tierLabel } from '@/utils/format';
import { useLangStore } from '@/store/langStore';
import { tLaw } from '@/i18n/lawExplorer';
import { useT } from '@/hooks/useT';

export default function FrameworkDetail() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { t, lang } = useT();
  const { data: framework, isLoading, error, refetch } = useQuery({ queryKey: ['framework', key, lang], queryFn: () => frameworkApi.getByKey(key, lang) });
  const [busyId, setBusyId] = useState(null);
  const [startError, setStartError] = useState('');

  if (isLoading) return <SkeletonPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // Localise the law content itself (name, summary, who-applies, etc.) when German is selected.
  const fw = tLaw(framework, lang);

  const startChecklist = async (templateId) => {
    setBusyId(templateId); setStartError('');
    try {
      const res = await assessmentApi.start({ checklistTemplateId: templateId });
      navigate(`/assessments/${res.assessment.id}`);
    } catch (err) { setStartError(err.message); } finally { setBusyId(null); }
  };

  const mustDo = Array.isArray(fw.whatYouMustDo) ? fw.whatYouMustDo : [];
  const dates = Array.isArray(fw.keyDates) ? fw.keyDates : [];

  return (
    <div data-testid="framework-detail">
      <Link className="small" to="/frameworks">{t('fd.back')}</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{fw.reference}</div>
          <h1>{fw.name}</h1>
          <p className="sub">{fw.shortDescription}</p>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <Chip className={fw.tier === 1 ? 'chip-navy' : fw.tier === 2 ? 'chip-gold' : 'chip-grey'} dot={false}>{tierLabel(fw.tier, lang)}</Chip>
          </div>
        </div>
        {fw.lawReferenceUrl && (
          <a className="btn btn-outline" href={fw.lawReferenceUrl} target="_blank" rel="noreferrer">{t('fd.officialText')}</a>
        )}
      </div>

      {(fw.sourceNote || fw.lastReviewedAt) && (
        <div className="card" data-testid="framework-source" style={{ marginBottom: 18 }}>
          <div className="card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              {fw.lastReviewedAt && <Chip className="chip-green" dot={false}>{t('fd.contentReviewed')} {formatDate(fw.lastReviewedAt)}</Chip>}
              <span className="small muted" style={{ flex: 1, minWidth: 240 }}><strong>{t('fd.source')}</strong> {fw.sourceNote || fw.reference}</span>
            </div>
          </div>
        </div>
      )}

      {mustDo.length > 0 && (
        <Card title={t('fd.whatYouMustDo')} variant="ruled-gold">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {mustDo.map((it, i) => <li key={i} style={{ marginBottom: 6, lineHeight: 1.5 }}>{it}</li>)}
          </ul>
        </Card>
      )}

      <div className="grid grid-2" style={{ margin: '18px 0' }}>
        <Card title={t('fd.whoMustComply')} variant="ruled">{fw.appliesTo || t('fd.seeOfficial')}</Card>
        <Card title={t('fd.whoEnforces')} variant="ruled">{fw.regulator || t('fd.seeOfficial')}</Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {dates.length > 0 && (
          <Card title={t('fd.keyDates')} variant="ruled">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {dates.map((d, i) => <li key={i} style={{ marginBottom: 5 }} className="small">{d}</li>)}
            </ul>
          </Card>
        )}
        {fw.penalties && (
          <Card title={t('fd.penalties')} variant="ruled">
            <p className="small" style={{ margin: 0 }}>{fw.penalties}</p>
          </Card>
        )}
      </div>

      {fw.keySections && (
        <Card title={t('fd.keySections')} variant="ruled"><p className="small" style={{ margin: 0 }}>{fw.keySections}</p></Card>
      )}

      {framework.requirements?.length > 0 && (
        <Card title={t('fd.requirements')} variant="ruled-gold" style={{ marginTop: 18 }}>
          <div className="stack" style={{ gap: 14 }}>
            {framework.requirements.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border-2)', paddingBottom: 12 }}>
                <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                  <Chip className="chip-grey" dot={false}>{r.code}</Chip>
                  <strong>{r.title}</strong>
                  <SeverityChip severity={r.severity} />
                </div>
                <p className="small" style={{ margin: 0 }}>{r.guidanceText}</p>
                {r.lawReferenceUrl && <a className="small" href={r.lawReferenceUrl} target="_blank" rel="noreferrer">{r.lawReferenceLabel || t('fd.reference')} ↗</a>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {framework.templates?.length > 0 ? (
        <div style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 12 }}>{t('fd.checklists')}</h2>
          {startError && <Banner kind="error">{startError}</Banner>}
          <div className="stack">
            {framework.templates.map((tpl) => (
              <Card key={tpl.id} title={tpl.name} variant="ruled"
                action={tpl.appliesToRiskCategory ? <Chip className="chip-amber" dot={false}>{riskLabel(tpl.appliesToRiskCategory, lang)}</Chip> : <Chip className="chip-grey" dot={false}>{t('fd.allSystems')}</Chip>}>
                <p className="muted small" style={{ marginTop: 0 }}>{tpl.description}</p>
                <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
                  {tpl.items.map((it) => <li key={it.id} style={{ marginBottom: 4 }}>{it.title}</li>)}
                </ul>
                {can('compliance.edit') && (
                  <button className="btn btn-primary btn-sm" data-testid="start-checklist" onClick={() => startChecklist(tpl.id)} disabled={busyId === tpl.id}>
                    {busyId === tpl.id ? t('fd.starting') : t('fd.startChecklist')}
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Banner kind="info" >
          {t('fd.noChecklist')}
        </Banner>
      )}

      <p className="muted" style={{ fontSize: 11, marginTop: 16 }}>
        {t('fd.disclaimer')}
      </p>
    </div>
  );
}
