/**
 * 拍立得记录
 */
export interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  createdAt: number
  updatedAt: number
}

/**
 * 排行榜项
 */
export interface RankingItem {
  idolName: string
  totalCount: number
  records: PolaroidRecord[]
  latestPhoto: string | null
  latestDate: string | null
  dates: string[]
}

/**
 * 偶像详情
 */
export interface IdolDetail {
  idolName: string
  totalCount: number
  records: PolaroidRecord[]
  latestPhoto: string
  totalRecords: number
}

/**
 * 统计信息
 */
export interface Statistics {
  totalRecords: number
  totalPhotos: number
  uniqueIdols: number
}

/**
 * 服务响应结果
 */
export interface ServiceResult<T = any> {
  success: boolean
  data: T | null
  error: string | null
}

/**
 * 记录创建数据
 */
export interface CreateRecordData {
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
}

/**
 * 记录更新数据
 */
export interface UpdateRecordData {
  idolName?: string
  photoCount?: number
  photoDate?: string
  photoUri?: string
}
