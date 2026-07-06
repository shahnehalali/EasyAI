import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { useT } from '@/hooks/useT';
import { Spinner, Banner, Card, RiskChip } from '@/components/ui/Ui';
import BackLink from '@/components/BackLink';

export default function AiSystemClassify() {
  const { id } = useParams();
  const { t } = useT();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const GROUPS = [
    { key: 'banned', title: t('acl.banned'), hint: t('acl.bannedHint') },
    { key: 'high', title: t('acl.high'), hint: t('acl.highHint') },
    { key: 'transparency', title: t('acl.transparency'), hint: t('acl.transparencyHint') },
  ];

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['questionnaire', id], queryFn: () => aiSystemApi.getQuestionnaire(id),
  });

  if (isLoading) return <Spinner />;

  const setAnswer = (code, value) => setAnswers((a) => ({ ...a, [code]: value }));

  const submit = async () => {
    setBusy(true); setError('');
    try {
      const res = await aiSystemApi.classify(id, answers);
      setResult(res);
      qc.invalidateQueries({ queryKey: ['ai-systems'] });
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (result) {
    return (
      <div data-testid="classify-result" style={{ maxWidth: 680 }}>
        <div className="page-head"><div><div className="eyebrow">{t('acl.complete')}</div><h1>{t('acl.riskResult')}</h1></div></div>
        <Card variant="ruled-gold">
          <div className="row" style={{ gap: 12, marginBottom: 10 }}>
            <span className="muted">{t('acl.classifiedAs')}</span>
            <span data-testid="result-risk"><RiskChip risk={result.riskCategory} /></span>
          </div>
          <p>{result.explanation}</p>
          <div className="divider" />
          <p className="small">
            {t('acl.createdPre')} <strong data-testid="result-assessments">{result.createdAssessments}</strong> {t('acl.createdPost')}
          </p>
          <div className="row" style={{ gap: 10, marginTop: 8 }}>
            <Link className="btn btn-primary btn-sm" to="/assessments">{t('acl.goToAssessments')}</Link>
            <Link className="btn btn-outline btn-sm" to={`/ai-systems/${id}`}>{t('acl.viewSystem')}</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="classify" style={{ maxWidth: 720 }}>
      <BackLink to="/ai-systems">{t('nav.aiSystems')}</BackLink>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">{t('acl.step2')} - {questionnaire.name}</div>
          <h1>{t('acl.classifyRisk')}</h1>
          <p className="sub">{t('acl.sub')}</p>
          <p className="small" style={{ marginTop: 6 }}>
            {t('acl.orProfile')}{' '}
            <Link to={`/ai-systems/${id}/profile`} data-testid="classify-to-profile">{t('acl.goProfile')}</Link>
          </p>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <p className="muted small" style={{ marginTop: 0, marginBottom: 14 }}>{t('acl.note')}</p>

      <div className="stack">
        {GROUPS.map((g) => {
          const qs = questionnaire.questions.filter((q) => (q.category || 'transparency') === g.key);
          if (!qs.length) return null;
          return (
            <Card key={g.key} title={g.title} variant="ruled" action={<span className="muted small">{g.hint}</span>}>
              <div className="stack" style={{ gap: 16 }}>
                {qs.map((q) => (
                  <div key={q.id} style={{ borderBottom: '1px solid var(--border-2)', paddingBottom: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.prompt}</div>
                    {q.helpText && <div className="muted small" style={{ marginBottom: 8 }}>{q.helpText}</div>}
                    <div className="row" style={{ gap: 8 }}>
                      {['yes', 'no'].map((opt) => {
                        const val = opt === 'yes';
                        const on = answers[q.code] === val;
                        // Yes (a risky trait) reads red, No reads green when selected. Use fixed
                        // dark shades so the white label stays readable in both themes.
                        const activeColor = val ? '#b42318' : '#1b7a4b';
                        return (
                          <button key={opt} data-testid={`q-${q.code}-${opt}`} onClick={() => setAnswer(q.code, val)}
                            className="btn btn-sm" style={{
                              background: on ? activeColor : 'var(--surface)',
                              color: on ? '#fff' : 'var(--ink)',
                              border: `1px solid ${on ? activeColor : 'var(--border)'}`, minWidth: 64,
                            }}>
                            {opt === 'yes' ? t('common.yes') : t('common.no')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={submit} disabled={busy} data-testid="classify-submit">
        {busy ? t('acl.classifying') : t('acl.classifyBuild')}
      </button>
    </div>
  );
}
