import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function Register() {
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
        <h2 style={{ marginBottom: 12 }}>Check your email</h2>
        <Banner kind="success" data-testid="register-success">
          Your account was created. We sent a verification link to your email. Open it to activate your account and sign in.
        </Banner>
        <p className="muted small">In development, the verification link is printed in the server logs (look for an Ethereal preview URL).</p>
        <Link className="btn btn-outline btn-block" to="/login" style={{ marginTop: 8 }}>Back to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Create your account</h2>
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label">Full name</label>
          <input className="input" data-testid="fullName" {...register('fullName', { required: 'Your name is required' })} />
          {errors.fullName && <div className="error-text">{errors.fullName.message}</div>}
        </div>
        <div className="field">
          <label className="label">Company name</label>
          <input className="input" data-testid="organizationName" placeholder="Your organization" {...register('organizationName')} />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" data-testid="email" {...register('email', { required: 'Email is required' })} />
          {errors.email && <div className="error-text">{errors.email.message}</div>}
        </div>
        <PasswordField
          label="Password"
          testId="password"
          showMeter
          value={password}
          hint="Use at least 8 characters. Mix upper and lower case, a number and a symbol for a strong password."
          error={errors.password?.message}
          field={register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <div className="row" style={{ marginTop: 16, justifyContent: 'center', gap: 5 }}>
        <span className="small muted">Already have an account?</span>
        <Link className="small" to="/login">Sign in</Link>
      </div>
    </div>
  );
}
