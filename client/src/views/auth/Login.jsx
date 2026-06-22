import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useAuth } from '@/hooks/useAuth';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function Login() {
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
      <h2 style={{ marginBottom: 16 }}>Sign in</h2>
      {error && <Banner kind="error">{error}</Banner>}
      {needsVerify && !resent && (
        <Banner kind="warn">
          Your email is not verified yet.{' '}
          <button className="btn btn-ghost btn-sm" data-testid="resend-verification" onClick={resend} style={{ padding: '2px 6px' }}>
            Resend verification email
          </button>
        </Banner>
      )}
      {resent && <Banner kind="success" data-testid="resend-done">If that account is unverified, a new verification email has been sent.</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" data-testid="email" autoComplete="email"
            {...register('email', { required: 'Email is required' })} />
          {errors.email && <div className="error-text">{errors.email.message}</div>}
        </div>
        <PasswordField
          label="Password"
          testId="password"
          autoComplete="current-password"
          error={errors.password?.message}
          field={register('password', { required: 'Password is required' })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="row-between" style={{ marginTop: 16 }}>
        <Link className="small" to="/forgot-password">Forgot password?</Link>
        <Link className="small" to="/register">Create an account</Link>
      </div>
    </div>
  );
}
