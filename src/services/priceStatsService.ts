import { getAllRecords } from './storageService'
import { ServiceResult } from '../types'

export interface PriceStat {
  price: number
  count: number
}

export const getIdolPriceStats = async (
  idolName: string,
): Promise<ServiceResult<PriceStat[]>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return { success: false, data: [], error: '获取记录失败' }
    }

    const idolRecords = records.filter(r => r.idolName === idolName && r.price !== undefined && r.price > 0)
    
    const priceCounts: Record<number, number> = {}
    idolRecords.forEach(r => {
      if (r.price) {
        priceCounts[r.price] = (priceCounts[r.price] || 0) + 1
      }
    })

    const stats: PriceStat[] = Object.entries(priceCounts)
      .map(([price, count]) => ({ price: Number(price), count }))
      .sort((a, b) => b.count - a.count)

    return { success: true, data: stats, error: null }
  } catch (error) {
    return { success: false, data: [], error: '统计价格失败' }
  }
}

export const getIdolDefaultPrice = async (
  idolName: string,
): Promise<ServiceResult<number | null>> => {
  try {
    const { success, data: stats } = await getIdolPriceStats(idolName)
    if (!success || !stats || stats.length === 0) {
      return { success: true, data: null, error: null }
    }

    return { success: true, data: stats[0].price, error: null }
  } catch (error) {
    return { success: false, data: null, error: '获取默认价格失败' }
  }
}

export const getIdolPriceOptions = async (
  idolName: string,
  maxCount: number = 5,
): Promise<ServiceResult<number[]>> => {
  try {
    const { success, data: stats } = await getIdolPriceStats(idolName)
    if (!success || !stats) {
      return { success: true, data: [], error: null }
    }

    const options = stats.slice(0, maxCount).map(s => s.price)
    return { success: true, data: options, error: null }
  } catch (error) {
    return { success: false, data: [], error: '获取价格选项失败' }
  }
}