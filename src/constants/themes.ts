import { Theme, ThemeColors } from '../types/theme'

const GRAY = {
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
}

export const PRESET_THEMES: Theme[] = [
  {
    id: 'classic',
    name: '经典棕',
    colors: {
      PRIMARY: '#8B4513',
      SECONDARY: '#F5F5DC',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    colors: {
      PRIMARY: '#1976D2',
      SECONDARY: '#E3F2FD',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
  {
    id: 'sakura',
    name: '樱花粉',
    colors: {
      PRIMARY: '#E91E63',
      SECONDARY: '#FCE4EC',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
  {
    id: 'forest',
    name: '森林绿',
    colors: {
      PRIMARY: '#388E3C',
      SECONDARY: '#E8F5E9',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
  {
    id: 'lavender',
    name: '薰衣草',
    colors: {
      PRIMARY: '#7B1FA2',
      SECONDARY: '#F3E5F5',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
  {
    id: 'sunset',
    name: '日落橙',
    colors: {
      PRIMARY: '#E65100',
      SECONDARY: '#FFF3E0',
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
]

export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

export const POLAROID_BORDER_WIDTH = 8
export const POLAROID_BORDER_COLOR = '#FFFFFF'

export const DEFAULT_THEME_ID = 'classic'

export function getThemeById(id: string): Theme {
  return PRESET_THEMES.find(t => t.id === id) || PRESET_THEMES[0]
}

export function createCustomTheme(id: string, name: string, primaryColor: string, secondaryColor: string): Theme {
  return {
    id,
    name,
    colors: {
      PRIMARY: primaryColor,
      SECONDARY: secondaryColor,
      SUCCESS: '#4CAF50',
      ERROR: '#F44336',
      WARNING: '#FF9800',
      INFO: '#2196F3',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  }
}