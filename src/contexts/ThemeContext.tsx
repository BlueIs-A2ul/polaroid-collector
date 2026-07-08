import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Theme, ThemeColors, ThemeConfig, ThemeAdjustment, ResolvedColors } from '../types/theme'
import { getThemeConfig, saveThemeConfig } from '../services/themeService'
import { PRESET_THEMES, DEFAULT_THEME_ID, getThemeById, deriveColors } from '../constants/themes'
import { adjustColor, DEFAULT_ADJUSTMENT } from '../utils/colorUtils'

interface ThemeContextValue {
  theme: Theme
  colors: ResolvedColors
  originalColors: ThemeColors
  currentThemeId: string
  customThemes: Theme[]
  allThemes: Theme[]
  adjustment: ThemeAdjustment
  isDark: boolean
  setTheme: (themeId: string) => void
  setAdjustment: (adjustment: ThemeAdjustment) => void
  resetAdjustment: () => void
  addCustomTheme: (theme: Theme) => void
  removeCustomTheme: (themeId: string) => void
  toggleDarkMode: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>({
    currentThemeId: DEFAULT_THEME_ID,
    customThemes: [],
    adjustment: DEFAULT_ADJUSTMENT,
    isDark: false,
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

  const baseTheme = useMemo(() => {
    let found = PRESET_THEMES.find(t => t.id === config.currentThemeId)
    if (!found) {
      found = config.customThemes.find(t => t.id === config.currentThemeId)
    }
    return found || getThemeById(DEFAULT_THEME_ID)
  }, [config.currentThemeId, config.customThemes])

  const adjustedCore = useMemo((): ThemeColors => {
    const base = baseTheme.colors
    const adj = config.adjustment

    if (adj.hueShift === 0 && adj.saturation === 0 && adj.lightness === 0) {
      return base
    }

    return {
      ...base,
      PRIMARY: adjustColor(base.PRIMARY, adj),
      SECONDARY: adjustColor(base.SECONDARY, {
        hueShift: Math.round(adj.hueShift * 0.3),
        saturation: Math.round(adj.saturation * 0.5),
        lightness: adj.lightness,
      }),
      SUCCESS: adjustColor(base.SUCCESS, {
        hueShift: Math.round(adj.hueShift * 0.5),
        saturation: Math.round(adj.saturation * 0.3),
        lightness: adj.lightness,
      }),
      ERROR: adjustColor(base.ERROR, {
        hueShift: Math.round(adj.hueShift * 0.5),
        saturation: Math.round(adj.saturation * 0.3),
        lightness: adj.lightness,
      }),
      WARNING: adjustColor(base.WARNING, adj),
      INFO: adjustColor(base.INFO, adj),
    }
  }, [baseTheme, config.adjustment])

  const colors = useMemo((): ResolvedColors => {
    return deriveColors(adjustedCore, config.isDark)
  }, [adjustedCore, config.isDark])

  const allThemes = useMemo(() => {
    return [...PRESET_THEMES, ...config.customThemes]
  }, [config.customThemes])

  const setTheme = useCallback(async (themeId: string) => {
    const newConfig = { ...config, currentThemeId: themeId }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const setAdjustment = useCallback(async (adjustment: ThemeAdjustment) => {
    const newConfig = { ...config, adjustment }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const resetAdjustment = useCallback(async () => {
    const newConfig = { ...config, adjustment: DEFAULT_ADJUSTMENT }
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
      ...config,
      currentThemeId: newCurrentThemeId,
      customThemes: newCustomThemes,
    }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const toggleDarkMode = useCallback(async () => {
    const newConfig = { ...config, isDark: !config.isDark }
    setConfig(newConfig)
    await saveThemeConfig(newConfig)
  }, [config])

  const value: ThemeContextValue = {
    theme: baseTheme,
    colors,
    originalColors: baseTheme.colors,
    currentThemeId: config.currentThemeId,
    customThemes: config.customThemes,
    allThemes,
    adjustment: config.adjustment,
    isDark: config.isDark,
    setTheme,
    setAdjustment,
    resetAdjustment,
    addCustomTheme,
    removeCustomTheme,
    toggleDarkMode,
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
