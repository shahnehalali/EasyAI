import { useState } from 'react';

// Lightweight password strength estimate (no dependency).
export function scorePassword(pw = '') {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4); // 0..4
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['var(--red)', 'var(--red)', 'var(--amber)', 'var(--green)', 'var(--green)'];

// Controlled-ish password input that works with react-hook-form's register().
// Pass the register() result via `field`, plus the current value for the meter.
export default function PasswordField({ field, value = '', testId = 'password', label = 'Password', showMeter = false, autoComplete = 'new-password', error, hint }) {
  const [show, setShow] = useState(false);
  const score = scorePassword(value);
  const inputId = `pw-${testId}`;

  return (
    <div className="field">
      <label className="label" htmlFor={inputId}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          className="input"
          type={show ? 'text' : 'password'}
          data-testid={testId}
          autoComplete={autoComplete}
          style={{ paddingRight: 64 }}
          {...field}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {showMeter && value && (
        <div style={{ marginTop: 8 }} aria-live="polite">
          <div className="row" style={{ gap: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{
                flex: 1, height: 4, borderRadius: 999,
                background: i < score ? COLORS[score] : 'var(--border)',
              }} />
            ))}
          </div>
          <div className="hint" style={{ color: COLORS[score] }}>{LABELS[score]}</div>
        </div>
      )}
      {error && <div className="error-text">{error}</div>}
      {hint && !error && <div className="hint">{hint}</div>}
    </div>
  );
}
