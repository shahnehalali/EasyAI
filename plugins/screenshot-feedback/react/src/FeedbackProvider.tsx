import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FeedbackContext } from './FeedbackContext';
import { FeedbackButton } from './components/FeedbackButton';
import { captureViewportScreenshot } from './utils/captureScreenshot';
import type { FeedbackConfig, FeedbackContextValue } from './types';

// Lazy-load the annotation modal so its heavy Konva canvas dependency is only
// fetched when the user actually opens feedback — every other page stays light.
// `importFeedbackModal` is shared so we can also PREFETCH the chunk on hover,
// so the first open doesn't wait on the dynamic import.
const importFeedbackModal = () => import('./components/FeedbackModal');
const FeedbackModal = lazy(() =>
  importFeedbackModal().then((m) => ({ default: m.FeedbackModal })),
);

interface Props {
  config: FeedbackConfig;
  children: ReactNode;
}

export function FeedbackProvider({ config, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const open = useCallback(async () => {
    if (config.enabled === false) return;
    // Broadcast that the feedback flow has started so app-level overlays
    // (notification drawers, dropdown menus, modal cheat-sheets, etc.) can
    // close themselves cooperatively. This gives us a clean single-click
    // experience even when the Feedback button is clicked while another
    // floating UI is open. The event name is host-agnostic ('feedback:open')
    // so any app embedding the plugin can listen for it — see README.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('feedback:open'));
    }
    setImageDataUrl(null);
    setIsCapturing(true);
    // Open the dialog IMMEDIATELY (it shows a "Capturing…" placeholder) and run
    // the screenshot capture in parallel, instead of blocking on the capture
    // before the dialog appears. The modal root carries
    // data-feedback-hide-during-capture, so it is excluded from the screenshot.
    setIsOpen(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const result = await captureViewportScreenshot();
      setImageDataUrl(result.dataUrl);
    } catch (err) {
      console.error('[feedback] capture failed', err);
      config.onSubmitError?.(err);
    } finally {
      setIsCapturing(false);
    }
  }, [config]);

  // Warm the lazy modal chunk (Konva) ahead of the click so the first open is
  // instant. Cheap and idempotent — the dynamic import is cached after the first call.
  const prefetch = useCallback(() => { void importFeedbackModal(); }, []);

  // Also warm it once the page goes idle, so even the very first open (before any
  // hover) doesn't wait on the dynamic import.
  useEffect(() => {
    if (config.enabled === false || typeof window === 'undefined') return undefined;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => prefetch(), { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(prefetch, 1500);
    return () => window.clearTimeout(id);
  }, [config.enabled, prefetch]);

  const close = useCallback(() => {
    setIsOpen(false);
    setImageDataUrl(null);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({ config, open, close, isOpen, isCapturing, prefetch }),
    [config, open, close, isOpen, isCapturing, prefetch],
  );

  const mode = config.mode ?? 'floating';
  const showFloating = mode === 'floating' && config.enabled !== false;

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {showFloating && <FeedbackButton variant="floating" />}
      {isOpen && (
        <Suspense fallback={null}>
          <FeedbackModal
            config={config}
            imageDataUrl={imageDataUrl}
            isCapturing={isCapturing}
            onClose={close}
          />
        </Suspense>
      )}
    </FeedbackContext.Provider>
  );
}
