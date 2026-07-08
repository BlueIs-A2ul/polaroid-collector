export interface ThemeColors {
  PRIMARY: string
  SECONDARY: string
  SUCCESS: string
  ERROR: string
  WARNING: string
  INFO: string
  WHITE: string
  BLACK: string
  TRANSPARENT: string
  GRAY: {
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

export interface ResolvedColors extends ThemeColors {
  SURFACE: string
  SURFACE_HIGHLIGHT: string
  SURFACE_ELEVATED: string
  BORDER: string
  BORDER_LIGHT: string
  TEXT_PRIMARY: string
  TEXT_SECONDARY: string
  TEXT_TERTIARY: string
  SUCCESS_BG: string
  ERROR_BG: string
  WARNING_BG: string
  INFO_BG: string
  OVERLAY: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
}

export interface ThemeAdjustment {
  hueShift: number
  saturation: number
  lightness: number
}

export interface ThemeConfig {
  currentThemeId: string
  customThemes: Theme[]
  adjustment: ThemeAdjustment
  isDark: boolean
}
