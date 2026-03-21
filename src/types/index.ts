export interface PolaroidRecord {
  id: string
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string
  price?: number
  note?: string
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
  createdAt: number
  updatedAt: number
}

export interface RankingItem {
  idolName: string
  totalCount: number
  totalPrice: number
  records: PolaroidRecord[]
  latestPhoto: string | null
  latestDate: string | null
  dates: string[]
}

export interface IdolDetail {
  idolName: string
  totalCount: number
  totalPrice: number
  records: PolaroidRecord[]
  latestPhoto: string
  totalRecords: number
}

export interface Statistics {
  totalRecords: number
  totalPhotos: number
  uniqueIdols: number
  totalPrice: number
  groupStats: FieldStat[]
  cityStats: FieldStat[]
  venueStats: FieldStat[]
}

export interface FieldStat {
  name: string
  count: number
}

export interface ServiceResult<T = any> {
  success: boolean
  data: T | null
  error: string | null
}

export interface CreateRecordData {
  idolName: string
  photoCount: number
  photoDate: string
  photoUri: string
  backPhotoUri?: string
  price?: number
  note?: string
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
}

export interface UpdateRecordData {
  idolName?: string
  photoCount?: number
  photoDate?: string
  photoUri?: string
  backPhotoUri?: string
  price?: number
  note?: string
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
}

export interface PhotoItem {
  uri: string
  count: number
  backPhotoUri?: string
  price?: number
  note?: string
  groupName?: string
  city?: string
  venue?: string
  polaroidType?: string
  memberCount?: string
}

export interface MonthlySpending {
  year: number
  month: number
  totalSpending: number
  recordCount: number
  label: string
}