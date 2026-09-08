import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/apis/dashboardApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Banner } from '@/components/ui/Ui';
import {
  ComplianceStandingCard, RiskOverviewPanel, UpcomingReviewsWidget,
  ActiveFrameworksWidget, OpenItemsList, RecentActivityFeed, ComplianceTrendWidget,
} from '@/components/dashboard/widgets';

export default function Dashboard() {
  const { can } = useAuth();
  const { t } = useT();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.summary });
  // Own query: the 90-day trend is a separate, slightly heavier read (one row
  // per day) from a daily-cron-populated table, no reason to block the rest
  // of the dashboard on it or refetch it as often as the summary.
  const { data: trends } = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => dashboardApi.trends(90),
    enabled: !isLoading && !error,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <SkeletonPage rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const empty = data.counts.aiSystems === 0;

  return (
    <div data-testid="dashboard">
      <div className="page-head">
        <div className="glass-head">
          <div className="eyebrow">{t('dash.eyebrow')}</div>
          <h1>{t('dash.title')}</h1>
          <p className="sub">{t('dash.sub')}</p>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {can('export') && (
            <>
              <a className="btn btn-outline" href={reportApi.orgPdfUrl()} data-testid="export-org-pdf">{t('dash.exportPdf')}</a>
              <a className="btn btn-outline" href={reportApi.orgCsvUrl()} data-testid="export-org-csv">{t('dash.exportCsv')}</a>
            </>
          )}
          {can('compliance.edit') && <Link className="btn btn-primary" to="/ai-systems/new">{t('dash.register')}</Link>}
        </div>
      </div>

      {empty && (
        <Banner kind="info">
          {t('dash.welcome')} <Link to="/law-explorer">{t('nav.lawExplorer')}</Link>
        </Banner>
      )}

      <div className="stack">
        <ComplianceStandingCard overall={data.overall} counts={data.counts} />

        {!empty && <ComplianceTrendWidget trends={trends || []} />}

        <div className="grid grid-3">
          <RiskOverviewPanel riskOverview={data.riskOverview} />
          <ActiveFrameworksWidget activeFrameworks={data.activeFrameworks} />
          <OpenItemsList openItems={data.openItems} />
        </div>

        <div className="grid grid-2">
          <UpcomingReviewsWidget upcoming={data.upcoming} />
          <RecentActivityFeed recentActivity={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
