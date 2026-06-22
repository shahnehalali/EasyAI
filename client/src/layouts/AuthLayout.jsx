import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-body">
          <div className="row" style={{ gap: 10, marginBottom: 4 }}>
            <img src="/trial.png" alt="Easy AI" width={30} height={30} style={{ borderRadius: 7 }} />
            <span className="auth-brand">Easy AI</span>
          </div>
          <p className="muted small" style={{ marginBottom: 22 }}>Regulatory compliance for companies using AI in Germany</p>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
