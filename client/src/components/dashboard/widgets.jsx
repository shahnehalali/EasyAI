import { Link } from 'react-router-dom';
import { Card, Progress, Chip } from '@/components/ui/Ui';
import { RISK_CHIP, riskLabel, severityLabel, formatDate, fromNow } from '@/utils/format';
import { useT } from '@/hooks/useT';

// Large compliance standing card with a ruled "seal" look.
export function ComplianceStandingCard({ overall, counts }) {
  const { t } = useT();
  return (
    <div className="card ruled" data-testid="widget-standing">
      <div className="card-body" style={{ display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: 130 }}>
          <div className="card-title-eyebrow">{t('w.standing')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 56, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }} data-testid="overall-score">
            {overall}<span style={{ fontSize: 24 }}>%</span>
          </div>
          <div className="muted small">{t('w.acrossAll')}</div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Progress value={overall} variant={overall >= 80 ? 'green' : 'gold'} />
          <div className="grid grid-4" style={{ marginTop: 16, gap: 10 }}>
            <Stat n={counts.aiSystems} l={t('w.aiSystems')} />
            <Stat n={counts.assessments} l={t('w.assessments')} />
            <Stat n={counts.reviewsDue} l={t('w.reviewsDue')} />
            <Stat n={counts.openItems} l={t('w.openItems')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: 'var(--navy)' }}>{n}</div>
      <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
    </div>
  );
}

export function RiskOverviewPanel({ riskOverview }) {
  const { t, lang } = useT();
  const order = ['prohibited', 'high', 'limited', 'minimal', 'unclassified'];
  const total = order.reduce((s, k) => s + (riskOverview[k] || 0), 0);
  return (
    <Card title={t('w.riskOverview')} variant="ruled-gold">
      {total === 0 ? (
        <p className="muted small">{t('w.noSystems')}</p>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {order.filter((k) => riskOverview[k]).map((k) => (
            <div key={k} className="row-between">
              <Chip className={RISK_CHIP[k]}>{riskLabel(k, lang)}</Chip>
              <strong>{riskOverview[k]}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function UpcomingReviewsWidget({ upcoming }) {
  const { t } = useT();
  return (
    <Card title={t('w.upcomingReviews')} data-testid="widget-reviews">
      {upcoming.length === 0 ? (
        <p className="muted small">{t('w.noReviews')}</p>
      ) : (
        <div className="stack" style={{ gap: 0 }}>
          {upcoming.map((r) => (
            <Link key={r.id} to={`/assessments/${r.id}`} className="row-between"
              style={{ padding: '9px 0', borderBottom: '1px solid var(--hairline-2)', color: 'var(--ink)' }}>
              <span style={{ fontSize: 13 }}>{r.title}</span>
              <Chip className={r.overdue ? 'chip-red' : 'chip-amber'}>{r.overdue ? t('w.overdue') : fromNow(r.nextReviewDueAt)}</Chip>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

export function ActiveFrameworksWidget({ activeFrameworks }) {
  const { t } = useT();
  return (
    <Card title={t('w.frameworkProgress')}>
      {activeFrameworks.length === 0 ? (
        <p className="muted small">{t('w.classifyToActivate')}</p>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {activeFrameworks.map((f) => (
            <div key={f.key}>
              <div className="row-between" style={{ marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                <span className="muted small">{f.progressPct}%</span>
              </div>
              <Progress value={f.progressPct} variant={f.progressPct >= 80 ? 'green' : ''} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function OpenItemsList({ openItems }) {
  const { t, lang } = useT();
  const rows = [
    ['mandatory', 'chip-red'],
    ['recommended', 'chip-amber'],
    ['informational', 'chip-navy'],
  ];
  return (
    <Card title={t('w.openBySeverity')}>
      <div className="stack" style={{ gap: 10 }}>
        {rows.map(([k, chip]) => (
          <div key={k} className="row-between">
            <Chip className={chip}>{severityLabel(k, lang)}</Chip>
            <strong>{openItems[k] || 0}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Dependency-free SVG line chart of the compliance score over time.
export function ComplianceTrendWidget({ trends = [] }) {
  const W = 520; const H = 120; const pad = 6;
  const points = trends.map((t) => t.overall);
  const last = points.length ? points[points.length - 1] : 0;
  const first = points.length ? points[0] : 0;
  const delta = last - first;

  const coords = points.map((v, i) => {
    const x = points.length <= 1 ? W / 2 : pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / 100) * (H - pad * 2);
    return [x, y];
  });
  const linePts = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPts = coords.length
    ? `${pad},${H - pad} ${linePts} ${coords[coords.length - 1][0].toFixed(1)},${H - pad}`
    : '';

  return (
    <Card title="Compliance over time" variant="ruled" data-testid="widget-trends"
      action={<span className="muted small" data-testid="trend-points">{trends.length} day{trends.length === 1 ? '' : 's'}</span>}>
      <div className="row" style={{ gap: 12, alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>{last}%</span>
        {trends.length > 1 && (
          <Chip className={delta >= 0 ? 'chip-green' : 'chip-red'}>{delta >= 0 ? '+' : ''}{delta}% over {trends.length} days</Chip>
        )}
      </div>
      {trends.length < 2 ? (
        <p className="muted small" style={{ margin: 0 }}>The trend builds up as snapshots are recorded each day. Check back tomorrow to see it grow.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="120" preserveAspectRatio="none" role="img" aria-label="Compliance score over time">
          <polygon points={areaPts} fill="var(--accent-soft)" />
          <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
    </Card>
  );
}

export function RecentActivityFeed({ recentActivity }) {
  const { t } = useT();
  const labelFor = (a) => a.action.replace(/[._]/g, ' ');
  return (
    <Card title={t('w.recentActivity')}>
      {recentActivity.length === 0 ? (
        <p className="muted small">{t('w.noActivity')}</p>
      ) : (
        <div className="stack" style={{ gap: 0 }}>
          {recentActivity.map((a) => (
            <div key={a.id} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline-2)' }}>
              <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{labelFor(a)}</span>
              <span className="muted" style={{ fontSize: 11 }}>{formatDate(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
