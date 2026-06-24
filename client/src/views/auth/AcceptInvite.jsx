import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { invitationApi } from '@/apis/invitationApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner, Spinner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function AcceptInvite() {
  const { t } = useT();
  const [params] = useSearchParams();
  const token = params.get('token');
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const [state, setState] = useState('loading'); // loading | ready | invalid
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    invitationApi.lookup(token)
      .then((i) => { setInvite(i); setState('ready'); })
      .catch((err) => { setError(err.message); setState('invalid'); });
  }, [token]);

  const onSubmit = async (data) => {
    setError(''); setBusy(true);
    try {
      const res = await invitationApi.accept({ token, fullName: data.fullName, password: data.password });
      setUser(res.user);
      navigate('/', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (state === 'loading') return <Spinner label={t('auth.checkingInvite')} />;

  if (state === 'invalid') {
    return (
      <div data-testid="accept-invite">
        <h2 style={{ marginBottom: 16 }}>{t('auth.invitationTitle')}</h2>
        <Banner kind="error" data-testid="invite-invalid">{error || t('auth.inviteInvalid')}</Banner>
        <Link className="btn btn-outline btn-block" to="/login">{t('auth.backToSignIn')}</Link>
      </div>
    );
  }

  return (
    <div data-testid="accept-invite">
      <h2 style={{ marginBottom: 6 }}>{t('auth.joinTitle')} {invite.organizationName}</h2>
      <p className="muted small" style={{ marginBottom: 18 }}>
        {t('auth.invitedAs')} <strong>{invite.role}</strong> {t('auth.using')} <strong>{invite.email}</strong>. {t('auth.setNamePassword')}
      </p>
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="acc-name">{t('auth.fullName')}</label>
          <input id="acc-name" className="input" data-testid="fullName" {...register('fullName', { required: t('auth.nameRequired') })} />
          {errors.fullName && <div className="error-text">{errors.fullName.message}</div>}
        </div>
        <PasswordField
          label={t('auth.password')}
          testId="password"
          showMeter
          value={password}
          error={errors.password?.message}
          field={register('password', { required: t('auth.passwordRequired'), minLength: { value: 8, message: t('auth.min8') } })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? t('auth.joining') : t('auth.join')}
        </button>
      </form>
    </div>
  );
}
