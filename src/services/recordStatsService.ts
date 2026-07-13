import { getAllRecords } from './storageService'
import {
  Statistics,
  ServiceResult,
  MonthlySpending,
} from '../types'

export const getStatistics = async (): Promise<ServiceResult<Statistics>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: null,
        error,
      }
    }

    const totalRecords = records.length
    const totalPhotos = records.reduce((sum, r) => sum + r.photoCount, 0)
    const uniqueIdols = new Set(records.map(r => r.idolName)).size
    const totalPrice = records.reduce((sum, r) => sum + (r.price || 0), 0)

    const groupMap: Record<string, number> = {}
    const cityMap: Record<string, number> = {}
    const venueMap: Record<string, number> = {}

    records.forEach(r => {
      if (r.groupName) {
        groupMap[r.groupName] = (groupMap[r.groupName] || 0) + 1
      }
      if (r.city) {
        cityMap[r.city] = (cityMap[r.city] || 0) + 1
      }
      if (r.venue) {
        venueMap[r.venue] = (venueMap[r.venue] || 0) + 1
      }
    })

    const groupStats = Object.entries(groupMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const cityStats = Object.entries(cityMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const venueStats = Object.entries(venueMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: {
        totalRecords,
        totalPhotos,
        uniqueIdols,
        totalPrice,
        groupStats,
        cityStats,
        venueStats,
      },
      error: null,
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getMonthlySpending = async (
  months = 6,
): Promise<ServiceResult<MonthlySpending[]>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: [],
        error,
      }
    }

    const result: MonthlySpending[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const monthRecords = records.filter(r => {
        const recordDate = new Date(r.photoDate)
        return (
          recordDate.getFullYear() === year &&
          recordDate.getMonth() + 1 === month
        )
      })

      const totalSpending = monthRecords.reduce(
        (sum, r) => sum + (r.price || 0),
        0,
      )

      result.push({
        year,
        month,
        totalSpending,
        recordCount: monthRecords.length,
        label: `${month}月`,
      })
    }

    return {
      success: true,
      data: result,
      error: null,
    }
  } catch (error) {
    console.error('获取月度花费失败:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
