export const POLAROID_TYPES = [
  '无签',
  '带签',
  '主题',
  '宿题',
] as const

export const MEMBER_COUNTS = [
  '单人',
  '双人',
  '团切',
] as const

export const POLAROID_TYPE_OPTIONS = [...POLAROID_TYPES, '自定义']

export const MEMBER_COUNT_OPTIONS = [...MEMBER_COUNTS, '自定义']