import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useT } from '@/hooks/useT';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function Register() {
  const { t } = useT();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (data) => {
    setError(''); setBusy(true);
    try {
      await authApi.register(data);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div>
        <h2 style={{ marginBottom: 12 }}>{t('auth.checkEmail')}</h2>
        <Banner kind="success" data-testid="register-success">
          {t('auth.registerSuccess')}
        </Banner>
        <Link className="btn btn-outline btn-block" to="/login" style={{ marginTop: 8 }}>{t('auth.backToSignIn')}</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('auth.createYourAccount')}</h2>
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label">{t('auth.fullName')}</label>
          <input className="input" data-testid="fullName" {...register('fullName', { required: t('auth.nameRequired') })} />
          {errors.fullName && <div className="error-text">{errors.fullName.message}</div>}
        </div>
        <div className="field">
          <label className="label">{t('auth.companyName')}</label>
          <input className="input" data-testid="organizationName" placeholder={t('auth.companyPlaceholder')} {...register('organizationName')} />
        </div>
        <div className="field">
          <label className="label">{t('auth.email')}</label>
          <input className="input" type="email" data-testid="email" {...register('email', { required: t('auth.emailRequired') })} />
          {errors.email && <div className="error-text">{errors.email.message}</div>}
        </div>
        <PasswordField
          label={t('auth.password')}
          testId="password"
          showMeter
          value={password}
          hint={t('auth.passwordHint')}
          error={errors.password?.message}
          field={register('password', { required: t('auth.passwordRequired'), minLength: { value: 8, message: t('auth.min8') } })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? t('auth.creating') : t('auth.create')}
        </button>
      </form>
      <div className="row" style={{ marginTop: 16, justifyContent: 'center', gap: 5 }}>
        <span className="small muted">{t('auth.alreadyHave')}</span>
        <Link className="small" to="/login">{t('auth.signIn')}</Link>
      </div>
    </div>
  );
}
