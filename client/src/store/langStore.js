import { create } from 'zustand';

const KEY = 'aic_lang';
// Default to German (this is a German-market compliance app); a saved choice
// in localStorage still wins for returning users.
const initial = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || 'de';

export const useLangStore = create((set) => ({
  lang: initial,
  setLang: (lang) => {
    try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    set({ lang });
  },
}));
