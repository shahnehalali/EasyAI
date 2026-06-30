import { useState } from 'react';
import { Trash2, Flag, CornerDownRight } from 'lucide-react';
import { useT } from '@/hooks/useT';
import VoteControl from './VoteControl';
import AuthorLine from './AuthorLine';

// A single reply. `onReply` is only passed for top-level posts (one nesting level).
export default function PostItem({ post, onVote, onDelete, onReport, onReply, indent = false }) {
  const { t, lang } = useT();
  return (
    <div className="card" data-testid="post-item" style={indent ? { marginLeft: 28, borderLeft: '2px solid var(--border-2)' } : undefined}>
      <div className="card-body row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <VoteControl score={post.score} myVote={post.myVote} onVote={(v) => onVote?.(post, v)} disabled={post.deleted} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <AuthorLine author={post.author} createdAt={post.createdAt} lang={lang} />
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', color: post.deleted ? 'var(--muted)' : 'var(--ink)' }}>
            {post.deleted ? t('com.deleted') : post.body}
          </div>
          {!post.deleted && (
            <div className="row" style={{ gap: 12, marginTop: 8 }}>
              {onReply && (
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 4px', color: 'var(--muted)' }} onClick={() => onReply(post)}>
                  <CornerDownRight size={13} /> {t('com.reply')}
                </button>
              )}
              {post.canModerate && (
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 4px', color: 'var(--red)' }} onClick={() => onDelete?.(post)}>
                  <Trash2 size={13} />
                </button>
              )}
              <button className="btn btn-ghost btn-sm" style={{ padding: '2px 4px', color: 'var(--muted)' }} onClick={() => onReport?.(post)}>
                <Flag size={13} /> {t('com.report')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
