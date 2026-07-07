import { useState, type CSSProperties } from 'react';
import { useFeedback } from '../hooks/useFeedback';

interface Props {
  variant?: 'floating' | 'sidebar' | 'navbar' | 'inline';
  className?: string;
  style?: CSSProperties;
  label?: string;
  icon?: React.ReactNode;
}

// A MEGAPHONE — deliberately not a speech/chat bubble. The old default icon was
// a chat bubble, which made the collapsed floating button read as a chat widget.
// A megaphone says "share your feedback" and can't be confused with chat.
const DefaultIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

export function FeedbackButton({ variant = 'inline', className, style, label, icon }: Props) {
  const { open, isCapturing, config, prefetch } = useFeedback();
  const [expanded, setExpanded] = useState(false);
  if (config.enabled === false) return null;

  const text = label ?? config.buttonLabel ?? 'Feedback';

  // Floating variant = a COLLAPSIBLE pill. At rest it's a compact circular badge
  // showing only the megaphone icon; on hover/focus (or while capturing) it
  // expands to reveal the "Feedback" label. The megaphone (not a chat bubble)
  // keeps the collapsed badge from being mistaken for a chat widget.
  if (variant === 'floating') {
    const showLabel = expanded || isCapturing;
    return (
      <button
        type="button"
        data-feedback-hide-during-capture
        data-feedback-trigger="true"
        onClick={open}
        disabled={isCapturing}
        onMouseEnter={() => { setExpanded(true); prefetch(); }}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => { setExpanded(true); prefetch(); }}
        onBlur={() => setExpanded(false)}
        className={className}
        style={mergeStyles(floatingStyle(config.floatingPosition ?? 'bottom-right'), style)}
        aria-label={isCapturing ? 'Capturing feedback…' : `Send ${text.toLowerCase()}`}
        title={`Send ${text.toLowerCase()}`}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
          {icon ?? <DefaultIcon />}
          <span
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              lineHeight: 'normal',
              maxWidth: showLabel ? 160 : 0,
              marginLeft: showLabel ? 8 : 0,
              opacity: showLabel ? 1 : 0,
              transition: 'max-width 220ms ease, opacity 180ms ease, margin-left 220ms ease',
            }}
          >
            {isCapturing ? 'Capturing…' : text}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-feedback-hide-during-capture
      data-feedback-trigger="true"
      onClick={open}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      disabled={isCapturing}
      className={className}
      style={mergeStyles(
        variant === 'sidebar' ? sidebarStyle : variant === 'navbar' ? navbarStyle : inlineStyle,
        style,
      )}
      aria-label={text}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {icon ?? <DefaultIcon />}
        <span>{isCapturing ? 'Capturing…' : text}</span>
      </span>
    </button>
  );
}

function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

function floatingStyle(pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'): CSSProperties {
  const offset = '20px';
  const placement: CSSProperties =
    pos === 'bottom-right' ? { bottom: offset, right: offset }
      : pos === 'bottom-left' ? { bottom: offset, left: offset }
      : pos === 'top-right' ? { top: offset, right: offset }
      : { top: offset, left: offset };
  return {
    position: 'fixed',
    ...placement,
    zIndex: 2147482000,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    // Equal padding so the collapsed (icon-only) state is a clean circle; the
    // label animates the width out to a pill on hover/focus.
    padding: 12,
    borderRadius: 999,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.25)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'box-shadow 200ms ease',
  };
}

const sidebarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  background: 'transparent',
  color: 'inherit',
  border: '1px solid transparent',
  cursor: 'pointer',
  fontSize: 14,
  textAlign: 'left',
};

const navbarStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 6,
  background: 'transparent',
  color: 'inherit',
  border: '1px solid currentColor',
  opacity: 0.85,
  cursor: 'pointer',
  fontSize: 13,
};

const inlineStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 6,
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
};
