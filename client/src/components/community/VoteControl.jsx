import { ChevronUp, ChevronDown } from 'lucide-react';

// Reddit-style vote stack: up arrow, score, down arrow. Clicking the active
// direction again clears the vote (value 0).
export default function VoteControl({ score = 0, myVote = 0, onVote, disabled = false }) {
  const set = (dir) => () => { if (!disabled && onVote) onVote(myVote === dir ? 0 : dir); };
  const arrow = (dir, Icon) => (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-pressed={myVote === dir}
      aria-label={dir === 1 ? 'Upvote' : 'Downvote'}
      onClick={set(dir)}
      disabled={disabled}
      style={{
        padding: 2, lineHeight: 1,
        color: myVote === dir ? (dir === 1 ? 'var(--green)' : 'var(--red)') : 'var(--muted)',
      }}
    >
      <Icon size={18} strokeWidth={2.4} />
    </button>
  );
  return (
    <div className="stack" style={{ alignItems: 'center', gap: 0, minWidth: 34 }}>
      {arrow(1, ChevronUp)}
      <strong style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{score}</strong>
      {arrow(-1, ChevronDown)}
    </div>
  );
}
