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

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
}

export interface ThemeConfig {
  currentThemeId: string
  customThemes: Theme[]
}