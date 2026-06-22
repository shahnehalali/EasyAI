import { create } from 'zustand';

const KEY = 'aic_lang';
const initial = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || 'en';

export const useLangStore = create((set) => ({
  lang: initial,
  setLang: (lang) => {
    try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    set({ lang });
  },
}));
