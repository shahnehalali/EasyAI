import { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { statusLabel } from '@/utils/format';

// A vertical delivery-tracker timeline for an assessment's checklist points.
// Each row is one point; the dot's colour/icon reflects the saved status, the
// current point is ringed, and the connecting rail fills in green as points get
// done. Click a row to jump to that point; hovering shows the full title (via
// the global TooltipLayer that reads `data-tip`).
function stateOf(r) {
  if (r.status === 'done') return 'done';
  if (r.status === 'not_applicable') return 'na';
  if (r.status === 'in_progress') return 'progress';
  return 'todo';
}

export default function AssessmentStepper({ responses, currentIdx = -1, onSelect }) {
  const { t, lang } = useT();
  const nodeRefs = useRef([]);
  const last = responses.length - 1;

  // Keep the active point in view within the (scrollable) rail.
  useEffect(() => {
    const el = nodeRefs.current[currentIdx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [currentIdx]);

  return (
    <div className="stepper" data-testid="assessment-stepper" role="list" aria-label={t('ae.stepsLabel')}>
      {responses.map((r, i) => {
        const st = stateOf(r);
        const isCurrent = i === currentIdx;
        const topFilled = i > 0 && ['done', 'na'].includes(stateOf(responses[i - 1]));
        const bottomFilled = i < last && ['done', 'na'].includes(st);
        return (
          <button
            key={r.id}
            type="button"
            role="listitem"
            ref={(el) => { nodeRefs.current[i] = el; }}
            className={`vstep step-${st}${isCurrent ? ' is-current' : ''}`}
            data-testid={`step-node-${i}`}
            data-tip={`${i + 1}. ${r.templateItem.title}`}
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`${t('ae.point')} ${i + 1}: ${r.templateItem.title} — ${statusLabel(r.status, lang)}`}
            onClick={() => onSelect(i)}
          >
            <span className="vstep-rail" aria-hidden="true">
              <span className={`vstep-line${topFilled ? ' is-filled' : ''}${i === 0 ? ' is-hidden' : ''}`} />
              <span className="vstep-dot">
                {st === 'done' ? <Check size={13} strokeWidth={3} />
                  : st === 'na' ? <Minus size={13} strokeWidth={3} />
                  : <span className="step-num">{i + 1}</span>}
              </span>
              <span className={`vstep-line${bottomFilled ? ' is-filled' : ''}${i === last ? ' is-hidden' : ''}`} />
            </span>
            <span className="vstep-label">{r.templateItem.title}</span>
          </button>
        );
      })}
    </div>
  );
}
