import { useState } from 'react';
import { Trash2, Flag, CornerDownRight, Minus, Plus } from 'lucide-react';
import { useT } from '@/hooks/useT';
import VoteControl from './VoteControl';
import AuthorLine from './AuthorLine';

// A comment in the Reddit-comment style: a thin thread line on the left, a
// collapse toggle, the author line, body, and subtle actions. Each top-level
// comment renders its own (one level of) child replies and can be collapsed,
// which hides its body, actions and children behind a compact summary line.
export default function PostItem({ post, childPosts = [], onVote, onDelete, onReport, onReply }) {
  const { t, lang } = useT();
  const [collapsed, setCollapsed] = useState(false);
  const replyCount = childPosts.length;

  const toggle = (
    <button
      type="button"
      className="comment-collapse"
      aria-label={collapsed ? t('com.expand') : t('com.collapse')}
      aria-expanded={!collapsed}
      onClick={() => setCollapsed((c) => !c)}
    >
      {collapsed ? <Plus size={12} /> : <Minus size={12} />}
    </button>
  );

  return (
    <div className="comment" data-testid="post-item">
      <div className="comment-head">
        {toggle}
        <AuthorLine author={post.author} createdAt={post.createdAt} lang={lang} />
        {collapsed && replyCount > 0 && (
          <span className="muted small">· {replyCount} {replyCount === 1 ? t('com.reply1') : t('com.replies')}</span>
        )}
      </div>

      {!collapsed && (
        <div className="comment-body-row">
          <div className="comment-rail">
            <VoteControl score={post.score} myVote={post.myVote} onVote={(v) => onVote?.(post, v)} disabled={post.deleted} />
          </div>
          <div className="comment-main">
            <div className="comment-text" style={{ color: post.deleted ? 'var(--muted)' : 'var(--ink)' }}>
              {post.deleted ? t('com.deleted') : post.body}
            </div>
            {!post.deleted && (
              <div className="comment-actions">
                {onReply && (
                  <button className="comment-action" onClick={() => onReply(post)}>
                    <CornerDownRight size={13} /> {t('com.reply')}
                  </button>
                )}
                {post.canModerate && (
                  <button className="comment-action danger" onClick={() => onDelete?.(post)}>
                    <Trash2 size={13} /> {t('common.delete')}
                  </button>
                )}
                <button className="comment-action" onClick={() => onReport?.(post)}>
                  <Flag size={13} /> {t('com.report')}
                </button>
              </div>
            )}

            {replyCount > 0 && (
              <div className="comment-children">
                {childPosts.map((c) => (
                  <PostItem key={c.id} post={c} onVote={onVote} onDelete={onDelete} onReport={onReport} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
