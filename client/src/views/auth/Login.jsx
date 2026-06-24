import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function Login() {
  const { t } = useT();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (data) => {
    setError(''); setNeedsVerify(false); setResent(false); setBusy(true);
    try {
      const res = await authApi.login(data);
      setUser(res.user);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.status === 403 || /verify/i.test(err.message)) setNeedsVerify(true);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    await authApi.resendVerification(getValues('email'));
    setResent(true);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('auth.signIn')}</h2>
      {error && <Banner kind="error">{error}</Banner>}
      {needsVerify && !resent && (
        <Banner kind="warn">
          {t('auth.notVerified')}{' '}
          <button className="btn btn-ghost btn-sm" data-testid="resend-verification" onClick={resend} style={{ padding: '2px 6px' }}>
            {t('auth.resend')}
          </button>
        </Banner>
      )}
      {resent && <Banner kind="success" data-testid="resend-done">{t('auth.resentDone')}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="login-email">{t('auth.email')}</label>
          <input id="login-email" className="input" type="email" data-testid="email" autoComplete="email"
            {...register('email', { required: t('auth.emailRequired') })} />
          {errors.email && <div className="error-text">{errors.email.message}</div>}
        </div>
        <PasswordField
          label={t('auth.password')}
          testId="password"
          autoComplete="current-password"
          error={errors.password?.message}
          field={register('password', { required: t('auth.passwordRequired') })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>
      <div className="row-between" style={{ marginTop: 16 }}>
        <Link className="small" to="/forgot-password">{t('auth.forgot')}</Link>
        <Link className="small" to="/register">{t('auth.createAccountLink')}</Link>
      </div>
    </div>
  );
}
