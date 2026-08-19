import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { privacyApi } from '@/apis/privacyApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner, Card } from '@/components/ui/Ui';

// Data-subject rights, self-service (GDPR Art. 12 requires them to be
// exercisable without friction, not only on written request):
//   - Art. 15 / 20  download everything held about the account
//   - Art. 17       delete the account, or the whole organisation
// Both deletions ask for the password, because a hijacked session must not be
// able to destroy a tenant's compliance record.
export default function PrivacyCard() {
  const { t } = useT();
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner';

  const [mode, setMode] = useState('idle'); // idle | account | organization
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setError(''); setBusy(true);
    try {
      const blob = await privacyApi.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${user?.id || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const confirmDelete = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'organization') await privacyApi.deleteOrganization(password);
      else await privacyApi.deleteAccount(password);
      setPassword('');
      // The session cookie is already cleared server-side; drop local state too.
      await logout();
    } catch (er) { setError(er.message); setBusy(false); }
  };

  const cancel = () => { setMode('idle'); setPassword(''); setError(''); };

  return (
    <Card title={t('set.privacyTitle')} variant="ruled">
      {error && <Banner kind="error">{error}</Banner>}

      <p className="small muted">{t('set.privacyIntro')}</p>

      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button className="btn btn-outline" onClick={download} disabled={busy} data-testid="privacy-export">
          <Download size={14} /> {t('set.privacyExport')}
        </button>
        {mode === 'idle' && (
          <>
            <button className="btn btn-outline btn-danger" onClick={() => setMode('account')} disabled={busy} data-testid="privacy-delete-account">
              <Trash2 size={14} /> {t('set.privacyDeleteAccount')}
            </button>
            {isOwner && (
              <button className="btn btn-outline btn-danger" onClick={() => setMode('organization')} disabled={busy} data-testid="privacy-delete-org">
                <Trash2 size={14} /> {t('set.privacyDeleteOrg')}
              </button>
            )}
          </>
        )}
      </div>

      {mode !== 'idle' && (
        <form onSubmit={confirmDelete} style={{ marginTop: 12 }} data-testid="privacy-confirm-form">
          <Banner kind="error">
            {mode === 'organization' ? t('set.privacyDeleteOrgWarn') : t('set.privacyDeleteAccountWarn')}
          </Banner>
          <label className="small" htmlFor="privacy-password">{t('set.privacyConfirmPassword')}</label>
          <input
            id="privacy-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="privacy-password"
          />
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <button className="btn btn-danger" type="submit" disabled={busy} data-testid="privacy-confirm">
              {busy ? t('set.privacyDeleting') : t('set.privacyConfirmDelete')}
            </button>
            <button className="btn btn-outline" type="button" onClick={cancel} disabled={busy}>
              {t('set.privacyCancel')}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
