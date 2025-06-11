import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'light'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setActualTheme(prefersDark ? 'dark' : 'light')
      } else {
        setActualTheme(theme)
      }
    }

    updateActualTheme()

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateActualTheme)
      return () => mediaQuery.removeEventListener('change', updateActualTheme)
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    // Apply theme to document root
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add the current theme class
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
    
    console.log('Theme applied:', actualTheme, 'Classes:', root.classList.toString())
  }, [theme, actualTheme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}