import { getRecordsByIdolName } from './storageService'
import { PolaroidRecord, ServiceResult } from '../types'

export interface IdolReport {
  idolName: string
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  averagePrice: number
  firstRecord: {
    date: string
    price?: number
  } | null
  latestRecord: {
    date: string
  } | null
  mostExpensiveRecord: {
    date: string
    price: number
    photoCount: number
  } | null
  cheapestRecord: {
    date: string
    price: number
    photoCount: number
  } | null
  topCities: Array<{
    name: string
    count: number
  }>
  topVenues: Array<{
    name: string
    count: number
  }>
  topGroups: Array<{
    name: string
    count: number
  }>
  monthlyData: Array<{
    month: string
    photos: number
    price: number
  }>
  favoriteDayOfWeek: {
    day: string
    count: number
  }
  favoriteMonth: {
    month: string
    count: number
  }
  polaroidTypes: Array<{
    type: string
    count: number
  }>
  daysSinceFirst: number
  daysSinceLast: number
  averageDaysBetween: number
  totalDaysWithRecords: number
}

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export const getIdolReport = async (idolName: string): Promise<ServiceResult<IdolReport>> => {
  try {
    const { success, data: records, error } = await getRecordsByIdolName(idolName)

    if (!success || !records) {
      return { success: false, data: null, error }
    }

    if (records.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      }
    }

    const totalRecords = records.length
    const totalPhotos = records.reduce((sum, r) => sum + r.photoCount, 0)
    const totalPrice = records.reduce((sum, r) => sum + (r.price || 0), 0)
    const averagePrice = totalPhotos > 0 ? totalPrice / totalPhotos : 0

    const sortedByDate = [...records].sort((a, b) =>
      new Date(a.photoDate).getTime() - new Date(b.photoDate).getTime()
    )

    const firstRecord = sortedByDate[0] ? {
      date: sortedByDate[0].photoDate,
      price: sortedByDate[0].price,
    } : null

    const latestRecord = sortedByDate[sortedByDate.length - 1] ? {
      date: sortedByDate[sortedByDate.length - 1].photoDate,
    } : null

    const pricedRecords = records.filter(r => r.price && r.price > 0)
    const mostExpensive = pricedRecords.length > 0
      ? [...pricedRecords].sort((a, b) => (b.price || 0) - (a.price || 0))[0]
      : null
    const cheapest = pricedRecords.length > 0
      ? [...pricedRecords].sort((a, b) => (a.price || 0) - (b.price || 0))[0]
      : null

    const cityMap = new Map<string, number>()
    records.forEach(r => {
      if (r.city) {
        cityMap.set(r.city, (cityMap.get(r.city) || 0) + 1)
      }
    })
    const topCities = Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const venueMap = new Map<string, number>()
    records.forEach(r => {
      if (r.venue) {
        venueMap.set(r.venue, (venueMap.get(r.venue) || 0) + 1)
      }
    })
    const topVenues = Array.from(venueMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const groupMap = new Map<string, number>()
    records.forEach(r => {
      if (r.groupName) {
        groupMap.set(r.groupName, (groupMap.get(r.groupName) || 0) + 1)
      }
    })
    const topGroups = Array.from(groupMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const monthlyMap = new Map<string, { photos: number; price: number }>()
    records.forEach(r => {
      const date = new Date(r.photoDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = monthlyMap.get(key) || { photos: 0, price: 0 }
      monthlyMap.set(key, {
        photos: current.photos + r.photoCount,
        price: current.price + (r.price || 0),
      })
    })
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)

    const dayOfWeekMap = new Map<number, number>()
    records.forEach(r => {
      const day = new Date(r.photoDate).getDay()
      dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + 1)
    })
    const favoriteDay = Array.from(dayOfWeekMap.entries()).sort((a, b) => b[1] - a[1])[0]
    const favoriteDayOfWeek = favoriteDay ? {
      day: DAY_NAMES[favoriteDay[0]],
      count: favoriteDay[1],
    } : { day: '-', count: 0 }

    const monthMap = new Map<number, number>()
    records.forEach(r => {
      const month = new Date(r.photoDate).getMonth()
      monthMap.set(month, (monthMap.get(month) || 0) + 1)
    })
    const favoriteMonthData = Array.from(monthMap.entries()).sort((a, b) => b[1] - a[1])[0]
    const favoriteMonth = favoriteMonthData ? {
      month: MONTH_NAMES[favoriteMonthData[0]],
      count: favoriteMonthData[1],
    } : { month: '-', count: 0 }

    const typeMap = new Map<string, number>()
    records.forEach(r => {
      if (r.polaroidType) {
        typeMap.set(r.polaroidType, (typeMap.get(r.polaroidType) || 0) + 1)
      }
    })
    const polaroidTypes = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    const now = new Date()
    const daysSinceFirst = firstRecord
      ? Math.floor((now.getTime() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    const daysSinceLast = latestRecord
      ? Math.floor((now.getTime() - new Date(latestRecord.date).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const uniqueDates = new Set(records.map(r => r.photoDate))
    const totalDaysWithRecords = uniqueDates.size
    const averageDaysBetween = totalDaysWithRecords > 1
      ? Math.round(daysSinceFirst / (totalDaysWithRecords - 1))
      : 0

    return {
      success: true,
      data: {
        idolName,
        totalRecords,
        totalPhotos,
        totalPrice,
        averagePrice,
        firstRecord,
        latestRecord,
        mostExpensiveRecord: mostExpensive ? {
          date: mostExpensive.photoDate,
          price: mostExpensive.price || 0,
          photoCount: mostExpensive.photoCount,
        } : null,
        cheapestRecord: cheapest ? {
          date: cheapest.photoDate,
          price: cheapest.price || 0,
          photoCount: cheapest.photoCount,
        } : null,
        topCities,
        topVenues,
        topGroups,
        monthlyData,
        favoriteDayOfWeek,
        favoriteMonth,
        polaroidTypes,
        daysSinceFirst,
        daysSinceLast,
        averageDaysBetween,
        totalDaysWithRecords,
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