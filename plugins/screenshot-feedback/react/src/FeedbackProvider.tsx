import { lazy, Suspense, useCallback, useMemo, useState, type ReactNode } from 'react';
import { FeedbackContext } from './FeedbackContext';
import { FeedbackButton } from './components/FeedbackButton';
import { captureViewportScreenshot } from './utils/captureScreenshot';
import type { FeedbackConfig, FeedbackContextValue } from './types';

// Lazy-load the annotation modal so its heavy Konva canvas dependency is only
// fetched when the user actually opens feedback — every other page stays light.
const FeedbackModal = lazy(() =>
  import('./components/FeedbackModal').then((m) => ({ default: m.FeedbackModal })),
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
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const result = await captureViewportScreenshot();
      setImageDataUrl(result.dataUrl);
      setIsOpen(true);
    } catch (err) {
      console.error('[feedback] capture failed', err);
      config.onSubmitError?.(err);
    } finally {
      setIsCapturing(false);
    }
  }, [config]);

  const close = useCallback(() => {
    setIsOpen(false);
    setImageDataUrl(null);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({ config, open, close, isOpen, isCapturing }),
    [config, open, close, isOpen, isCapturing],
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
