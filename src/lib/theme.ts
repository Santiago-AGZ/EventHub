import { create } from 'zustand'

type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolved: 'dark' | 'light'
  setMode: (mode: ThemeMode) => void
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('theme-mode') as ThemeMode) || 'system'
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.toggle('light', resolved === 'light')
  root.classList.toggle('dark', resolved === 'dark')
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getStoredMode(),
  resolved: resolveTheme(getStoredMode()),
  setMode: (mode) => {
    const resolved = resolveTheme(mode)
    localStorage.setItem('theme-mode', mode)
    applyTheme(resolved)
    set({ mode, resolved })
  },
}))

if (typeof window !== 'undefined') {
  applyTheme(resolveTheme(getStoredMode()))
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    const { mode, setMode } = useThemeStore.getState()
    if (mode === 'system') setMode('system')
  })
}
