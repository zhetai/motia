import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light' | 'system'

const storageKey = 'motia-workbench-theme'

const updateTheme = (theme: Theme) => {
  const root = window.document.body

  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

    root.classList.add(systemTheme)
    return
  }

  root.classList.add(theme)
}

export type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const listeners = new Set<() => void>()

let currentTheme: Theme = 'dark'
let memoizedSnapshot: ThemeState

const updateMemoizedSnapshot = () => {
  memoizedSnapshot = {
    theme: currentTheme,
    setTheme: storeActions.setTheme,
  }
}

const notify = () => {
  listeners.forEach((listener) => listener())
}

const storeActions = {
  setTheme: (theme: Theme) => {
    currentTheme = theme
    localStorage.setItem(storageKey, theme)
    updateTheme(theme)
    updateMemoizedSnapshot()
    notify()
  },
}

updateMemoizedSnapshot()

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

export function useTheme<SelectorOutput = ThemeState>(
  selector: (state: ThemeState) => SelectorOutput = (state) => state as unknown as SelectorOutput,
): SelectorOutput {
  const getSnapshot = useCallback(() => selector(memoizedSnapshot), [selector])

  return useSyncExternalStore(subscribe, getSnapshot)
}
