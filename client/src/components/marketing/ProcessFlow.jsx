import { useEffect, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { STEPS, CLASSIFICATION_DEMO } from '@/data/marketingContent';

// The classification step genuinely branches into four outcomes in the real
// product (content/classification.seed.json, the rule engine the app seeds
// from), so the diagram shows that branch for real, using the same
// explanation text the interactive classifier above uses, not a
// re-paraphrased summary. Always visible, no click needed.
function ClassifyBranches({ lang }) {
  return (
    <div className="mkt-flow-branch" data-testid="flow-classify-branches">
      <div className="mkt-flow-branch-label">
        <GitBranch size={14} aria-hidden="true" />
        {lang === 'de' ? 'Fuehrt zu einem von vier Ergebnissen:' : 'Leads to one of four outcomes:'}
      </div>
      <div className="mkt-flow-branch-grid">
        {CLASSIFICATION_DEMO.map((c, i) => (
          <div
            key={c.id}
            className="mkt-flow-branch-card"
            data-testid={`flow-branch-${c.id}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <span className={`chip ${c.chip}`}>{c.label[lang]}</span>
            <p>{c.explanation[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// A connected, animated flowchart: every step's detail is always on the
// page, nothing needs a click. Motion comes from two places, both gated
// behind prefers-reduced-motion the same way NeuralBackground is:
//   1. each step fades and slides in as it scrolls into view;
//   2. a small pulse travels down each connector line on a loop, reading as
//      "the process flowing downward" rather than a decorative flourish.
export default function ProcessFlow() {
  const lang = useLangStore((s) => s.lang);
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(() => new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined; // stay at the fully-visible default state, no animation wiring

    container.classList.add('mkt-flow-ready');

    const nodes = container.querySelectorAll('[data-flow-step]');
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.dataset.flowStep;
            if (!next.has(id)) { next.add(id); changed = true; }
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="card mkt-flow-card">
      <div className="card-body mkt-flow" ref={containerRef} data-testid="process-flow">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <div
              key={step.id}
              data-flow-step={step.id}
              className={`mkt-flow-step${visible.has(step.id) ? ' in-view' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
              data-testid={`flow-step-${step.id}`}
            >
              <div className="mkt-flow-rail">
                <div className="mkt-flow-node" data-testid={`flow-node-${step.id}`}>{step.n}</div>
                {!isLast && <div className="mkt-flow-line" style={{ animationDelay: `${i * 0.7}s` }} />}
              </div>
              <div className="mkt-flow-content">
                <h3>{step.title[lang]}</h3>
                <p className="muted small">{step.body[lang]}</p>
                <ul className="mkt-flow-list" data-testid={`flow-list-${step.id}`}>
                  {step.detail.map((d) => <li key={d.en}>{d[lang]}</li>)}
                </ul>
                {step.id === 'classify' && <ClassifyBranches lang={lang} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
