import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import { FRAMEWORK_DIRECTORY, TIER_LABELS } from '@/data/frameworkDirectory';

const TIERS = [1, 2, 3];

// The full 37-law catalogue: searchable and filterable by tier, grouped for
// scanability. Real content, generated from the same source the app seeds
// from, not a hand-picked highlight list.
export default function FrameworkDirectory() {
  const lang = useLangStore((s) => s.lang);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState(null); // null = all

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return FRAMEWORK_DIRECTORY.filter((f) => {
      if (tier && f.tier !== tier) return false;
      if (!needle) return true;
      return (
        f.name.en.toLowerCase().includes(needle) ||
        f.name.de.toLowerCase().includes(needle) ||
        f.description[lang].toLowerCase().includes(needle)
      );
    });
  }, [q, tier, lang]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const f of filtered) {
      if (!map.has(f.tier)) map.set(f.tier, []);
      map.get(f.tier).push(f);
    }
    return map;
  }, [filtered]);

  return (
    <div data-testid="framework-directory">
      <div className="mkt-directory-controls">
        <div className="mkt-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="text"
            placeholder={lang === 'de' ? 'Gesetz suchen...' : 'Search a law...'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="framework-search"
            aria-label={lang === 'de' ? 'Gesetz suchen' : 'Search laws'}
          />
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${tier === null ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTier(null)}
            data-testid="framework-tier-all"
          >
            {lang === 'de' ? 'Alle' : 'All'} ({FRAMEWORK_DIRECTORY.length})
          </button>
          {TIERS.map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${tier === t ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTier(t)}
              data-testid={`framework-tier-${t}`}
            >
              {TIER_LABELS[t][lang]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="muted small" style={{ textAlign: 'center', marginTop: 24 }}>
          {lang === 'de' ? 'Keine Treffer.' : 'No matches.'}
        </p>
      )}

      <div className="stack" style={{ gap: 26, marginTop: 22 }}>
        {[...grouped.entries()].sort((a, b) => a[0] - b[0]).map(([t, laws]) => (
          <div key={t}>
            <div className="mkt-directory-tier-head">{TIER_LABELS[t][lang]}</div>
            <div className="grid grid-3 mkt-directory-grid">
              {laws.map((f) => (
                <div key={f.key} className="mkt-directory-item" data-testid={`framework-item-${f.key}`}>
                  <div className="mkt-directory-name">{f.name[lang]}</div>
                  <p className="muted small" style={{ margin: '4px 0 0' }}>{f.description[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
