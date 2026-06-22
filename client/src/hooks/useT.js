import { useLangStore } from '@/store/langStore';
import { translate } from '@/i18n/ui';

// Returns { t, lang } where t(key) resolves an app-wide UI string in the
// currently selected language (falling back to English, then the key itself).
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return { lang, t: (key) => translate(lang, key) };
}
