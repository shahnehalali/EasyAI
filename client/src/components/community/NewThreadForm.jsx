import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { threadApi } from '@/apis/threadApi';
import { frameworkApi } from '@/apis/frameworkApi';
import { useT } from '@/hooks/useT';
import { Card, Banner } from '@/components/ui/Ui';

// Create a discussion. When `frameworkKey` is provided (e.g. the law page), the
// anchor is fixed and hidden; otherwise the user picks a law (or general).
export default function NewThreadForm({ frameworkKey, onCreated, onCancel }) {
  const { t } = useT();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('global');
  const [anchor, setAnchor] = useState(frameworkKey || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { data: frameworks = [] } = useQuery({
    queryKey: ['frameworks'], queryFn: frameworkApi.list, enabled: !frameworkKey,
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const thread = await threadApi.create({
        title: title.trim(),
        body: body.trim(),
        visibility,
        frameworkKey: (frameworkKey || anchor) || null,
      });
      onCreated?.(thread);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Card variant="ruled-gold">
      <form onSubmit={submit}>
        {error && <Banner kind="error">{error}</Banner>}
        <div className="field">
          <label className="label">{t('com.form.title')}</label>
          <input className="input" data-testid="thread-title" value={title} maxLength={160}
            placeholder={t('com.form.titlePh')} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">{t('com.form.body')}</label>
          <textarea className="textarea" data-testid="thread-body" value={body} rows={5}
            placeholder={t('com.form.bodyPh')} onChange={(e) => setBody(e.target.value)} required />
        </div>

        {!frameworkKey && (
          <div className="field">
            <label className="label">{t('com.form.anchor')}</label>
            <select className="select" value={anchor} onChange={(e) => setAnchor(e.target.value)}>
              <option value="">{t('com.form.anchorNone')}</option>
              {frameworks.map((f) => <option key={f.key} value={f.key}>{f.shortName || f.name}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <label className="label">{t('com.form.visibility')}</label>
          <div className="stack" style={{ gap: 6 }}>
            <label className="row" style={{ gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="radio" name="vis" checked={visibility === 'global'} onChange={() => setVisibility('global')} />
              <span><strong>{t('com.visGlobal')}</strong><div className="muted small">{t('com.form.visGlobalHint')}</div></span>
            </label>
            <label className="row" style={{ gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="radio" name="vis" checked={visibility === 'org'} onChange={() => setVisibility('org')} />
              <span><strong>{t('com.visOrg')}</strong><div className="muted small">{t('com.form.visOrgHint')}</div></span>
            </label>
          </div>
        </div>

        <p className="muted small" style={{ marginTop: 0 }}>{t('com.identityNote')}</p>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-primary" type="submit" data-testid="thread-submit" disabled={busy || !title.trim() || !body.trim()}>
            {busy ? t('com.form.posting') : t('com.form.submit')}
          </button>
          {onCancel && <button className="btn btn-outline" type="button" onClick={onCancel}>{t('common.cancel')}</button>}
        </div>
      </form>
    </Card>
  );
}
