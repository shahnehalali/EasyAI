import {
  STATUS_CHIP, RISK_CHIP, SEVERITY_CHIP,
  statusLabel, riskLabel, severityLabel,
  statusTip, riskTip, severityTip,
} from '@/utils/format';
import { useLangStore } from '@/store/langStore';
import { translate } from '@/i18n/ui';

// `tip` renders a hover tooltip (see [data-tip] in global.css) explaining what
// the pill means. Purely supplementary: the pill's own label stays the content.
export function Chip({ className = 'chip-grey', children, dot = true, tip }) {
  return (
    <span className={`chip ${className}`} {...(tip ? { 'data-tip': tip } : {})}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function StatusChip({ status }) {
  const lang = useLangStore((s) => s.lang);
  return <Chip className={STATUS_CHIP[status] || 'chip-grey'} tip={statusTip(status, lang)}>{statusLabel(status, lang)}</Chip>;
}

export function RiskChip({ risk }) {
  const lang = useLangStore((s) => s.lang);
  const key = risk || 'unclassified';
  return <Chip className={RISK_CHIP[key] || 'chip-grey'} tip={riskTip(key, lang)}>{riskLabel(key, lang)}</Chip>;
}

export function SeverityChip({ severity }) {
  const lang = useLangStore((s) => s.lang);
  return <Chip className={SEVERITY_CHIP[severity] || 'chip-grey'} tip={severityTip(severity, lang)}>{severityLabel(severity, lang)}</Chip>;
}

export function Progress({ value = 0, variant = '' }) {
  return (
    <div className={`progress ${variant}`}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Banner({ kind = 'info', children, ...rest }) {
  return <div className={`banner banner-${kind}`} {...rest}>{children}</div>;
}

export function Spinner({ label }) {
  const lang = useLangStore((s) => s.lang);
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      {label || translate(lang, 'ui.loading')}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, style }) {
  return <span className="skeleton" aria-hidden="true" style={{ width, height, ...style }} />;
}

// A page-level loading placeholder that mimics the dashboard/list shape.
export function SkeletonPage({ rows = 3 }) {
  const lang = useLangStore((s) => s.lang);
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{translate(lang, 'ui.loading')}</span>
      <Skeleton width="220px" height={28} style={{ marginBottom: 18 }} />
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body">
          <Skeleton width="40%" height={20} style={{ marginBottom: 14 }} />
          <Skeleton height={10} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={10} />
        </div>
      </div>
      <div className="stack">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card"><div className="card-body">
            <Skeleton width="35%" height={14} style={{ marginBottom: 12 }} />
            <Skeleton height={10} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={10} />
          </div></div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const lang = useLangStore((s) => s.lang);
  const message = typeof error === 'string' ? error : error?.message || translate(lang, 'ui.somethingWrong');
  return (
    <div className="card"><div className="empty">
      <div className="big">!</div>
      <h3 style={{ marginBottom: 6 }}>{translate(lang, 'ui.loadError')}</h3>
      <p className="muted">{message}</p>
      {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry} style={{ marginTop: 12 }}>{translate(lang, 'ui.tryAgain')}</button>}
    </div></div>
  );
}

export function EmptyState({ icon = '□', title, children }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}

export function Card({ title, action, children, variant = '', bodyClass = 'card-body', ...rest }) {
  return (
    <div className={`card ${variant}`} {...rest}>
      {(title || action) && (
        <div className="card-head">
          {title && <h3>{title}</h3>}
          {action}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
