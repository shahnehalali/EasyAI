import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// React Router does not touch window scroll position on navigation, so
// without this, going to the bottom of one page and then clicking to another
// page lands you at the bottom of the new page too, the browser just leaves
// the scroll where it was.
//
// On a plain navigation (no hash), jump to the top. On a hash link (e.g. a
// footer link to /welcome#faq), scroll the target element into view instead,
// same as a normal in-page anchor would.
export default function ScrollRestoration() {
  const { pathname, hash, key } = useLocation();
  const lastKey = useRef(key);

  // useLayoutEffect so the jump happens before the browser paints the new
  // page, avoiding a visible flash of the old scroll position.
  useLayoutEffect(() => {
    if (hash) return; // handled below, once the target exists in the DOM
    if (lastKey.current === key) return;
    lastKey.current = key;
    window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // The target may not be mounted yet on the same tick as the navigation
    // (route transition, lazy content); retry across a couple of frames
    // rather than guessing a fixed delay.
    let attempts = 0;
    let raf;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      attempts += 1;
      if (attempts < 10) raf = requestAnimationFrame(tryScroll);
    };
    tryScroll();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [pathname, hash, key]);

  return null;
}
