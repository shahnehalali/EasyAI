import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { invitationApi } from '@/apis/invitationApi';
import { useAuth } from '@/hooks/useAuth';
import { Banner, Spinner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function AcceptInvite() {
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

  if (state === 'loading') return <Spinner label="Checking your invitation..." />;

  if (state === 'invalid') {
    return (
      <div data-testid="accept-invite">
        <h2 style={{ marginBottom: 16 }}>Invitation</h2>
        <Banner kind="error" data-testid="invite-invalid">{error || 'This invitation is invalid or has expired.'}</Banner>
        <Link className="btn btn-outline btn-block" to="/login">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div data-testid="accept-invite">
      <h2 style={{ marginBottom: 6 }}>Join {invite.organizationName}</h2>
      <p className="muted small" style={{ marginBottom: 18 }}>
        You were invited as <strong>{invite.role}</strong> using <strong>{invite.email}</strong>. Set your name and a password to join.
      </p>
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="acc-name">Full name</label>
          <input id="acc-name" className="input" data-testid="fullName" {...register('fullName', { required: 'Your name is required' })} />
          {errors.fullName && <div className="error-text">{errors.fullName.message}</div>}
        </div>
        <PasswordField
          label="Password"
          testId="password"
          showMeter
          value={password}
          error={errors.password?.message}
          field={register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
        />
        <button className="btn btn-primary btn-block" type="submit" data-testid="submit" disabled={busy}>
          {busy ? 'Joining...' : 'Join organisation'}
        </button>
      </form>
    </div>
  );
}
