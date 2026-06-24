import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { Banner, Spinner } from '@/components/ui/Ui';

export default function VerifyEmail() {
  const { t } = useT();
  const [params] = useSearchParams();
  const token = params.get('token');
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) { setState('error'); setMessage(t('auth.noToken')); return; }
    authApi.verifyEmail(token)
      .then((res) => {
        setUser(res.user);
        setState('success');
        setTimeout(() => navigate('/', { replace: true }), 1200);
      })
      .catch((err) => { setState('error'); setMessage(err.message); });
  }, [token, setUser, navigate, t]);

  return (
    <div data-testid="verify-page">
      <h2 style={{ marginBottom: 16 }}>{t('auth.verifyTitle')}</h2>
      {state === 'verifying' && <Spinner label={t('auth.verifying')} />}
      {state === 'success' && <Banner kind="success" data-testid="verify-success">{t('auth.verifySuccess')}</Banner>}
      {state === 'error' && (
        <>
          <Banner kind="error" data-testid="verify-error">{message}</Banner>
          <Link className="btn btn-outline btn-block" to="/login">{t('auth.backToSignIn')}</Link>
        </>
      )}
    </div>
  );
}
