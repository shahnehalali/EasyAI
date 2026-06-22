import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/apis/dashboardApi';
import { reportApi } from '@/apis/reportApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Banner } from '@/components/ui/Ui';
import {
  ComplianceStandingCard, RiskOverviewPanel, UpcomingReviewsWidget,
  ActiveFrameworksWidget, OpenItemsList, RecentActivityFeed,
} from '@/components/dashboard/widgets';

export default function Dashboard() {
  const { can } = useAuth();
  const { t } = useT();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.summary });

  if (isLoading) return <SkeletonPage rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const empty = data.counts.aiSystems === 0;

  return (
    <div data-testid="dashboard">
      <div className="page-head">
        <div>
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
          <Link className="btn btn-primary" to="/ai-systems/new">{t('dash.register')}</Link>
        </div>
      </div>

      {empty && (
        <Banner kind="info">
          {t('dash.welcome')} <Link to="/law-explorer">{t('nav.lawExplorer')}</Link>
        </Banner>
      )}

      <div className="stack">
        <ComplianceStandingCard overall={data.overall} counts={data.counts} />

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
