import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// A small pill-style back button used at the top of detail pages. The chevron
// nudges left on hover. Replaces the old plain "← text" links.
export default function BackLink({ to, children }) {
  return (
    <div className="back-link-wrap">
      <Link to={to} className="back-link" data-testid="back-link">
        <ChevronLeft size={15} aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </div>
  );
}
