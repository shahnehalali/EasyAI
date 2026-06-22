import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card" data-testid="not-found"><div className="empty">
      <div className="big">404</div>
      <h3 style={{ marginBottom: 6 }}>Page not found</h3>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link className="btn btn-primary btn-sm" to="/" style={{ marginTop: 14 }}>Back to dashboard</Link>
    </div></div>
  );
}
