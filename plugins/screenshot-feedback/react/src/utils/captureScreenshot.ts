import { toPng } from 'html-to-image';

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
  viewport: { width: number; height: number };
}

const HIDE_DURING_CAPTURE_ATTR = 'data-feedback-hide-during-capture';

const NEUTRALIZE_INTERACTIVE_STYLES_ID = 'feedback-capture-neutralize';
// Exclude html and body — they often hold the page's base background, and
// :hover matches them when the cursor is anywhere on the page. Resetting
// those would wipe out the theme background in the screenshot.
const NEUTRALIZE_INTERACTIVE_STYLES = `
  :where(:not(html):not(body)):hover {
    background-color: revert !important;
    color: revert !important;
    box-shadow: revert !important;
    filter: revert !important;
  }
  :where(:not(html):not(body)):focus,
  :where(:not(html):not(body)):focus-visible,
  :where(:not(html):not(body)):focus-within,
  :where(:not(html):not(body)):active {
    outline: revert !important;
    box-shadow: revert !important;
    background-color: revert !important;
  }

  /* Settle ALL animations/transitions onto their FINAL frame for the capture.
     html-to-image clones the DOM and RE-RUNS CSS animations from frame 0 — so
     any entrance animation that starts hidden (e.g. fade/slide-in from
     opacity:0) gets snapshotted mid-flight and renders INVISIBLE, even though
     it's fully visible on the live page. A negative delay + ~0 duration pushes
     playback past the end, and fill:both holds that end frame; iteration-count
     collapses infinite loops too. Generic by design — only the universal
     selector, no app-specific class names, so any host app benefits. */
  *, *::before, *::after {
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    animation-fill-mode: both !important;
    transition: none !important;
  }
`;

async function waitForFonts() {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* font loading API not available; ignore */
    }
  }
}

function blurActiveElement() {
  const el = document.activeElement;
  if (el && el instanceof HTMLElement && el !== document.body) {
    el.blur();
  }
}

function injectNeutralizeStyles(): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = NEUTRALIZE_INTERACTIVE_STYLES_ID;
  style.textContent = NEUTRALIZE_INTERACTIVE_STYLES;
  document.head.appendChild(style);
  return style;
}

function resolvePageBackground(): string | undefined {
  const isOpaque = (c: string) =>
    !!c && c !== 'transparent' && !c.startsWith('rgba(0, 0, 0, 0)');

  const bodyBg = getComputedStyle(document.body).backgroundColor;
  if (isOpaque(bodyBg)) return bodyBg;

  const rootStyle = getComputedStyle(document.documentElement);
  if (isOpaque(rootStyle.backgroundColor)) return rootStyle.backgroundColor;

  // Final fallback — shadcn convention: --background is defined as raw HSL
  // values (e.g. "224 16% 10%") on :root, switched by a .dark class.
  const cssVar = rootStyle.getPropertyValue('--background').trim();
  if (cssVar) return /^[\d.]/.test(cssVar) ? `hsl(${cssVar})` : cssVar;

  return undefined;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Pre-inline images that need our auth cookie (e.g. the org logo, served from a
 * cookie-gated API endpoint) by fetching them WITH credentials and swapping the
 * src for a data URL before capture. Returns a function that restores the
 * originals.
 *
 * Why not just set html-to-image's global `fetchRequestInit: {credentials:
 * 'include'}`? Because that flag applies to EVERY resource it fetches, including
 * cross-origin CDN web fonts (Google Fonts). Those answer with a wildcard
 * `Access-Control-Allow-Origin: *`, which the spec forbids on a credentialed
 * request — so the font fetch is CORS-blocked, html-to-image rejects, and the
 * whole screenshot comes back empty. Sending credentials ourselves, per-image,
 * keeps cookies on our own requests and OFF the font/CDN requests.
 *
 * Images that reject a credentialed fetch (e.g. a wildcard-CORS third-party
 * image) are simply left untouched for html-to-image to fetch anonymously.
 */
async function inlineCredentialedImages(root: HTMLElement): Promise<() => void> {
  const imgs = Array.from(root.querySelectorAll('img')).filter((img) =>
    /^https?:/i.test(img.currentSrc || img.src),
  );

  const restores: Array<() => void> = [];
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src;
      try {
        const res = await fetch(src, { credentials: 'include', cache: 'force-cache' });
        if (!res.ok) return; // 401/blocked → leave for html-to-image to retry
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) return;
        const dataUrl = await blobToDataURL(blob);
        const original = img.getAttribute('src');
        img.setAttribute('src', dataUrl);
        restores.push(() =>
          original === null ? img.removeAttribute('src') : img.setAttribute('src', original),
        );
      } catch {
        // Cross-origin image that doesn't allow credentialed CORS — leave it;
        // html-to-image fetches it anonymously (and may placeholder it).
      }
    }),
  );

  return () => restores.forEach((r) => r());
}

/**
 * Bake every scrolled container's offset INTO the layout so the capture matches
 * what's actually on screen.
 *
 * html-to-image clones the DOM and resets every scroll container's
 * scrollTop/scrollLeft to 0, so a scrolled page captures from the TOP, not the
 * user's current view. For each scrolled element we translate its children up/
 * left by the scroll offset (reproducing the scrolled position the clone can't
 * keep) and zero the live scrollTop/Left so the on-screen view doesn't visibly
 * shift while we capture. Everything is restored afterwards.
 *
 * Works for BOTH the window/root scroller and inner `overflow:auto` panes
 * (this app scrolls an inner <main>, not the window). Generic — no app knowledge.
 */
function bakeScrollOffsets(root: HTMLElement): () => void {
  const candidates = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  const restores: Array<() => void> = [];

  for (const el of candidates) {
    const top = el.scrollTop;
    const left = el.scrollLeft;
    if (top === 0 && left === 0) continue;

    const children = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement,
    );
    const prevTransforms = children.map((c) => c.style.transform);

    children.forEach((c, i) => {
      const prev = prevTransforms[i];
      c.style.transform = `translate(${-left}px, ${-top}px)${prev ? ` ${prev}` : ''}`;
    });
    // Zero the live scroll so the visible view stays put (translate already
    // shifted the content by the same amount) — avoids a flicker mid-capture.
    el.scrollTop = 0;
    el.scrollLeft = 0;

    restores.push(() => {
      children.forEach((c, i) => {
        c.style.transform = prevTransforms[i];
      });
      el.scrollTop = top;
      el.scrollLeft = left;
    });
  }

  return () => restores.forEach((r) => r());
}

/**
 * Capture the VISIBLE VIEWPORT — what the user is currently looking at,
 * scroll position included — not the whole page from the top.
 */
export async function captureViewportScreenshot(): Promise<CaptureResult> {
  const target = document.documentElement;

  await waitForFonts();
  blurActiveElement();
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  // The on-screen viewport, excluding scrollbars.
  const viewportWidth = target.clientWidth;
  const viewportHeight = target.clientHeight;

  const styleEl = injectNeutralizeStyles();
  const restoreScroll = bakeScrollOffsets(target);
  const restoreImages = await inlineCredentialedImages(target);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const backgroundColor = resolvePageBackground();

  const options = {
    width: viewportWidth,
    height: viewportHeight,
    pixelRatio,
    backgroundColor,
    cacheBust: true,
    filter: (node: HTMLElement) => {
      if (!(node instanceof HTMLElement)) return true;
      if (node.hasAttribute(HIDE_DURING_CAPTURE_ATTR)) return false;
      return true;
    },
    style: {
      margin: '0',
    },
  };

  try {
    let dataUrl: string;
    try {
      dataUrl = await toPng(target, options);
    } catch (err) {
      // A single un-fetchable resource — most often a cross-origin web font
      // behind a wildcard CORS policy — makes html-to-image reject and blanks
      // the whole capture. Retry once WITHOUT embedding web fonts so we still
      // return a usable screenshot (text falls back to system fonts).
      console.warn('[feedback] screenshot retry without embedded web fonts', err);
      dataUrl = await toPng(target, { ...options, skipFonts: true });
    }

    return {
      dataUrl,
      width: Math.round(viewportWidth * pixelRatio),
      height: Math.round(viewportHeight * pixelRatio),
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  } finally {
    restoreImages();
    restoreScroll();
    styleEl.remove();
  }
}

/** @deprecated Back-compat alias — now captures the visible viewport. */
export const captureFullPageScreenshot = captureViewportScreenshot;

export const HIDE_ATTR = HIDE_DURING_CAPTURE_ATTR;
