import { getAllRecords } from './storageService'
import { PolaroidRecord, ServiceResult } from '../types'

export interface YearlyReport {
  year: number
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  newIdols: string[]
  topIdols: Array<{
    name: string
    count: number
    price: number
  }>
  topCities: Array<{
    name: string
    count: number
  }>
  topVenues: Array<{
    name: string
    count: number
  }>
  monthlyData: Array<{
    month: number
    records: number
    photos: number
    price: number
  }>
  firstRecord: {
    idolName: string
    date: string
  } | null
  mostExpensiveRecord: {
    idolName: string
    price: number
    date: string
  } | null
  averagePrice: number
  totalDays: number
  favoriteDayOfWeek: {
    day: string
    count: number
  }
}

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const getYearlyReport = async (year: number): Promise<ServiceResult<YearlyReport>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success || !records) {
      return { success: false, data: null, error }
    }

    const yearRecords = records.filter(r => {
      const recordYear = new Date(r.photoDate).getFullYear()
      return recordYear === year
    })

    if (yearRecords.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      }
    }

    const totalRecords = yearRecords.length
    const totalPhotos = yearRecords.reduce((sum, r) => sum + r.photoCount, 0)
    const totalPrice = yearRecords.reduce((sum, r) => sum + (r.price || 0), 0)

    const allIdols = new Set(records.map(r => r.idolName))
    const idolsBeforeYear = new Set(
      records
        .filter(r => new Date(r.photoDate).getFullYear() < year)
        .map(r => r.idolName)
    )
    const newIdols = Array.from(allIdols).filter(name => !idolsBeforeYear.has(name))

    const idolMap = new Map<string, { count: number; price: number }>()
    yearRecords.forEach(r => {
      const current = idolMap.get(r.idolName) || { count: 0, price: 0 }
      idolMap.set(r.idolName, {
        count: current.count + r.photoCount,
        price: current.price + (r.price || 0),
      })
    })
    const topIdols = Array.from(idolMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const cityMap = new Map<string, number>()
    yearRecords.forEach(r => {
      if (r.city) {
        cityMap.set(r.city, (cityMap.get(r.city) || 0) + 1)
      }
    })
    const topCities = Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const venueMap = new Map<string, number>()
    yearRecords.forEach(r => {
      if (r.venue) {
        venueMap.set(r.venue, (venueMap.get(r.venue) || 0) + 1)
      }
    })
    const topVenues = Array.from(venueMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const monthlyData: Array<{ month: number; records: number; photos: number; price: number }> = []
    for (let month = 1; month <= 12; month++) {
      const monthRecords = yearRecords.filter(r => {
        const recordMonth = new Date(r.photoDate).getMonth() + 1
        return recordMonth === month
      })
      monthlyData.push({
        month,
        records: monthRecords.length,
        photos: monthRecords.reduce((sum, r) => sum + r.photoCount, 0),
        price: monthRecords.reduce((sum, r) => sum + (r.price || 0), 0),
      })
    }

    const sortedByDate = [...yearRecords].sort((a, b) =>
      new Date(a.photoDate).getTime() - new Date(b.photoDate).getTime()
    )
    const firstRecord = sortedByDate[0] ? {
      idolName: sortedByDate[0].idolName,
      date: sortedByDate[0].photoDate,
    } : null

    const mostExpensive = [...yearRecords]
      .filter(r => r.price && r.price > 0)
      .sort((a, b) => (b.price || 0) - (a.price || 0))[0]
    const mostExpensiveRecord = mostExpensive ? {
      idolName: mostExpensive.idolName,
      price: mostExpensive.price || 0,
      date: mostExpensive.photoDate,
    } : null

    const averagePrice = totalPhotos > 0 ? totalPrice / totalPhotos : 0

    const uniqueDates = new Set(yearRecords.map(r => r.photoDate))
    const totalDays = uniqueDates.size

    const dayOfWeekMap = new Map<number, number>()
    yearRecords.forEach(r => {
      const day = new Date(r.photoDate).getDay()
      dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + 1)
    })
    const favoriteDay = Array.from(dayOfWeekMap.entries()).sort((a, b) => b[1] - a[1])[0]
    const favoriteDayOfWeek = {
      day: DAY_NAMES[favoriteDay[0]],
      count: favoriteDay[1],
    }

    return {
      success: true,
      data: {
        year,
        totalRecords,
        totalPhotos,
        totalPrice,
        newIdols,
        topIdols,
        topCities,
        topVenues,
        monthlyData,
        firstRecord,
        mostExpensiveRecord,
        averagePrice,
        totalDays,
        favoriteDayOfWeek,
      },
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getAvailableYears = async (): Promise<number[]> => {
  const { success, data: records } = await getAllRecords()
  if (!success || !records) return []

  const years = new Set(records.map(r => new Date(r.photoDate).getFullYear()))
  return Array.from(years).sort((a, b) => b - a)
}