import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { Spinner, Banner, Card, RiskChip } from '@/components/ui/Ui';

const GROUPS = [
  { key: 'banned', title: 'Banned-use checks', hint: 'Any "Yes" here means the use may be prohibited' },
  { key: 'high', title: 'High-risk checks', hint: 'Annex III uses and product safety' },
  { key: 'transparency', title: 'Transparency checks', hint: 'Chatbots and generated content' },
];

export default function AiSystemClassify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
        <div className="page-head"><div><div className="eyebrow">Classification complete</div><h1>Risk result</h1></div></div>
        <Card variant="ruled-gold">
          <div className="row" style={{ gap: 12, marginBottom: 10 }}>
            <span className="muted">This system is classified as</span>
            <span data-testid="result-risk"><RiskChip risk={result.riskCategory} /></span>
          </div>
          <p>{result.explanation}</p>
          <div className="divider" />
          <p className="small">
            We created <strong data-testid="result-assessments">{result.createdAssessments}</strong> compliance assessment(s) for this system,
            with an annual review reminder for each.
          </p>
          <div className="row" style={{ gap: 10, marginTop: 8 }}>
            <Link className="btn btn-primary btn-sm" to="/assessments">Go to assessments</Link>
            <Link className="btn btn-outline btn-sm" to={`/ai-systems/${id}`}>View this system</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="classify" style={{ maxWidth: 720 }}>
      <Link className="small" to="/ai-systems">← AI systems</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">Step 2 of 2 - {questionnaire.name}</div>
          <h1>Classify the risk</h1>
          <p className="sub">Answer these questions about the system. We use them to place it in one of the four EU AI Act risk levels and to build the right checklists.</p>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <p className="muted small" style={{ marginTop: 0, marginBottom: 14 }}>
        Answer Yes only where it clearly applies. Anything left as No is treated as "does not apply".
        If nothing applies, the system is classified as minimal risk.
      </p>

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
                        // Yes (a risky trait) reads red, No reads green when selected.
                        const activeColor = val ? 'var(--red)' : 'var(--green)';
                        return (
                          <button key={opt} data-testid={`q-${q.code}-${opt}`} onClick={() => setAnswer(q.code, val)}
                            className="btn btn-sm" style={{
                              background: on ? activeColor : 'var(--surface)',
                              color: on ? '#fff' : 'var(--ink)',
                              border: `1px solid ${on ? activeColor : 'var(--border)'}`, minWidth: 64,
                            }}>
                            {opt === 'yes' ? 'Yes' : 'No'}
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
        {busy ? 'Classifying...' : 'Classify and build checklists'}
      </button>
    </div>
  );
}
