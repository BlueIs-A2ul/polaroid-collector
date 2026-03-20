/**
 * 排行榜计算工具
 * 用于计算偶像的拍立得排行榜数据
 */
import { PolaroidRecord, RankingItem } from '../types'

/**
 * 计算偶像排行榜
 * @param records - 所有拍立得记录
 * @returns 排行榜数据
 */
export const calculateRanking = (records: PolaroidRecord[]): RankingItem[] => {
  const idolStats: Record<string, RankingItem> = {}

  records.forEach(record => {
    if (!idolStats[record.idolName]) {
      idolStats[record.idolName] = {
        idolName: record.idolName,
        totalCount: 0,
        totalPrice: 0,
        records: [],
        latestPhoto: null,
        latestDate: null,
        dates: [],
      }
    }

    idolStats[record.idolName].totalCount += record.photoCount
    idolStats[record.idolName].totalPrice += record.price || 0
    idolStats[record.idolName].records.push(record)
    idolStats[record.idolName].dates.push(record.photoDate)

    if (
      !idolStats[record.idolName].latestPhoto ||
      record.photoDate > idolStats[record.idolName].latestDate!
    ) {
      idolStats[record.idolName].latestPhoto = record.photoUri
      idolStats[record.idolName].latestDate = record.photoDate
    }
  })

  return Object.values(idolStats).sort((a, b) => b.totalCount - a.totalCount)
}

/**
 * 按日期排序记录
 * @param records - 记录数组
 * @param ascending - 是否升序，默认为 true
 * @returns 排序后的记录
 */
export const sortRecordsByDate = (
  records: PolaroidRecord[],
  ascending = true,
): PolaroidRecord[] => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.photoDate)
    const dateB = new Date(b.photoDate)
    return ascending
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime()
  })
}

/**
 * 格式化日期
 * @param dateString - 日期字符串 (YYYY-MM-DD)
 * @returns 格式化后的日期
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

/**
 * 获取今日日期字符串
 * @returns 今日日期字符串 (YYYY-MM-DD)
 */
export const getTodayDateString = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
