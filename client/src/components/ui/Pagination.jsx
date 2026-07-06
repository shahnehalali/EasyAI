import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Client-side pagination helper: slices `items` into pages of `pageSize` and
// keeps the current page in range when the list shrinks (e.g. after filtering).
export function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );
  return { page, setPage, pageItems, pageCount, total, pageSize };
}

// Build the visible page tokens with ellipses for long ranges.
function pageTokens(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push('...');
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < pageCount - 1) out.push('...');
  out.push(pageCount);
  return out;
}

// Pill pager (ERP-style): numbered pill buttons with an olive active state and
// prev/next chevrons. Renders nothing when there is a single page.
export default function Pagination({ page, pageCount, onChange, total, pageSize, label = 'Pagination' }) {
  if (pageCount <= 1) return null;
  const tokens = pageTokens(page, pageCount);
  const go = (p) => { if (p >= 1 && p <= pageCount && p !== page) onChange(p); };
  return (
    <nav className="pager" role="navigation" aria-label={label}>
      {total != null && pageSize != null && (
        <span className="pager-info">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}</span>
      )}
      <button className="pager-btn pager-nav" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {tokens.map((tk, i) => (tk === '...'
        ? <span key={`e${i}`} className="pager-ellipsis">…</span>
        : (
          <button
            key={tk}
            className={`pager-btn${tk === page ? ' active' : ''}`}
            aria-current={tk === page ? 'page' : undefined}
            onClick={() => go(tk)}
          >{tk}</button>
        )
      ))}
      <button className="pager-btn pager-nav" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
