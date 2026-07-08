import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/themeStore';

// An ambient "neural network" for the auth screens: nodes drift, and a link is
// drawn between any two that come close, fading with distance. Nodes breathe
// slowly, and the pointer pulls faint signal lines toward it.
//
// Kept cheap on purpose: one canvas, node count scales with area (capped),
// links are O(n^2) over a small n with a squared-distance early-out, the loop
// is paused when the tab is hidden, and `prefers-reduced-motion` renders a
// single static frame instead of animating.

const LINK_DIST = 140; // px: nodes closer than this get a link
const POINTER_DIST = 180; // px: nodes closer than this reach for the cursor

export default function NeuralBackground() {
  const canvasRef = useRef(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Ink on paper in light mode, light ink on dark in night mode.
    const rgb = theme === 'dark' ? '232, 236, 243' : '23, 25, 31';

    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999 };

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(80, Math.max(24, Math.round((width * height) / 18000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2, // desync the breathing
      }));
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Links between nearby nodes.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue; // early-out before the sqrt
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Signal lines reaching for the pointer.
      for (const n of nodes) {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d > POINTER_DIST) continue;
        ctx.strokeStyle = `rgba(${rgb}, ${(1 - d / POINTER_DIST) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }

      // The nodes themselves, breathing.
      for (const n of nodes) {
        const pulse = reduced ? 1 : 0.55 + 0.45 * Math.sin(time / 1500 + n.phase);
        ctx.fillStyle = `rgba(${rgb}, ${0.32 * pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (time) => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Wrap around the edges so the field never empties out.
        if (n.x < -20) n.x = width + 20;
        else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        else if (n.y > height + 20) n.y = -20;
      }
      draw(time);
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf || reduced) return;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onResize = () => {
      seed();
      if (reduced) draw(0);
    };
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => { pointer.x = -9999; pointer.y = -9999; };
    const onVisibility = () => (document.hidden ? stop() : start());

    seed();
    if (reduced) draw(0); else start();

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="auth-bg" aria-hidden="true" />;
}
