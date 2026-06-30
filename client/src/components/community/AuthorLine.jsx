import { initials, fromNow } from '@/utils/format';

// Always shows Name + Company (the chosen identity model), plus relative time.
export default function AuthorLine({ author, createdAt, lang = 'en' }) {
  const name = author?.fullName || 'Unknown';
  return (
    <div className="row" style={{ gap: 7, alignItems: 'center', fontSize: 12 }}>
      <span className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{initials(name)}</span>
      <span><strong>{name}</strong>{author?.company && <span className="muted">, {author.company}</span>}</span>
      {createdAt && <span className="muted">· {fromNow(createdAt, lang)}</span>}
    </div>
  );
}
