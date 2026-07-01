import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { threadApi } from '@/apis/threadApi';
import { useT } from '@/hooks/useT';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonPage, ErrorState, EmptyState } from '@/components/ui/Ui';
import ThreadList from './ThreadList';
import NewThreadForm from './NewThreadForm';

const SORTS = ['hot', 'new', 'top'];
const SCOPES = ['all', 'global', 'org'];

// Reusable discussion block. With `frameworkKey` it scopes to one law (used on
// the framework page); without it, it shows the whole community.
export default function DiscussionTab({ frameworkKey, compact = false }) {
  const { t, lang } = useT();
  const { can } = useAuth();
  const canWrite = can('compliance.edit');
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [sort, setSort] = useState('hot');
  const [scope, setScope] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  // Debounce the search box so we query ~300ms after the user stops typing.
  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const params = { sort, scope, lang, ...(q ? { q } : {}), ...(frameworkKey ? { frameworkKey } : {}) };
  const key = ['threads', params];
  const { data: threads = [], isLoading, error, refetch } = useQuery({
    queryKey: key, queryFn: () => threadApi.list(params),
  });

  const onVote = async (thread, value) => {
    if (!canWrite) return;
    const res = await threadApi.voteThread(thread.id, value);
    qc.setQueryData(key, (cur = []) => cur.map((th) => (th.id === thread.id ? { ...th, score: res.score, myVote: res.myVote } : th)));
  };

  const onCreated = (thread) => {
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ['threads'] });
    navigate(`/community/${thread.id}`);
  };

  const pill = (val, cur, set, label) => (
    <button key={val} className={`btn btn-sm ${cur === val ? 'btn-primary' : 'btn-outline'}`} onClick={() => set(val)}>{label}</button>
  );

  return (
    <div>
      <div className="row" style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input
          className="input"
          data-testid="thread-search"
          value={search}
          placeholder={t('com.searchPh')}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 32, paddingRight: 32 }}
        />
        {search && (
          <button type="button" className="btn btn-ghost btn-sm" aria-label={t('common.cancel')} onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 2, color: 'var(--muted)' }}>
            <X size={15} />
          </button>
        )}
      </div>

      <div className="row-between community-controls" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div className="filter-row">
          {SORTS.map((s) => pill(s, sort, setSort, t(`com.sort.${s}`)))}
          <span className="filter-sep" />
          {SCOPES.map((s) => pill(s, scope, setScope, t(`com.scope.${s}`)))}
        </div>
        {canWrite && (
          <button className="btn btn-gold btn-sm" data-testid="new-thread" onClick={() => setShowForm((v) => !v)}>
            <Plus size={15} /> {frameworkKey ? t('com.start') : t('com.new')}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: 16 }}>
          <NewThreadForm frameworkKey={frameworkKey} onCreated={onCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? <SkeletonPage rows={3} />
        : error ? <ErrorState error={error} onRetry={refetch} />
          : threads.length === 0 ? (
            <div className="card"><EmptyState icon={q ? '🔍' : '💬'} title={q ? t('com.searchEmptyTitle') : t('com.empty.title')}>
              {q ? t('com.searchEmpty').replace('{q}', q) : frameworkKey ? t('com.emptyLaw') : t('com.empty.body')}
            </EmptyState></div>
          ) : (
            <ThreadList threads={threads} onVote={onVote} showFramework={!frameworkKey} />
          )}
    </div>
  );
}
