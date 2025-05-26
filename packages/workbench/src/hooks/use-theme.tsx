import { useCallback, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const storageKey = 'motia-workbench-theme'
const defaultTheme = (localStorage.getItem(storageKey) as Theme) || 'system'

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

export const useTheme = () => {
  const [theme, _setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    updateTheme(defaultTheme)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    _setTheme(newTheme)
    updateTheme(newTheme)
  }, [])

  return {
    theme,
    setTheme,
  }
}
