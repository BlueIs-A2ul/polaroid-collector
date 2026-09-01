export interface YearlyReport {
  year: number
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  newIdols: string[]
  topIdols: Array<{ name: string; count: number; price: number }>
  topCities: Array<{ name: string; count: number }>
  topVenues: Array<{ name: string; count: number }>
  monthlyData: Array<{ month: number; records: number; photos: number; price: number }>
  firstRecord: { idolName: string; date: string } | null
  mostExpensiveRecord: { idolName: string; price: number; date: string } | null
  averagePrice: number
  totalDays: number
  favoriteDayOfWeek: { day: string; count: number }
}

export interface IdolReport {
  idolName: string
  totalRecords: number
  totalPhotos: number
  totalPrice: number
  averagePrice: number
  firstRecord: { date: string; price?: number } | null
  latestRecord: { date: string } | null
  mostExpensiveRecord: { date: string; price: number; photoCount: number } | null
  cheapestRecord: { date: string; price: number; photoCount: number } | null
  topCities: Array<{ name: string; count: number }>
  topVenues: Array<{ name: string; count: number }>
  topGroups: Array<{ name: string; count: number }>
  monthlyData: Array<{ month: string; photos: number; price: number }>
  favoriteDayOfWeek: { day: string; count: number }
  favoriteMonth: { month: string; count: number }
  polaroidTypes: Array<{ type: string; count: number }>
  daysSinceFirst: number
  daysSinceLast: number
  averageDaysBetween: number
  totalDaysWithRecords: number
}
