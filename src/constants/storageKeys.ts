/**
 * AsyncStorage 存储键常量
 */
export const STORAGE_KEYS = {
  RECORDS: 'polaroid_records',
  LAST_UPDATED: 'polaroid_last_updated',
  AVATARS: 'polaroid_avatars',
  FIELD_HISTORY: 'polaroid_field_history',
  THEME: 'polaroid_theme',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
