/**
 * AsyncStorage 存储键常量
 */
export const STORAGE_KEYS = {
  RECORDS: 'polaroid_records',
  LAST_UPDATED: 'polaroid_last_updated',
  AVATARS: 'polaroid_avatars',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
