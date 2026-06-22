import { useEffect, useRef, useState } from 'react';
import { AnnotationCanvas, type AnnotationCanvasHandle, type AnnotationTool } from './AnnotationCanvas';
import { compressDataUrlIfNeeded } from '../utils/dataUrl';
import type { FeedbackConfig } from '../types';

interface Props {
  config: FeedbackConfig;
  imageDataUrl: string | null;
  isCapturing: boolean;
  onClose: () => void;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#1e293b'];
const MAX_PAYLOAD_BYTES = 8_000_000;

export function FeedbackModal({ config, imageDataUrl, isCapturing, onClose }: Props) {
  const canvasRef = useRef<AnnotationCanvasHandle>(null);
  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState<string>(COLORS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 900, h: 520 });

  useEffect(() => {
    const compute = () => {
      const w = Math.min(window.innerWidth - 80, 1100);
      const h = Math.min(window.innerHeight - 320, 600);
      setSize({ w: Math.max(400, w), h: Math.max(300, h) });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const submit = async () => {
    setError(null);
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    if (description.trim().length < 5) return setError('Please describe the issue (5+ characters).');

    const exported = canvasRef.current?.exportDataUrl() ?? imageDataUrl;
    if (!exported) return setError('Screenshot is not ready yet.');

    setSubmitting(true);
    try {
      const compressed = await compressDataUrlIfNeeded(exported, MAX_PAYLOAD_BYTES);
      const res = await fetch(config.apiUrl, {
        method: 'POST',
        credentials: config.withCredentials === false ? 'omit' : 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          screenshot: compressed,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          meta: config.meta,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Request failed (${res.status})`);
      }

      config.onSubmitSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback';
      setError(msg);
      config.onSubmitError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-feedback-hide-during-capture style={overlayStyle} role="dialog" aria-modal="true">
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Send feedback</h2>
          <button onClick={onClose} style={iconBtn} aria-label="Close">×</button>
        </div>

        <div style={toolbarStyle}>
          {(['pen', 'highlight', 'arrow', 'rect', 'text', 'none'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              style={tool === t ? activeToolBtn : toolBtn}
              type="button"
            >
              {t === 'none' ? 'Move' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <span style={{ width: 1, alignSelf: 'stretch', background: '#e2e8f0', margin: '0 4px' }} />
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              type="button"
              aria-label={`Color ${c}`}
              style={{
                ...colorSwatch,
                background: c,
                outline: color === c ? '2px solid #0f172a' : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
          <span style={{ width: 1, alignSelf: 'stretch', background: '#e2e8f0', margin: '0 4px' }} />
          <button onClick={() => canvasRef.current?.undo()} style={toolBtn} type="button">Undo</button>
          <button onClick={() => canvasRef.current?.clear()} style={toolBtn} type="button">Clear</button>
        </div>

        <div style={canvasWrapStyle}>
          {isCapturing && (
            <div style={loadingStyle}>Capturing screenshot…</div>
          )}
          {!isCapturing && imageDataUrl && (
            <AnnotationCanvas
              ref={canvasRef}
              imageDataUrl={imageDataUrl}
              tool={tool}
              color={color}
              maxWidth={size.w}
              maxHeight={size.h}
            />
          )}
        </div>

        <div style={formStyle}>
          <input
            type="text"
            placeholder="Short title (e.g. Sidebar collapses on mobile)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            maxLength={200}
          />
          <textarea
            placeholder="Describe what happened, what you expected, and any steps to reproduce…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textareaStyle}
            rows={3}
            maxLength={5000}
          />
          {error && <div style={errorStyle}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={secondaryBtn} type="button" disabled={submitting}>
              Cancel
            </button>
            <button onClick={submit} style={primaryBtn} type="button" disabled={submitting || isCapturing}>
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2147483000,
  padding: 24,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const panelStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#0f172a',
  borderRadius: 12,
  boxShadow: '0 25px 60px -10px rgba(0,0,0,0.4)',
  width: 'min(1180px, 100%)',
  maxHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const toolbarStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const toolBtn: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  fontSize: 13,
  cursor: 'pointer',
  color: '#0f172a',
};

const activeToolBtn: React.CSSProperties = {
  ...toolBtn,
  background: '#0f172a',
  color: '#ffffff',
  borderColor: '#0f172a',
};

const colorSwatch: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  border: '1px solid #cbd5e1',
  cursor: 'pointer',
};

const canvasWrapStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 240,
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  padding: 16,
};

const loadingStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 14,
};

const formStyle: React.CSSProperties = {
  padding: 16,
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  outline: 'none',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
};

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  padding: '8px 12px',
  borderRadius: 8,
  fontSize: 13,
};

const primaryBtn: React.CSSProperties = {
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  background: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
};

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: 24,
  lineHeight: 1,
  cursor: 'pointer',
  color: '#64748b',
  padding: '0 4px',
};
