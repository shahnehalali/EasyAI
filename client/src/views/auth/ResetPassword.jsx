import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { Banner } from '@/components/ui/Ui';
import PasswordField from '@/components/ui/PasswordField';

export default function ResetPassword() {
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
      <h2 style={{ marginBottom: 16 }}>Choose a new password</h2>
      {error && <Banner kind="error">{error}</Banner>}
      {done ? (
        <>
          <Banner kind="success">Your password has been updated.</Banner>
          <Link className="btn btn-primary btn-block" to="/login">Sign in</Link>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <PasswordField
            label="New password"
            testId="password"
            showMeter
            value={password}
            error={errors.password?.message}
            field={register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
          />
          <button className="btn btn-primary btn-block" type="submit" data-testid="submit">Update password</button>
        </form>
      )}
    </div>
  );
}
