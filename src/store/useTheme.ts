import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => {
        set({ mode });
        const effective = mode === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : mode;
        document.documentElement.setAttribute('data-theme', effective);
        document.body.style.backgroundColor = effective === 'dark' ? '#1a1a2e' : '#ffffff';
      },
      get effectiveTheme() {
        const { mode } = get();
        if (mode === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return mode;
      },
    }),
    { name: 'theme-storage' }
  )
);

export const applyTheme = () => {
  const mode = useThemeStore.getState().mode;
  const effective = mode === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.setAttribute('data-theme', effective);
  document.body.style.backgroundColor = effective === 'dark' ? '#1a1a2e' : '#ffffff';
};