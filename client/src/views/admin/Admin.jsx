import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/apis/adminApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner, Card, EmptyState } from '@/components/ui/Ui';
import { fromNow } from '@/utils/format';

// Community moderation queue: reported threads/replies, with the reason(s) and
// remove / dismiss actions. Platform-admin only (the whole page is gated).
function ModerationQueue() {
  const { t, lang } = useT();
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: adminApi.reports });
  const [busyKey, setBusyKey] = useState('');
  const [err, setErr] = useState('');

  const resolve = async (r, action) => {
    const key = `${r.targetType}:${r.targetId}`;
    setBusyKey(key); setErr('');
    try {
      await adminApi.resolveReport({ targetType: r.targetType, targetId: r.targetId, action });
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['threads'] });
      if (r.threadId) qc.invalidateQueries({ queryKey: ['thread', r.threadId] });
    } catch (e) { setErr(e.message); } finally { setBusyKey(''); }
  };

  return (
    <Card title={t('adm.mod.title')} variant="ruled" data-testid="moderation-queue" style={{ marginBottom: 18 }}>
      <p className="muted small" style={{ margin: '0 0 12px' }}>{t('adm.mod.sub')}</p>
      {err && <Banner kind="error">{err}</Banner>}
      {isLoading ? (
        <p className="muted small">{t('adm.mod.loading')}</p>
      ) : reports.length === 0 ? (
        <EmptyState icon="🛡️" title={t('adm.mod.emptyTitle')}>{t('adm.mod.emptyBody')}</EmptyState>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {reports.map((r) => {
            const key = `${r.targetType}:${r.targetId}`;
            return (
              <div key={key} className="report-row" data-testid="report-row">
                <div className="row" style={{ gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="tag-pill">{t(r.targetType === 'thread' ? 'adm.mod.thread' : 'adm.mod.reply')}</span>
                  <span className="report-count" data-testid="report-count">
                    {r.count} {r.count === 1 ? t('adm.mod.report') : t('adm.mod.reports')}
                  </span>
                  {r.deleted && <span className="tag-pill" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>{t('adm.mod.removed')}</span>}
                </div>

                <div className="report-content">
                  {!r.exists
                    ? <em className="muted">{t('adm.mod.gone')}</em>
                    : (r.content || <em className="muted">{t('adm.mod.noText')}</em>)}
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  {t('adm.mod.by')} {r.author?.fullName || t('adm.mod.someone')}{r.author?.company ? `, ${r.author.company}` : ''}
                </div>

                <ul className="report-reasons">
                  {r.reports.map((rep) => (
                    <li key={rep.id} className="small">
                      “{rep.reason}” <span className="muted">— {rep.reporter?.fullName || t('adm.mod.someone')} · {fromNow(rep.createdAt, lang)}</span>
                    </li>
                  ))}
                </ul>

                <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {r.threadId && (
                    <Link className="btn btn-outline btn-sm" to={`/community/${r.threadId}`} data-testid="report-open">{t('adm.mod.open')}</Link>
                  )}
                  {r.exists && !r.deleted && (
                    <button className="btn btn-danger btn-sm" data-testid="report-remove" disabled={busyKey === key} onClick={() => resolve(r, 'remove')}>
                      {t('adm.mod.delete')}
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" data-testid="report-dismiss" disabled={busyKey === key} onClick={() => resolve(r, 'dismiss')}>
                    {t('adm.mod.dismiss')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const { t } = useT();
  const qc = useQueryClient();
  const { data: counts } = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview, enabled: isAdmin });
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { tier: 2, jurisdiction: 'DE', status: 'published' } });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isAdmin) {
    return <Card><EmptyState icon="⛭" title={t('adm.onlyTitle')}>{t('adm.onlyBody')}</EmptyState></Card>;
  }

  const onSubmit = async (data) => {
    setError(''); setResult(null);
    try {
      const framework = await adminApi.createFramework({ ...data, tier: Number(data.tier) });
      // Add a starter checklist template with two items, so it works end to end immediately.
      await adminApi.createTemplate(framework.key, {
        key: `${framework.key}_baseline`,
        name: `${framework.shortName || framework.name} Baseline`,
        description: 'Starter checklist created with the framework. Edit items as needed.',
        appliesToRiskCategory: null,
        status: 'published',
        items: [
          { title: 'Confirm this law applies to your organisation', inputType: 'longtext', isRequired: true, sortOrder: 0,
            guidanceText: 'Document whether and how this law applies to your AI use.' },
          { title: 'Record your compliance measures', inputType: 'longtext', isRequired: false, sortOrder: 1,
            guidanceText: 'Describe the steps you take to comply with this law.' },
        ],
      });
      setResult(framework);
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      qc.invalidateQueries({ queryKey: ['frameworks'] });
      qc.invalidateQueries({ queryKey: ['laws'] });
      reset({ tier: 2, jurisdiction: 'DE', status: 'published' });
    } catch (err) { setError(err.message); }
  };

  return (
    <div data-testid="admin" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">{t('adm.eyebrow')}</div>
          <h1>{t('adm.title')}</h1>
          <p className="sub">{t('adm.sub')}</p>
        </div>
      </div>

      {counts && (
        <div className="grid grid-4" style={{ marginBottom: 18 }}>
          {[[t('adm.frameworks'), counts.frameworks], [t('adm.requirements'), counts.requirements], [t('adm.templates'), counts.templates], [t('adm.items'), counts.items]].map(([l, n]) => (
            <div key={l} className="card stat"><div className="num">{n}</div><div className="label">{l}</div></div>
          ))}
        </div>
      )}

      <ModerationQueue />

      {error && <Banner kind="error">{error}</Banner>}
      {result && (
        <Banner kind="success" >
          {t('adm.added')} <strong>{result.name}</strong> {t('adm.withStarter')}{' '}
          <Link to="/law-explorer">{t('adm.lawExplorer')}</Link> {t('adm.orOpenIts')} <Link to={`/frameworks/${result.key}`} data-testid="result-framework-link">{t('adm.frameworkPage')}</Link>.
        </Banner>
      )}

      <Card title={t('adm.formTitle')} variant="ruled-gold">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">{t('adm.key')}</label>
              <input className="input" data-testid="fw-key" placeholder="bafin_ki" {...register('key', { required: t('adm.keyRequired') })} />
              {errors.key && <div className="error-text">{errors.key.message}</div>}
            </div>
            <div className="field">
              <label className="label">{t('adm.tier')}</label>
              <select className="select" data-testid="fw-tier" {...register('tier')}>
                <option value={1}>{t('adm.tier1')}</option>
                <option value={2}>{t('adm.tier2')}</option>
                <option value={3}>{t('adm.tier3')}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">{t('adm.name')}</label>
            <input className="input" data-testid="fw-name" placeholder="BaFin AI Supervision" {...register('name', { required: t('adm.nameRequired') })} />
            {errors.name && <div className="error-text">{errors.name.message}</div>}
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">{t('adm.shortName')}</label>
              <input className="input" data-testid="fw-shortName" placeholder="BaFin" {...register('shortName')} />
            </div>
            <div className="field">
              <label className="label">{t('adm.reference')}</label>
              <input className="input" placeholder="BaFin guidance 2021" {...register('reference')} />
            </div>
          </div>
          <div className="field">
            <label className="label">{t('adm.plainDesc')}</label>
            <textarea className="textarea" data-testid="fw-desc" {...register('shortDescription')} />
          </div>
          <div className="field">
            <label className="label">{t('adm.whoComply')}</label>
            <input className="input" {...register('appliesTo')} />
          </div>
          <div className="field">
            <label className="label">{t('adm.regulator')}</label>
            <input className="input" placeholder="BaFin" {...register('regulator')} />
          </div>
          <button className="btn btn-primary" type="submit" data-testid="create-framework">{t('adm.submit')}</button>
        </form>
      </Card>
    </div>
  );
}
