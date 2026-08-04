import { useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { authApi } from '@/apis/authApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner, Card } from '@/components/ui/Ui';

// Personal two-factor authentication (TOTP). Self-service: any signed-in user can
// enable it on their own account, confirm with a code, save backup codes, and
// later disable it by re-entering their password.
export default function MfaCard() {
  const { t } = useT();
  const { user, loadSession } = useAuth();
  const enabled = !!user?.mfaEnabled;

  const [mode, setMode] = useState('idle'); // idle | setup | disable | backup
  const [setupData, setSetupData] = useState(null); // { qr, secret }
  const [backupCodes, setBackupCodes] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const startSetup = async () => {
    setError(''); setBusy(true);
    try { const d = await authApi.mfaSetup(); setSetupData(d); setMode('setup'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const confirmEnable = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const res = await authApi.mfaEnable(code.trim());
      setBackupCodes(res.backupCodes); setCode(''); setMode('backup');
      await loadSession();
    } catch (er) { setError(er.message); } finally { setBusy(false); }
  };

  const confirmDisable = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await authApi.mfaDisable(password);
      setPassword(''); setMode('idle');
      await loadSession();
    } catch (er) { setError(er.message); } finally { setBusy(false); }
  };

  const finishBackup = () => { setBackupCodes(null); setSetupData(null); setMode('idle'); };

  return (
    <Card title={t('mfa.cardTitle')} variant="ruled" data-testid="mfa-card">
      {error && <Banner kind="error">{error}</Banner>}

      {mode === 'backup' && backupCodes && (
        <div data-testid="mfa-backup-codes">
          <Banner kind="success">{t('mfa.enabledMsg')}</Banner>
          <p className="small">{t('mfa.backupIntro')}</p>
          <div className="mfa-codes">
            {backupCodes.map((c) => <code key={c} className="mfa-code">{c}</code>)}
          </div>
          <button className="btn btn-primary" data-testid="mfa-backup-done" onClick={finishBackup} style={{ marginTop: 14 }}>
            {t('mfa.backupDone')}
          </button>
        </div>
      )}

      {mode === 'setup' && setupData && (
        <form onSubmit={confirmEnable}>
          <p className="small" style={{ marginTop: 0 }}>{t('mfa.setupStep1')}</p>
          <p className="small muted" style={{ margin: '0 0 8px' }}>
            {t('mfa.getApp')}{' '}
            <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" rel="noreferrer">App Store</a>
            {' · '}
            <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer">Google Play</a>
          </p>
          <img src={setupData.qr} alt={t('mfa.qrAlt')} width={176} height={176} className="mfa-qr" />
          <p className="small muted">{t('mfa.setupManual')} <code className="mfa-secret">{setupData.secret}</code></p>
          <div className="field" style={{ maxWidth: 220 }}>
            <label className="label">{t('mfa.setupStep2')}</label>
            <input className="input" data-testid="mfa-setup-code" inputMode="numeric" autoComplete="one-time-code"
              placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary" type="submit" data-testid="mfa-enable-confirm" disabled={busy || code.trim().length < 6}>
              {busy ? t('mfa.enabling') : t('mfa.enableConfirm')}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => { setMode('idle'); setSetupData(null); setCode(''); setError(''); }}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {mode === 'disable' && (
        <form onSubmit={confirmDisable}>
          <p className="small" style={{ marginTop: 0 }}>{t('mfa.disableConfirmMsg')}</p>
          <div className="field" style={{ maxWidth: 280 }}>
            <label className="label">{t('mfa.passwordLabel')}</label>
            <input className="input" type="password" data-testid="mfa-disable-password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-danger" type="submit" data-testid="mfa-disable-confirm" disabled={busy || !password}>
              {busy ? t('mfa.disabling') : t('mfa.disableConfirm')}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => { setMode('idle'); setPassword(''); setError(''); }}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {mode === 'idle' && !backupCodes && (
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            {enabled ? <ShieldCheck size={18} style={{ color: 'var(--green)' }} /> : <ShieldOff size={18} style={{ color: 'var(--muted)' }} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{enabled ? t('mfa.statusOn') : t('mfa.statusOff')}</div>
              <div className="muted small">{enabled ? t('mfa.statusOnSub') : t('mfa.statusOffSub')}</div>
            </div>
          </div>
          {enabled ? (
            <button className="btn btn-outline btn-sm" data-testid="mfa-disable" onClick={() => { setMode('disable'); setError(''); }}>
              {t('mfa.disableBtn')}
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" data-testid="mfa-enable" onClick={startSetup} disabled={busy}>
              {busy ? t('mfa.loading') : t('mfa.enableBtn')}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
