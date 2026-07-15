import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Download, ClipboardCheck, Landmark, ChevronRight } from 'lucide-react';
import { assessmentApi } from '@/apis/assessmentApi';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Card } from '@/components/ui/Ui';
import { COMPLIANCE_MILESTONES } from '@/data/complianceDates';

const FILTERS = ['all', 'upcoming', 'regulatory', 'reviews'];

// ICS text-escaping: commas, semicolons and backslashes are special.
const icsEscape = (s = '') => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
const pad = (n) => String(n).padStart(2, '0');
const icsDate = (d) => { const t = new Date(d); return `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}`; };

export default function Timeline() {
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const [openYears, setOpenYears] = useState(() => new Set()); // all years collapsed initially
  const toggleYear = (y) => setOpenYears((prev) => {
    const next = new Set(prev);
    if (next.has(y)) next.delete(y); else next.add(y);
    return next;
  });
  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments', lang], queryFn: () => assessmentApi.list(lang),
  });

  const now = Date.now();

  // Merge curated regulatory milestones with this org's assessment review dates
  // into one chronological list.
  const events = useMemo(() => {
    const milestones = COMPLIANCE_MILESTONES.map((m) => ({
      key: `m-${m.id}`,
      kind: 'milestone',
      date: m.date,
      ts: new Date(m.date).getTime(),
      title: m.title[lang] || m.title.en,
      framework: m.framework[lang] || m.framework.en,
      frameworkKey: m.frameworkKey,
    }));
    const reviews = (assessments || [])
      .filter((a) => a.nextReviewDueAt)
      .map((a) => ({
        key: `r-${a.id}`,
        kind: 'review',
        date: a.nextReviewDueAt,
        ts: new Date(a.nextReviewDueAt).getTime(),
        title: a.template?.name,
        framework: a.framework?.shortName || a.framework?.name,
        frameworkKey: a.framework?.key,
        assessmentId: a.id,
        system: a.aiSystem?.name,
      }));
    return [...milestones, ...reviews].sort((x, y) => x.ts - y.ts);
  }, [assessments, lang]);

  const statusOf = (e) => {
    if (e.ts >= now) return 'upcoming';
    return e.kind === 'review' ? 'overdue' : 'done';
  };

  const filtered = events.filter((e) => {
    if (filter === 'upcoming') return e.ts >= now;
    if (filter === 'regulatory') return e.kind === 'milestone';
    if (filter === 'reviews') return e.kind === 'review';
    return true;
  });

  const counts = {
    upcoming: events.filter((e) => e.ts >= now).length,
    overdue: events.filter((e) => e.kind === 'review' && e.ts < now).length,
    done: events.filter((e) => e.kind === 'milestone' && e.ts < now).length,
  };

  // Split each date into parts for the card's date chip, and group by year.
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const dateParts = (d) => {
    const dt = new Date(d);
    return { day: pad(dt.getDate()), mon: dt.toLocaleString(locale, { month: 'short' }), yr: dt.getFullYear() };
  };
  const groups = [...filtered.reduce((map, e) => {
    const y = new Date(e.date).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y).push(e);
    return map;
  }, new Map()).entries()].map(([year, items]) => ({ year, items }));

  const exportIcs = () => {
    const stamp = `${icsDate(new Date())}T000000Z`;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Compliance Check//Timeline//EN', 'CALSCALE:GREGORIAN'];
    events.forEach((e) => {
      const summary = (e.kind === 'review' ? `${t('tl.reviewDue')}: ` : '') + e.title;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${e.key}@compliance.rit.services`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
        `SUMMARY:${icsEscape(summary)}`,
        `DESCRIPTION:${icsEscape(e.framework + (e.system ? ` · ${e.system}` : ''))}`,
        'END:VEVENT',
      );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'compliance-timeline.ics';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <SkeletonPage rows={4} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div data-testid="timeline">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('tl.eyebrow')}</div>
          <h1>{t('tl.title')}</h1>
          <p className="sub">{t('tl.sub')}</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline" onClick={exportIcs} data-testid="timeline-ics" disabled={events.length === 0}>
            <Download size={15} /> {t('tl.addToCalendar')}
          </button>
        </div>
      </div>

      <div className="tl-stats">
        <div className="tl-stat tl-stat-upcoming">
          <div className="tl-stat-num">{counts.upcoming}</div>
          <div className="tl-stat-label">{t('tl.filter.upcoming')}</div>
        </div>
        <div className="tl-stat tl-stat-overdue">
          <div className="tl-stat-num">{counts.overdue}</div>
          <div className="tl-stat-label">{t('tl.status.overdue')}</div>
        </div>
        <div className="tl-stat tl-stat-done">
          <div className="tl-stat-num">{counts.done}</div>
          <div className="tl-stat-label">{t('tl.status.done')}</div>
        </div>
      </div>

      <div className="filter-row" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            aria-pressed={filter === f}
            data-testid={`tl-filter-${f}`}
            onClick={() => setFilter(f)}
          >
            {t(`tl.filter.${f}`)}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <Card variant="ruled"><p className="muted small" style={{ margin: 0 }}>{t('tl.empty')}</p></Card>
      ) : (
        <div className="tl2" data-testid="tl-list">
          {groups.map((g) => {
            const open = openYears.has(g.year);
            const overdue = g.items.filter((e) => e.kind === 'review' && e.ts < now).length;
            return (
            <div key={g.year} className="tl2-yeargroup">
              <button
                type="button"
                className={`tl2-yearbtn${open ? ' is-open' : ''}`}
                aria-expanded={open}
                data-testid={`tl-year-${g.year}`}
                onClick={() => toggleYear(g.year)}
              >
                <ChevronRight size={16} className="tl2-chevron" aria-hidden="true" />
                <span className="tl2-yearnum">{g.year}</span>
                <span className="tl2-yearcount">{g.items.length}</span>
                {overdue > 0 && <span className="tl2-yearoverdue">{overdue} {t('tl.status.overdue')}</span>}
              </button>
              {open && (
              <div className="tl2-group">
                {g.items.map((e) => {
                  const st = statusOf(e);
                  const dp = dateParts(e.date);
                  return (
                    <div key={e.key} className={`tl2-card tl2-${st}`} data-testid="tl-item">
                      <div className="tl2-datechip">
                        <span className="tl2-day">{dp.day}</span>
                        <span className="tl2-mon">{dp.mon}</span>
                      </div>
                      <div className="tl2-body">
                        <div className="tl2-badges">
                          <span className={`tl2-badge tl2-badge-${st}`}>{t(`tl.status.${st}`)}</span>
                          <span className="tl2-kind">
                            {e.kind === 'review'
                              ? <><ClipboardCheck size={12} aria-hidden="true" /> {t('tl.review')}</>
                              : <><Landmark size={12} aria-hidden="true" /> {t('tl.milestone')}</>}
                          </span>
                        </div>
                        <div className="tl2-title">
                          {e.kind === 'review' && e.assessmentId
                            ? <Link to={`/assessments/${e.assessmentId}`}>{t('tl.reviewDue')}: {e.title}</Link>
                            : e.title}
                        </div>
                        <div className="tl2-tags">
                          {e.frameworkKey
                            ? <Link to={`/frameworks/${e.frameworkKey}`} className="tag-pill">{e.framework}</Link>
                            : <span className="tag-pill">{e.framework}</span>}
                          {e.system && <span className="muted small">{e.system}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
