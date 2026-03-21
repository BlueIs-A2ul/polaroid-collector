import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Theme, ThemeColors, ThemeConfig } from '../types/theme'
import { getThemeConfig, saveThemeConfig } from '../services/themeService'
import { PRESET_THEMES, DEFAULT_THEME_ID, getThemeById } from '../constants/themes'

interface ThemeContextValue {
  theme: Theme
  colors: ThemeColors
  currentThemeId: string
  customThemes: Theme[]
  allThemes: Theme[]
  setTheme: (themeId: string) => void
  addCustomTheme: (theme: Theme) => void
  removeCustomTheme: (themeId: string) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>({
    currentThemeId: DEFAULT_THEME_ID,
    customThemes: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await getThemeConfig()
    setConfig(savedConfig)
    setIsLoading(false)
  }

  const theme = useMemo(() => {
    let found = PRESET_THEMES.find(t => t.id === config.currentThemeId)
    if (!found) {
      found = config.customThemes.find(t => t.id === config.currentThemeId)
    }
    return found || getThemeById(DEFAULT_THEME_ID)
  }, [config.currentThemeId, config.customThemes])

  const colors = theme.colors

  const allThemes = useMemo(() => {
    return [...PRESET_THEMES, ...config.customThemes]
  }, [config.customThemes])

  const setTheme = useCallback(async (themeId: string) => {
    const newConfig = { ...config, currentThemeId: themeId }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const addCustomTheme = useCallback(async (newTheme: Theme) => {
    const newCustomThemes = config.customThemes.filter(t => t.id !== newTheme.id)
    newCustomThemes.push(newTheme)
    const newConfig = { ...config, customThemes: newCustomThemes }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const removeCustomTheme = useCallback(async (themeId: string) => {
    const newCustomThemes = config.customThemes.filter(t => t.id !== themeId)
    let newCurrentThemeId = config.currentThemeId
    if (config.currentThemeId === themeId) {
      newCurrentThemeId = DEFAULT_THEME_ID
    }
    const newConfig = {
      currentThemeId: newCurrentThemeId,
      customThemes: newCustomThemes,
    }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const value: ThemeContextValue = {
    theme,
    colors,
    currentThemeId: config.currentThemeId,
    customThemes: config.customThemes,
    allThemes,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    isLoading,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}