import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A single global tooltip for every element carrying `data-tip`.
//
// Why a portal instead of a ::after pseudo-element: pills live inside scrolling
// containers (e.g. `.table-wrap` has `overflow: auto` so wide tables scroll),
// and CSS cannot mix `overflow-x: auto` with `overflow-y: visible` -- so a
// pseudo-element bubble gets clipped by the table. Rendering into <body> with
// fixed positioning escapes every clipping ancestor, and lets us flip the
// bubble below the target and clamp it to the viewport when space is tight.

function Bubble({ text, rect }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, below: false, arrowLeft: 12, ready: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const gap = 9;
    const edge = 8;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Prefer above the target; flip below when it would clip the top.
    let below = false;
    let top = rect.top - b.height - gap;
    if (top < edge) {
      const belowTop = rect.bottom + gap;
      if (belowTop + b.height <= vh - edge) { top = belowTop; below = true; } else { top = edge; }
    }

    // Left-align to the target, clamped inside the viewport.
    let left = Math.min(rect.left, vw - b.width - edge);
    left = Math.max(edge, left);

    // Point the arrow at the target's centre, kept inside the bubble.
    const centre = rect.left + rect.width / 2;
    const arrowLeft = Math.min(Math.max(centre - left, 12), Math.max(12, b.width - 12));

    setPos({ left, top, below, arrowLeft, ready: true });
  }, [text, rect.top, rect.bottom, rect.left, rect.width]);

  return (
    <div
      ref={ref}
      role="tooltip"
      data-feedback-hide-during-capture
      className={`tip-bubble${pos.below ? ' below' : ''}`}
      style={{ left: pos.left, top: pos.top, visibility: pos.ready ? 'visible' : 'hidden' }}
    >
      {text}
      <span className="tip-arrow" style={{ left: pos.arrowLeft }} aria-hidden="true" />
    </div>
  );
}

export default function TooltipLayer() {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let current = null;

    const show = (el) => {
      const text = el.getAttribute('data-tip');
      if (!text) return;
      const r = el.getBoundingClientRect();
      current = el;
      setTip({ text, rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width } });
    };
    const hide = () => { current = null; setTip(null); };

    const onOver = (e) => {
      const el = e.target.closest?.('[data-tip]');
      if (el) { if (el !== current) show(el); } else if (current) hide();
    };
    const onOut = (e) => {
      const el = e.target.closest?.('[data-tip]');
      if (el && el === current) hide();
    };
    // Keyboard users: show on focus of a focusable [data-tip] (e.g. the q-tag pills).
    const onFocusIn = (e) => { const el = e.target.closest?.('[data-tip]'); if (el) show(el); };
    const onFocusOut = () => hide();

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    // Any scroll/resize invalidates the measured position.
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, []);

  if (!tip) return null;
  return createPortal(<Bubble text={tip.text} rect={tip.rect} />, document.body);
}
