import { useLangStore } from '@/store/langStore';
import { useT } from '@/hooks/useT';

// The EN/DE segmented language toggle. Shared by the top bar and the auth pages.
export default function LanguageSwitch({ className = '' }) {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <div className={`lang-switch ${lang}${className ? ` ${className}` : ''}`} role="group" aria-label={t('lang.label')} data-testid="lang-switch">
      <span className="lang-indicator" aria-hidden="true" />
      <button
        data-testid="lang-en"
        className={`lang-opt${lang === 'en' ? ' active' : ''}`}
        aria-pressed={lang === 'en'}
        onClick={() => setLang('en')}
      >EN</button>
      <button
        data-testid="lang-de"
        className={`lang-opt${lang === 'de' ? ' active' : ''}`}
        aria-pressed={lang === 'de'}
        onClick={() => setLang('de')}
      >DE</button>
    </div>
  );
}
