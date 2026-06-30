import { Link } from 'react-router-dom';
import { Lock, Pin, MessageSquare } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { Chip } from '@/components/ui/Ui';
import VoteControl from './VoteControl';
import AuthorLine from './AuthorLine';

// A list of discussion rows. `showFramework` hides the law chip when the list
// is already scoped to one law (e.g. on the framework page).
export default function ThreadList({ threads = [], onVote, showFramework = true }) {
  const { t, lang } = useT();
  if (!threads.length) return null;
  return (
    <div className="stack" data-testid="thread-list">
      {threads.map((th) => (
        <div key={th.id} className="card" data-testid="thread-row">
          <div className="card-body row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <VoteControl score={th.score} myVote={th.myVote} onVote={(v) => onVote?.(th, v)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                {th.pinned && <Chip className="chip-gold" dot={false}><Pin size={11} /> {t('com.pinned')}</Chip>}
                {th.status === 'locked' && <Chip className="chip-grey" dot={false}><Lock size={11} /> {t('com.locked')}</Chip>}
                <Chip className={th.visibility === 'global' ? 'chip-navy' : 'chip-grey'} dot={false}>
                  {th.visibility === 'global' ? t('com.visGlobal') : t('com.visOrg')}
                </Chip>
                {showFramework && th.frameworkName && <Chip className="chip-grey" dot={false}>{th.frameworkName}</Chip>}
              </div>
              <Link to={`/community/${th.id}`} style={{ fontWeight: 600, fontSize: 15 }}>{th.title}</Link>
              <div className="row-between" style={{ marginTop: 8, gap: 10, flexWrap: 'wrap' }}>
                <AuthorLine author={th.author} createdAt={th.createdAt} lang={lang} />
                <span className="muted small row" style={{ gap: 4 }}>
                  <MessageSquare size={13} /> {th.replyCount} {th.replyCount === 1 ? t('com.reply1') : t('com.replies')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
