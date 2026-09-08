import { RIT_SERVICES_URL } from '@/data/marketingContent';

// The "Powered by RIT Services" badge, used both on the marketing site
// (scoped under .mkt-page) and on the auth pages (not scoped there), so this
// stays self-contained rather than relying on .mkt-page's accent tokens.
// Two art variants ship, same 367x128 artwork: the light one
// (client/public/powered-by-rit.png, white background) for use on light
// surfaces, and a `dark` one (client/public/powered-by-dark.png, a
// self-contained teal-to-blue gradient chip) for use on dark surfaces such
// as the landing hero and the site footer. Real intrinsic size is set as
// width/height attributes so the browser reserves the correct aspect ratio
// before the image loads, no layout shift; the display size is then just a
// CSS max-width.
export default function PoweredByRit({ className = '', style, dark = false }) {
  return (
    <a
      href={RIT_SERVICES_URL}
      target="_blank"
      rel="noreferrer"
      className={`powered-by-rit ${className}`.trim()}
      style={style}
      data-testid="powered-by-rit"
    >
      <img
        src={dark ? '/powered-by-dark.png' : '/powered-by-rit.png'}
        alt="Powered by RIT Services"
        width={367}
        height={128}
      />
    </a>
  );
}
