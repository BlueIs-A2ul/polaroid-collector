import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { Theme, ThemeConfig, ThemeAdjustment } from '../types/theme'
import { DEFAULT_THEME_ID } from '../constants/themes'
import { DEFAULT_ADJUSTMENT } from '../utils/colorUtils'

export const getThemeConfig = async (): Promise<ThemeConfig> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME)
    if (data) {
      const config = JSON.parse(data)
      return {
        currentThemeId: config.currentThemeId || DEFAULT_THEME_ID,
        customThemes: config.customThemes || [],
        adjustment: config.adjustment || DEFAULT_ADJUSTMENT,
      }
    }
    return {
      currentThemeId: DEFAULT_THEME_ID,
      customThemes: [],
      adjustment: DEFAULT_ADJUSTMENT,
    }
  } catch {
    return {
      currentThemeId: DEFAULT_THEME_ID,
      customThemes: [],
      adjustment: DEFAULT_ADJUSTMENT,
    }
  }
}

export const saveThemeConfig = async (config: ThemeConfig): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(config))
}

export const getCurrentThemeId = async (): Promise<string> => {
  const config = await getThemeConfig()
  return config.currentThemeId
}

export const setCurrentThemeId = async (themeId: string): Promise<void> => {
  const config = await getThemeConfig()
  config.currentThemeId = themeId
  await saveThemeConfig(config)
}

export const setThemeAdjustment = async (adjustment: ThemeAdjustment): Promise<void> => {
  const config = await getThemeConfig()
  config.adjustment = adjustment
  await saveThemeConfig(config)
}

export const addCustomTheme = async (theme: Theme): Promise<void> => {
  const config = await getThemeConfig()
  const existingIndex = config.customThemes.findIndex(t => t.id === theme.id)
  if (existingIndex >= 0) {
    config.customThemes[existingIndex] = theme
  } else {
    config.customThemes.push(theme)
  }
  await saveThemeConfig(config)
}

export const removeCustomTheme = async (themeId: string): Promise<void> => {
  const config = await getThemeConfig()
  config.customThemes = config.customThemes.filter(t => t.id !== themeId)
  if (config.currentThemeId === themeId) {
    config.currentThemeId = DEFAULT_THEME_ID
  }
  await saveThemeConfig(config)
}