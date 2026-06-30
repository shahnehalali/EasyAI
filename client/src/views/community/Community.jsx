import { useT } from '@/hooks/useT';
import { Banner } from '@/components/ui/Ui';
import DiscussionTab from '@/components/community/DiscussionTab';

export default function Community() {
  const { t } = useT();
  return (
    <div data-testid="community">
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('com.eyebrow')}</div>
          <h1>{t('com.title')}</h1>
          <p className="sub">{t('com.sub')}</p>
        </div>
      </div>

      <Banner kind="info">{t('com.disclaimer')}</Banner>

      <div style={{ marginTop: 16 }}>
        <DiscussionTab />
      </div>
    </div>
  );
}
