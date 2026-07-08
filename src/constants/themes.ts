import { Theme, ThemeColors, ResolvedColors } from '../types/theme'
import { withOpacity } from '../utils/colorUtils'

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
      SUCCESS: '#668B2C',
      ERROR: '#C0392B',
      WARNING: '#E6A015',
      INFO: '#4A90B8',
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
      SUCCESS: '#16A085',
      ERROR: '#D6457A',
      WARNING: '#E5A024',
      INFO: '#5B7EC2',
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
      SUCCESS: '#45B77D',
      ERROR: '#D6273E',
      WARNING: '#E8A517',
      INFO: '#8E6BB5',
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
      SUCCESS: '#2E9A48',
      ERROR: '#E05B3E',
      WARNING: '#C9A024',
      INFO: '#3F9CC4',
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
      SUCCESS: '#3DA88A',
      ERROR: '#D14335',
      WARNING: '#E09E20',
      INFO: '#7B6DBA',
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
      SUCCESS: '#6B9A3A',
      ERROR: '#B8452B',
      WARNING: '#F27D1A',
      INFO: '#3D79B8',
      WHITE: '#FFFFFF',
      BLACK: '#000000',
      TRANSPARENT: 'transparent',
      GRAY,
    },
  },
]

export function deriveColors(core: ThemeColors, isDark: boolean): ResolvedColors {
  if (isDark) {
    return {
      ...core,
      SURFACE: '#1E1E1E',
      SURFACE_HIGHLIGHT: withOpacity(core.PRIMARY, 0.12),
      SURFACE_ELEVATED: '#282828',
      BORDER: withOpacity('#FFFFFF', 0.08),
      BORDER_LIGHT: withOpacity('#FFFFFF', 0.04),
      TEXT_PRIMARY: '#F2F2F2',
      TEXT_SECONDARY: '#A0A0A0',
      TEXT_TERTIARY: '#6B6B6B',
      SUCCESS_BG: withOpacity(core.SUCCESS, 0.15),
      ERROR_BG: withOpacity(core.ERROR, 0.15),
      WARNING_BG: withOpacity(core.WARNING, 0.15),
      INFO_BG: withOpacity(core.INFO, 0.15),
      OVERLAY: 'rgba(0, 0, 0, 0.55)',
    }
  }

  return {
    ...core,
    SURFACE: core.WHITE,
    SURFACE_HIGHLIGHT: withOpacity(core.PRIMARY, 0.08),
    SURFACE_ELEVATED: core.WHITE,
    BORDER: withOpacity(core.BLACK, 0.08),
    BORDER_LIGHT: withOpacity(core.BLACK, 0.04),
    TEXT_PRIMARY: core.BLACK,
    TEXT_SECONDARY: core.GRAY[600],
    TEXT_TERTIARY: core.GRAY[400],
    SUCCESS_BG: withOpacity(core.SUCCESS, 0.1),
    ERROR_BG: withOpacity(core.ERROR, 0.1),
    WARNING_BG: withOpacity(core.WARNING, 0.1),
    INFO_BG: withOpacity(core.INFO, 0.1),
    OVERLAY: 'rgba(0, 0, 0, 0.45)',
  }
}

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

export const CARD_SHADOW_SMALL = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
}

export const REPORT_CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
}

export const MODAL_OVERLAY = 'rgba(0, 0, 0, 0.45)'

export const HEADER_PADDING_TOP = 40

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
