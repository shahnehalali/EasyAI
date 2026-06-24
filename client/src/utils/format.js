// Shared display helpers (status labels, dates, risk colors).
// Labels are bilingual; use the *Label(value, lang) helpers to resolve them.

export const RISK_LABELS = {
  en: {
    prohibited: 'Prohibited',
    high: 'High risk',
    limited: 'Limited risk',
    minimal: 'Minimal risk',
    unclassified: 'Not classified',
  },
  de: {
    prohibited: 'Verboten',
    high: 'Hohes Risiko',
    limited: 'Begrenztes Risiko',
    minimal: 'Minimales Risiko',
    unclassified: 'Nicht eingestuft',
  },
};

export const RISK_CHIP = {
  prohibited: 'chip-red',
  high: 'chip-amber',
  limited: 'chip-navy',
  minimal: 'chip-green',
  unclassified: 'chip-grey',
};

export const STATUS_LABELS = {
  en: {
    not_started: 'Not started',
    in_progress: 'In progress',
    done: 'Done',
    not_applicable: 'Not applicable',
    completed: 'Completed',
    needs_review: 'Needs review',
  },
  de: {
    not_started: 'Nicht begonnen',
    in_progress: 'In Bearbeitung',
    done: 'Erledigt',
    not_applicable: 'Nicht zutreffend',
    completed: 'Abgeschlossen',
    needs_review: 'Pruefung noetig',
  },
};

export const SEVERITY_LABELS = {
  en: { mandatory: 'Mandatory', recommended: 'Recommended', informational: 'Informational' },
  de: { mandatory: 'Verpflichtend', recommended: 'Empfohlen', informational: 'Informativ' },
};

export function riskLabel(risk, lang = 'en') {
  const key = risk || 'unclassified';
  return (RISK_LABELS[lang] || RISK_LABELS.en)[key] || key;
}
export function statusLabel(status, lang = 'en') {
  return (STATUS_LABELS[lang] || STATUS_LABELS.en)[status] || status;
}
export function severityLabel(sev, lang = 'en') {
  return (SEVERITY_LABELS[lang] || SEVERITY_LABELS.en)[sev] || sev;
}

export const STATUS_CHIP = {
  not_started: 'chip-grey',
  in_progress: 'chip-amber',
  done: 'chip-green',
  completed: 'chip-green',
  not_applicable: 'chip-grey',
  needs_review: 'chip-red',
};

export const SEVERITY_CHIP = {
  mandatory: 'chip-red',
  recommended: 'chip-amber',
  informational: 'chip-navy',
};

// Progress-bar colour based on the assessment's situation.
export function progressVariant(status, pct) {
  if (status === 'completed' || pct >= 100) return 'green';
  if (status === 'needs_review') return 'red';
  if (status === 'in_progress' || (pct > 0 && pct < 100)) return 'amber';
  return '';
}

// Active checklist-status button colour (done = green, in progress = amber, etc.).
export const STATUS_BTN_COLOR = {
  not_started: 'var(--grey)',
  in_progress: 'var(--amber)',
  done: 'var(--green)',
  not_applicable: 'var(--grey)',
};

export function formatDate(value) {
  if (!value) return '—'.replace('—', '-');
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fromNow(value, lang = 'en') {
  if (!value) return '';
  const d = new Date(value);
  const days = Math.round((d - new Date()) / (1000 * 60 * 60 * 24));
  const abs = Math.abs(days);
  if (lang === 'de') {
    if (days === 0) return 'heute';
    if (days > 0) return `in ${days} Tag${days === 1 ? '' : 'en'}`;
    return `vor ${abs} Tag${abs === 1 ? '' : 'en'}`;
  }
  if (days === 0) return 'today';
  if (days > 0) return `in ${days} day${days === 1 ? '' : 's'}`;
  return `${abs} day${abs === 1 ? '' : 's'} ago`;
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function tierLabel(tier, lang = 'en') {
  const map = {
    en: { 1: 'Tier 1 - EU', 2: 'Tier 2 - German', 3: 'Tier 3 - Sector' },
    de: { 1: 'Ebene 1 - EU', 2: 'Ebene 2 - Deutschland', 3: 'Ebene 3 - Sektor' },
  };
  return (map[lang] || map.en)[tier] || `Tier ${tier}`;
}

export function bytes(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
