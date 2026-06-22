import { create } from 'zustand';

const KEY = 'aic_theme';

function initial() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

// Reflect the theme onto <html data-theme> so the CSS variables switch.
function apply(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

const start = initial();
apply(start);

export const useThemeStore = create((set, get) => ({
  theme: start,
  setTheme: (theme) => {
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
    apply(theme);
    set({ theme });
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
