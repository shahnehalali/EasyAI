import { useState } from 'react';
import { Trash2, Flag, CornerDownRight, Minus, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { initials, fromNow } from '@/utils/format';

// A Reddit-style comment: header (avatar / name, company / time), body, then a
// footer action row with a horizontal vote pill and actions. Each top-level
// comment renders its own (one level of) child replies under a thread line and
// can be collapsed, hiding its body, actions and children.
export default function PostItem({ post, childPosts = [], readOnly = false, onVote, onDelete, onReport, onReply }) {
  const { t, lang } = useT();
  const [collapsed, setCollapsed] = useState(false);
  const replyCount = childPosts.length;
  const name = post.author?.fullName || 'Unknown';

  const setVote = (dir) => () => { if (!readOnly) onVote?.(post, post.myVote === dir ? 0 : dir); };

  return (
    <div className="comment" data-testid="post-item">
      <div className="comment-header">
        <button
          type="button"
          className="comment-collapse"
          aria-label={collapsed ? t('com.expand') : t('com.collapse')}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <Plus size={13} /> : <Minus size={13} />}
        </button>
        <span className="avatar comment-avatar">{initials(name)}</span>
        <span className="comment-byline">
          <strong>{name}</strong>{post.author?.company && <span className="muted">, {post.author.company}</span>}
          <span className="muted"> · {fromNow(post.createdAt, lang)}</span>
          {collapsed && replyCount > 0 && (
            <span className="muted"> · {replyCount} {replyCount === 1 ? t('com.reply1') : t('com.replies')}</span>
          )}
        </span>
      </div>

      {!collapsed && (
        <>
          <div className="comment-text" style={post.deleted ? { color: 'var(--muted)', fontStyle: 'italic' } : undefined}>
            {post.deleted ? t('com.deleted') : post.body}
          </div>
          {post.translated && <div className="muted" style={{ fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>{t('com.autoTranslated')}</div>}

          {!post.deleted && (
            <div className="comment-footer">
              <div className="vote-inline">
                <button type="button" className={`up${post.myVote === 1 ? ' on' : ''}`} aria-label="Upvote" aria-pressed={post.myVote === 1} onClick={setVote(1)} disabled={readOnly}>
                  <ChevronUp size={16} strokeWidth={2.4} />
                </button>
                <span className="vote-score">{post.score}</span>
                <button type="button" className={`down${post.myVote === -1 ? ' on' : ''}`} aria-label="Downvote" aria-pressed={post.myVote === -1} onClick={setVote(-1)} disabled={readOnly}>
                  <ChevronDown size={16} strokeWidth={2.4} />
                </button>
              </div>
              {onReply && (
                <button className="comment-action" onClick={() => onReply(post)}><CornerDownRight size={13} /> {t('com.reply')}</button>
              )}
              {!readOnly && (
                <button className="comment-action" onClick={() => onReport?.(post)}><Flag size={13} /> {t('com.report')}</button>
              )}
              {post.canModerate && (
                <button className="comment-action danger" onClick={() => onDelete?.(post)}><Trash2 size={13} /> {t('common.delete')}</button>
              )}
            </div>
          )}

          {replyCount > 0 && (
            <div className="comment-children">
              {childPosts.map((c) => (
                <PostItem key={c.id} post={c} readOnly={readOnly} onVote={onVote} onDelete={onDelete} onReport={onReport} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
