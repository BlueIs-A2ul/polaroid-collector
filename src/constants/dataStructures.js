// 数据结构定义

/**
 * 拍立得记录结构
 */
export const RECORD_STRUCTURE = {
  id: 'string',
  idolName: 'string',
  photoCount: 'number',
  photoDate: 'string',
  photoUri: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
}

/**
 * 排行榜数据结构
 */
export const RANKING_STRUCTURE = {
  idolName: 'string',
  totalCount: 'number',
  records: 'array',
  latestPhoto: 'string',
  dates: 'array',
}
