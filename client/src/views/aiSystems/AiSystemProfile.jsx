import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { aiSystemApi } from '@/apis/aiSystemApi';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonPage, ErrorState, Banner, Card, Chip } from '@/components/ui/Ui';

const optClass = (on) => `btn btn-sm opt-btn${on ? ' is-on' : ''}`;

// Renders the right control for a question: boolean | single | number | multi.
function QuestionControl({ q, value, onChange, disabled }) {
  if (q.type === 'number') {
    return (
      <input
        type="number" min="0" className="input" style={{ width: 120 }}
        data-testid={`profile-${q.code}`} disabled={disabled}
        value={value ?? ''} placeholder={q.unit || ''}
        onChange={(e) => onChange(q.code, e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }

  if (q.type === 'single') {
    return (
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {q.options.map((opt) => (
          <button
            key={opt.value} type="button" className={optClass(value === opt.value)}
            data-testid={`profile-${q.code}-${opt.value}`} disabled={disabled}
            onClick={() => onChange(q.code, value === opt.value ? undefined : opt.value)}
          >{opt.label}</button>
        ))}
      </div>
    );
  }

  if (q.type === 'multi') {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (v) => onChange(q.code, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    return (
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {q.options.map((opt) => (
          <button
            key={opt.value} type="button" className={optClass(arr.includes(opt.value))}
            data-testid={`profile-${q.code}-${opt.value}`} disabled={disabled}
            onClick={() => toggle(opt.value)}
          >{opt.label}</button>
        ))}
      </div>
    );
  }

  // boolean
  return (
    <div className="row" style={{ gap: 8 }}>
      {[true, false].map((v) => (
        <button
          key={String(v)} type="button" className={optClass(value === v)}
          data-testid={`profile-${q.code}-${v ? 'yes' : 'no'}`} disabled={disabled}
          onClick={() => onChange(q.code, value === v ? undefined : v)}
          style={{ minWidth: 58 }}
        >{v ? 'Yes' : 'No'}</button>
      ))}
    </div>
  );
}

export default function AiSystemProfile() {
  const { id } = useParams();
  const { can } = useAuth();
  const editable = can('compliance.edit');
  const resultsRef = useRef(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['data-profile', id], queryFn: () => aiSystemApi.getDataProfile(id),
  });

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    if (data) {
      setAnswers(data.answers || {});
      setResult(data.result || null);
    }
  }, [data]);

  if (isLoading) return <SkeletonPage rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const setAnswer = (code, value) => setAnswers((a) => ({ ...a, [code]: value }));
  const questions = data.questions || [];
  const sections = data.sections || [];
  // The gate question must be answered; any question left blank is treated as "No"/none.
  const gateAnswered = typeof answers.processes_personal_data === 'boolean';
  const unanswered = questions.filter((q) => answers[q.code] === undefined).length;

  const submit = async () => {
    setBusy(true); setSaveErr('');
    try {
      const res = await aiSystemApi.saveDataProfile(id, answers);
      setResult(res.result);
      // Scroll the freshly computed results into view.
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) { setSaveErr(err.message); } finally { setBusy(false); }
  };

  const questionsFor = (sectionKey) => questions.filter((q) => q.section === sectionKey);

  return (
    <div data-testid="data-profile">
      <Link className="small" to={`/ai-systems/${id}`}>← AI system</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div>
          <div className="eyebrow">Data protection (GDPR &amp; DPA)</div>
          <h1>{data.name}</h1>
          <p className="sub">{data.description}</p>
        </div>
      </div>

      {/* Questionnaire, grouped into sections, full width */}
      <div className="stack">
        {sections.map((s) => {
          const qs = questionsFor(s.key);
          if (qs.length === 0) return null;
          return (
            <Card key={s.key} title={s.title} variant="ruled" data-testid={`profile-section-${s.key}`}>
              <div>
                {qs.map((q, i) => {
                  const stacked = q.type === 'single' || q.type === 'multi';
                  return (
                    <div
                      key={q.code}
                      className={stacked ? '' : 'row-between'}
                      style={{
                        gap: 28,
                        alignItems: stacked ? 'stretch' : 'center',
                        padding: '18px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border-2)',
                      }}
                    >
                      <div style={{ flex: 1, marginBottom: stacked ? 14 : 0 }}>
                        <div style={{ fontWeight: 600, lineHeight: 1.45 }}>{q.prompt}</div>
                        {q.helpText && <div className="muted small" style={{ marginTop: 5 }}>{q.helpText}</div>}
                      </div>
                      <QuestionControl q={q} value={answers[q.code]} onChange={setAnswer} disabled={!editable} />
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {saveErr && <div className="error-text" style={{ marginTop: 12 }}>{saveErr}</div>}
      {editable && (
        <div className="row" style={{ gap: 12, marginTop: 16 }}>
          <button className="btn btn-primary" data-testid="profile-submit" onClick={submit} disabled={!gateAnswered || busy}>
            {busy ? 'Checking...' : 'See what applies'}
          </button>
          {!gateAnswered
            ? <span className="muted small">Answer the first question to continue.</span>
            : unanswered > 0 && <span className="muted small">{unanswered} unanswered {unanswered === 1 ? 'question is' : 'questions are'} treated as “No”.</span>}
        </div>
      )}

      {/* Results, full width, below the questionnaire */}
      <div ref={resultsRef} data-testid="profile-result" style={{ marginTop: 28 }}>
        {!result ? null : !result.appliesGdpr ? (
          <Banner kind="success" data-testid="profile-not-applicable">{result.message}</Banner>
        ) : (
          <>
            <div className="page-head" style={{ marginBottom: 14 }}>
              <div>
                <div className="eyebrow">Your obligations</div>
                <h2>What applies to this system</h2>
              </div>
            </div>
            <Banner kind={result.summary.gaps > 0 ? 'warn' : 'info'}>
              <strong>{result.summary.total}</strong> obligation{result.summary.total === 1 ? '' : 's'} apply
              {result.summary.gaps > 0 && <> · <strong>{result.summary.gaps}</strong> need action now</>}.
            </Banner>
            {data.penaltiesNote && (
              <p className="muted small" style={{ margin: '0 0 14px' }}>{data.penaltiesNote}</p>
            )}

            <div className="grid grid-2">
              {result.obligations.map((o) => (
                <Card key={o.id} variant="ruled" data-testid={`obligation-${o.id}`} bodyClass="card-body">
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <strong style={{ fontSize: 14.5 }}>{o.title}</strong>
                    {o.status === 'gap'
                      ? <Chip className="chip-red" dot={false}>Action needed</Chip>
                      : <Chip className="chip-navy" dot={false}>Applies</Chip>}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <span className="tag-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent-ink)' }}>{o.law}</span>
                    <p className="small muted" style={{ margin: '6px 0 0', lineHeight: 1.55 }}>{o.lawExplanation}</p>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div className="small" style={{ fontWeight: 600, marginBottom: 2 }}>Why this applies to you</div>
                    <p className="small" style={{ margin: 0, lineHeight: 1.55 }}>{o.why}</p>
                  </div>

                  <div className="small" style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-2)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.55 }}>
                    <span style={{ fontWeight: 600 }}>What to do: </span>{o.solution}
                  </div>

                  {o.exemptionNote && (
                    <p className="small" style={{ margin: '8px 0 0', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600 }}>When this may not apply: </span>{o.exemptionNote}
                    </p>
                  )}

                  {o.lawUrl && (
                    <a className="small" href={o.lawUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>
                      Read {o.law} ↗
                    </a>
                  )}
                </Card>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 14 }}>
              This is plain-language guidance for orientation only and is not legal advice.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
