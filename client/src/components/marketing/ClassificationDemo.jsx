import { useState } from 'react';
import { useLangStore } from '@/store/langStore';
import { CLASSIFICATION_DEMO } from '@/data/marketingContent';

// A live-feeling demo: click a risk category, see the real explanation text
// the product itself shows once an AI system is classified. Not a simplified
// marketing paraphrase, the actual output.
export default function ClassificationDemo() {
  const lang = useLangStore((s) => s.lang);
  const [active, setActive] = useState(CLASSIFICATION_DEMO[1].id); // default: High risk
  const current = CLASSIFICATION_DEMO.find((c) => c.id === active) || CLASSIFICATION_DEMO[0];

  return (
    <div className="mkt-demo" data-testid="classification-demo">
      <div className="mkt-demo-tabs" role="tablist" aria-label="Risk category">
        {CLASSIFICATION_DEMO.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={active === c.id}
            className={`mkt-demo-tab${active === c.id ? ' active' : ''}`}
            onClick={() => setActive(c.id)}
            data-testid={`demo-tab-${c.id}`}
          >
            <span className={`chip ${c.chip}`}>{c.label[lang]}</span>
          </button>
        ))}
      </div>
      <div className="card mkt-demo-card" data-testid="demo-result">
        <div className="card-body">
          <p className="muted small" style={{ marginBottom: 10 }}>{current.example[lang]}</p>
          <p style={{ lineHeight: 1.65 }}>{current.explanation[lang]}</p>
        </div>
      </div>
    </div>
  );
}
