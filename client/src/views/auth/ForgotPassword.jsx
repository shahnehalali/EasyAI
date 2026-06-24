import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useT } from '@/hooks/useT';
import { Banner } from '@/components/ui/Ui';

export default function ForgotPassword() {
  const { t } = useT();
  const { register, handleSubmit } = useForm();
  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    await authApi.forgotPassword(data.email);
    setDone(true);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('auth.resetTitle')}</h2>
      {done ? (
        <Banner kind="success">{t('auth.resetSent')}</Banner>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="label">{t('auth.email')}</label>
            <input className="input" type="email" data-testid="email" {...register('email', { required: true })} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" data-testid="submit">{t('auth.sendResetLink')}</button>
        </form>
      )}
      <div className="row" style={{ marginTop: 16, justifyContent: 'center' }}>
        <Link className="small" to="/login">{t('auth.backToSignIn')}</Link>
      </div>
    </div>
  );
}
