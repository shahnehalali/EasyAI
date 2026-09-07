import { RIT_SERVICES_URL } from '@/data/marketingContent';

// The "Powered by RIT Services" badge (client/public/powered-by-rit.png),
// used both on the marketing site (scoped under .mkt-page) and on the
// auth pages (not scoped there), so this stays self-contained rather than
// relying on .mkt-page's purple tokens. Real intrinsic size (367x128) is
// set as width/height attributes so the browser reserves the correct
// aspect ratio before the image loads, no layout shift; the display size
// is then just a CSS max-width.
export default function PoweredByRit({ className = '', style }) {
  return (
    <a
      href={RIT_SERVICES_URL}
      target="_blank"
      rel="noreferrer"
      className={`powered-by-rit ${className}`.trim()}
      style={style}
      data-testid="powered-by-rit"
    >
      <img src="/powered-by-rit.png" alt="Powered by RIT Services" width={367} height={128} />
    </a>
  );
}
