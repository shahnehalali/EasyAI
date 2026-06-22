import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { Banner } from '@/components/ui/Ui';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    await authApi.forgotPassword(data.email);
    setDone(true);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Reset your password</h2>
      {done ? (
        <Banner kind="success">If an account exists for that email, a reset link has been sent. Check the server logs in development for the preview URL.</Banner>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" data-testid="email" {...register('email', { required: true })} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" data-testid="submit">Send reset link</button>
        </form>
      )}
      <div className="row" style={{ marginTop: 16, justifyContent: 'center' }}>
        <Link className="small" to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}
