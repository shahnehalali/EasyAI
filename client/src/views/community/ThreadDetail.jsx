import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Trash2, Flag } from 'lucide-react';
import { threadApi } from '@/apis/threadApi';
import { useT } from '@/hooks/useT';
import { SkeletonPage, ErrorState, Card, Chip, Banner } from '@/components/ui/Ui';
import VoteControl from '@/components/community/VoteControl';
import AuthorLine from '@/components/community/AuthorLine';
import PostItem from '@/components/community/PostItem';
import BackLink from '@/components/BackLink';

export default function ThreadDetail() {
  const { id } = useParams();
  const { t, lang } = useT();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');
  const [replyTo, setReplyTo] = useState(null); // a top-level post being replied to
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const key = ['thread', id, lang];
  const { data, isLoading, error: loadError, refetch } = useQuery({ queryKey: key, queryFn: () => threadApi.get(id) });

  // Group posts into top-level + their children (one nesting level).
  const grouped = useMemo(() => {
    const posts = data?.posts || [];
    const tops = posts.filter((p) => !p.parentPostId);
    const childrenOf = (pid) => posts.filter((p) => p.parentPostId === pid);
    return tops.map((p) => ({ post: p, children: childrenOf(p.id) }));
  }, [data]);

  if (isLoading) return <SkeletonPage rows={4} />;
  if (loadError) return <ErrorState error={loadError} onRetry={refetch} />;

  const { thread } = data;

  const refresh = () => qc.invalidateQueries({ queryKey: ['thread', id] });

  const voteThread = async (value) => {
    const res = await threadApi.voteThread(thread.id, value);
    qc.setQueryData(key, (cur) => (cur ? { ...cur, thread: { ...cur.thread, score: res.score, myVote: res.myVote } } : cur));
  };
  const votePost = async (post, value) => {
    const res = await threadApi.votePost(post.id, value);
    qc.setQueryData(key, (cur) => cur && ({
      ...cur,
      posts: cur.posts.map((p) => (p.id === post.id ? { ...p, score: res.score, myVote: res.myVote } : p)),
    }));
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true); setError('');
    try {
      await threadApi.reply(thread.id, { body: reply.trim(), parentPostId: replyTo?.id || null });
      setReply(''); setReplyTo(null);
      refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const deletePost = async (post) => {
    if (!window.confirm(t('com.confirmDeletePost'))) return;
    await threadApi.removePost(post.id); refresh();
  };
  const reportTarget = async (targetType, targetId) => {
    const reason = window.prompt(t('com.reportPrompt'));
    if (!reason) return;
    await threadApi.report({ targetType, targetId, reason });
  };
  const toggleLock = async () => { await threadApi.lock(thread.id); refresh(); };
  const deleteThread = async () => {
    if (!window.confirm(t('com.confirmDelete'))) return;
    await threadApi.remove(thread.id);
    navigate('/community');
  };

  return (
    <div data-testid="thread-detail" style={{ maxWidth: 820 }}>
      <BackLink to="/community">{t('com.back')}</BackLink>

      <Card variant="ruled" data-testid="thread-head">
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <VoteControl score={thread.score} myVote={thread.myVote} onVote={voteThread} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <Chip className={thread.visibility === 'global' ? 'chip-navy' : 'chip-grey'} dot={false}>
                {thread.visibility === 'global' ? t('com.visGlobal') : t('com.visOrg')}
              </Chip>
              {thread.frameworkName && (
                <Link to={thread.frameworkKey ? `/frameworks/${thread.frameworkKey}` : '#'}>
                  <Chip className="chip-grey" dot={false}>{thread.frameworkName}</Chip>
                </Link>
              )}
              {thread.status === 'locked' && <Chip className="chip-grey" dot={false}><Lock size={11} /> {t('com.locked')}</Chip>}
            </div>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>{thread.title}</h1>
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: 10 }}>{thread.deleted ? t('com.deleted') : thread.body}</div>
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
              <AuthorLine author={thread.author} createdAt={thread.createdAt} lang={lang} />
              <div className="row" style={{ gap: 10 }}>
                {thread.canModerate && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--muted)' }} onClick={toggleLock}>
                    {thread.status === 'locked' ? <><Unlock size={13} /> {t('com.unlock')}</> : <><Lock size={13} /> {t('com.lock')}</>}
                  </button>
                )}
                {thread.canModerate && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={deleteThread}><Trash2 size={13} /></button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--muted)' }} onClick={() => reportTarget('thread', thread.id)}>
                  <Flag size={13} /> {t('com.report')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <p className="muted small" style={{ margin: '10px 2px 16px' }}>{t('com.disclaimer')}</p>

      {/* Reply composer */}
      {thread.status === 'locked' ? (
        <Banner kind="info">{t('com.lockedNotice')}</Banner>
      ) : (
        <form onSubmit={submitReply} style={{ marginBottom: 18 }}>
          {error && <Banner kind="error">{error}</Banner>}
          {replyTo && (
            <div className="muted small" style={{ marginBottom: 4 }}>
              {t('com.reply')} → {replyTo.author?.fullName} <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          <textarea className="textarea" data-testid="reply-input" value={reply} rows={3}
            placeholder={t('com.replyPh')} onChange={(e) => setReply(e.target.value)} />
          <button className="btn btn-primary btn-sm" data-testid="reply-submit" type="submit" disabled={busy || !reply.trim()} style={{ marginTop: 8 }}>
            {busy ? t('com.replying') : t('com.reply')}
          </button>
        </form>
      )}

      {/* Replies */}
      <div className="comment-list" data-testid="post-thread">
        {grouped.map(({ post, children }) => (
          <PostItem
            key={post.id}
            post={post}
            childPosts={children}
            onVote={votePost}
            onDelete={deletePost}
            onReport={(p) => reportTarget('post', p.id)}
            onReply={thread.status === 'locked' ? undefined : (p) => { setReplyTo(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        ))}
      </div>
    </div>
  );
}
