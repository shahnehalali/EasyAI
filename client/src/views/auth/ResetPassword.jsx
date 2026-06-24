import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useT } from '@/hooks/useT';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function ResetPassword() {
  const { t } = useT();
  const [params] = useSearchParams();
  const token = params.get('token');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    setError('');
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('auth.newPasswordTitle')}</h2>
      {error && <Banner kind="error">{error}</Banner>}
      {done ? (
        <>
          <Banner kind="success">{t('auth.passwordUpdated')}</Banner>
          <Link className="btn btn-primary btn-block" to="/login">{t('auth.signIn')}</Link>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <PasswordField
            label={t('auth.newPassword')}
            testId="password"
            showMeter
            value={password}
            error={errors.password?.message}
            field={register('password', { required: t('auth.passwordRequired'), minLength: { value: 8, message: t('auth.min8') } })}
          />
          <button className="btn btn-primary btn-block" type="submit" data-testid="submit">{t('auth.updatePassword')}</button>
        </form>
      )}
    </div>
  );
}
