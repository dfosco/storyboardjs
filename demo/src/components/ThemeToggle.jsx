import { useTheme } from '@primer/react'
import { Button } from '@primer/react'
import { SunIcon, MoonIcon } from '@primer/octicons-react'

export function ThemeToggle() {
  const {resolvedColorMode, setColorMode} = useTheme()
  const isDark = resolvedColorMode === 'dark' || resolvedColorMode === 'night'

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setColorMode(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <Button leadingVisual={isDark ? SunIcon : MoonIcon} onClick={toggleTheme}>
      Switch to {isDark ? 'light' : 'dark'} mode
    </Button>
  )
}