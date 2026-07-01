import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { checklistResponseApi } from '@/apis/checklistResponseApi';
import { documentApi } from '@/apis/documentApi';
import { commentApi } from '@/apis/commentApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { StatusChip, SeverityChip } from '@/components/ui/Ui';
import { statusLabel, STATUS_BTN_COLOR, bytes, fromNow, initials } from '@/utils/format';

const STATUSES = ['not_started', 'in_progress', 'done', 'not_applicable'];

export default function ChecklistItem({ response, members = [], onChanged }) {
  const item = response.templateItem;
  const { user, can } = useAuth();
  const canEdit = can('compliance.edit');
  const { t, lang } = useT();
  const [status, setStatus] = useState(response.status);
  const [text, setText] = useState(response.responseText || '');
  const [assigneeId, setAssigneeId] = useState(response.assignee?.id || '');
  const [docs, setDocs] = useState(response.documents || []);
  const [comments, setComments] = useState(response.comments || []);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = status !== response.status || text !== (response.responseText || '');

  const persist = async (nextStatus, nextText) => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await checklistResponseApi.update(response.id, { status: nextStatus, responseText: nextText });
      response.status = nextStatus;
      response.responseText = nextText;
      setSaved(true);
      onChanged?.(res.assessmentProgress);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const pickStatus = (s) => { setStatus(s); persist(s, text); };
  const blurText = () => { if (text !== (response.responseText || '')) persist(status, text); };
  const saveNow = () => persist(status, text);

  const assign = async (id) => {
    setAssigneeId(id); setError('');
    try {
      const res = await checklistResponseApi.update(response.id, { assigneeId: id || null });
      response.assignee = res.response.assignee;
    } catch (err) { setError(err.message); }
  };

  const attach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const doc = await documentApi.upload(file, { checklistItemResponseId: response.id, assessmentId: response.assessmentId });
      setDocs((d) => [...d, doc]);
    } catch (err) { setError(err.message); }
    e.target.value = '';
  };

  const removeDoc = async (doc) => {
    if (!window.confirm(t('ci.removeDocConfirm').replace('{name}', doc.fileName))) return;
    setError('');
    try {
      await documentApi.remove(doc.id);
      setDocs((d) => d.filter((x) => x.id !== doc.id));
    } catch (err) { setError(err.message); }
  };

  const addComment = async () => {
    if (!draft.trim()) return;
    try {
      const c = await commentApi.create({ assessmentId: response.assessmentId, checklistItemResponseId: response.id, body: draft.trim() });
      setComments((cur) => [...cur, c]);
      setDraft('');
    } catch (err) { setError(err.message); }
  };

  const removeComment = async (id) => {
    await commentApi.remove(id);
    setComments((cur) => cur.filter((c) => c.id !== id));
  };

  return (
    <div className="card" data-testid="checklist-item" style={{ marginBottom: 14 }}>
      <div className="card-body">
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <strong>{item.title}</strong>
              {item.isRequired && <span className="tag-pill" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>{t('ci.required')}</span>}
              {item.requirement && <SeverityChip severity={item.requirement.severity} />}
            </div>
            {item.guidanceText && <p className="muted small" style={{ margin: 0 }}>{item.guidanceText}</p>}
            {item.requirement?.lawReferenceUrl && (
              <a className="small" href={item.requirement.lawReferenceUrl} target="_blank" rel="noreferrer">
                {item.requirement.lawReferenceLabel || item.requirement.code} {t('ci.opensNewTab')}
              </a>
            )}
          </div>
          <StatusChip status={status} />
        </div>

        {canEdit && (
          <div className="row" role="group" aria-label={`Status for ${item.title}`} style={{ gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
            {STATUSES.map((s) => {
              const active = status === s;
              const color = STATUS_BTN_COLOR[s] || 'var(--accent)';
              return (
                <button key={s} data-testid={`status-${s}`} onClick={() => pickStatus(s)} aria-pressed={active}
                  className="btn btn-sm" style={{
                    background: active ? color : 'var(--surface)', color: active ? '#fff' : 'var(--ink)',
                    border: `1px solid ${active ? color : 'var(--border)'}`,
                  }}>
                  {statusLabel(s, lang)}
                </button>
              );
            })}
          </div>
        )}

        {item.inputType !== 'none' && item.inputType !== 'boolean' && (
          canEdit ? (
            <textarea className="textarea" data-testid="response-text" aria-label={`Documentation for ${item.title}`}
              placeholder={t('ci.responsePlaceholder')}
              value={text} onChange={(e) => setText(e.target.value)} onBlur={blurText} />
          ) : (
            text ? <p className="small" style={{ whiteSpace: 'pre-wrap', margin: '10px 0 0' }}>{text}</p> : null
          )
        )}

        {docs.length > 0 && (
          <div className="stack" style={{ gap: 4, marginTop: 8 }}>
            {docs.map((d) => (
              <div key={d.id} className="row" data-testid="attached-document" style={{ gap: 6, fontSize: 12.5 }}>
                <FileText size={13} aria-hidden="true" style={{ color: 'var(--muted)' }} />
                <a href={documentApi.downloadUrl(d.id)} target="_blank" rel="noreferrer">{d.fileName}</a>
                <span className="muted">{bytes(d.sizeBytes)}</span>
                {canEdit && (
                  <button
                    className="btn btn-ghost btn-sm"
                    data-testid="remove-document"
                    aria-label={`Remove ${d.fileName}`}
                    title={t('ci.removeDocument')}
                    onClick={() => removeDoc(d)}
                    style={{ padding: '2px 6px', color: 'var(--red)', lineHeight: 1 }}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}

        {canEdit && (
          <div className="row" style={{ gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" data-testid="save-item" onClick={saveNow} disabled={saving}>
              {saving ? t('ci.saving') : t('ci.save')}
            </button>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              {t('ci.attachDocument')}
              <input type="file" data-testid="attach-file" onChange={attach} style={{ display: 'none' }} aria-label={`${t('ci.attachDocument')} - ${item.title}`} />
            </label>
            <label className="row small" style={{ gap: 6 }}>
              <span className="muted">{t('ci.assignee')}</span>
              <select className="select" data-testid="assignee-select" style={{ width: 160, padding: '5px 8px' }}
                value={assigneeId} onChange={(e) => assign(e.target.value)} aria-label={`${t('ci.assignee')} - ${item.title}`}>
                <option value="">{t('ci.unassigned')}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
              </select>
            </label>
            <span className="small muted" aria-live="polite" style={{ minWidth: 90 }}>
              {saving ? t('ci.saving') : saved ? <span style={{ color: 'var(--green)' }} data-testid="saved-flag">{t('ci.saved')} ✓</span> : dirty ? t('ci.unsavedChanges') : t('ci.savedAutomatically')}
            </span>
          </div>
        )}

        {/* Comments thread */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border-2)', paddingTop: 12 }}>
          {comments.length > 0 && (
            <div className="stack" style={{ gap: 8, marginBottom: 10 }}>
              {comments.map((c) => (
                <div key={c.id} data-testid="comment-item" className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <span className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{initials(c.author?.fullName || '?')}</span>
                  <div style={{ flex: 1 }}>
                    <div className="small"><strong>{c.author?.fullName || t('ci.someone')}</strong> <span className="muted">{fromNow(c.createdAt, lang)}</span></div>
                    <div className="small">{c.body}</div>
                  </div>
                  {(c.author?.id === user?.id) && (
                    <button className="btn btn-ghost btn-sm" aria-label={t('ci.deleteComment')} onClick={() => removeComment(c.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {canEdit && (
            <div className="row" style={{ gap: 8 }}>
              <input className="input" data-testid="comment-input" placeholder={t('ci.commentPlaceholder')}
                value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addComment(); } }} />
              <button className="btn btn-outline btn-sm" data-testid="add-comment" onClick={addComment} disabled={!draft.trim()}>{t('ci.comment')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
