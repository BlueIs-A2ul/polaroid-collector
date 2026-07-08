import { PolaroidRecord, RankingItem } from '../types'

export type SearchType = 'all' | 'idolName' | 'groupName' | 'city' | 'venue'

export type PresenceFilter = 'all' | 'yes' | 'no'

export interface FilterOptions {
  groupName: string | null
  city: string | null
  venue: string | null
  polaroidType: string | null
  minPrice: number | null
  maxPrice: number | null
  hasBackPhoto: PresenceFilter
  hasNote: PresenceFilter
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  groupName: null,
  city: null,
  venue: null,
  polaroidType: null,
  minPrice: null,
  maxPrice: null,
  hasBackPhoto: 'all',
  hasNote: 'all',
}

const normalize = (value: string | undefined): string => {
  return value?.toLowerCase().trim() || ''
}

export const recordHasBackPhoto = (record: PolaroidRecord): boolean => {
  return Boolean(
    record.backPhotoUri ||
    (record.additionalBackPhotoUris && record.additionalBackPhotoUris.length > 0),
  )
}

export const recordHasNote = (record: PolaroidRecord): boolean => {
  return Boolean(record.note?.trim())
}

const matchesRecordText = (
  records: PolaroidRecord[],
  field: keyof Pick<PolaroidRecord, 'groupName' | 'city' | 'venue'>,
  query: string,
): boolean => {
  return records.some(record => normalize(record[field]).includes(query))
}

export const matchesSearch = (
  item: RankingItem,
  searchQuery: string,
  searchType: SearchType,
): boolean => {
  const query = normalize(searchQuery)
  if (!query) return true

  if (searchType === 'idolName') {
    return normalize(item.idolName).includes(query)
  }

  if (searchType === 'groupName') {
    return matchesRecordText(item.records, 'groupName', query)
  }

  if (searchType === 'city') {
    return matchesRecordText(item.records, 'city', query)
  }

  if (searchType === 'venue') {
    return matchesRecordText(item.records, 'venue', query)
  }

  return normalize(item.idolName).includes(query) ||
    item.records.some(record => [
      record.groupName,
      record.city,
      record.venue,
      record.note,
      record.polaroidType,
      record.memberCount,
    ].some(value => normalize(value).includes(query)))
}

export const matchesFilters = (
  record: PolaroidRecord,
  filters: FilterOptions,
): boolean => {
  if (filters.groupName && record.groupName !== filters.groupName) return false
  if (filters.city && record.city !== filters.city) return false
  if (filters.venue && record.venue !== filters.venue) return false
  if (filters.polaroidType && record.polaroidType !== filters.polaroidType) return false

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    if (typeof record.price !== 'number') return false
    if (filters.minPrice !== null && record.price < filters.minPrice) return false
    if (filters.maxPrice !== null && record.price > filters.maxPrice) return false
  }

  if (filters.hasBackPhoto === 'yes' && !recordHasBackPhoto(record)) return false
  if (filters.hasBackPhoto === 'no' && recordHasBackPhoto(record)) return false
  if (filters.hasNote === 'yes' && !recordHasNote(record)) return false
  if (filters.hasNote === 'no' && recordHasNote(record)) return false

  return true
}

export const getActiveFilterCount = (filters: FilterOptions): number => {
  return [
    filters.groupName,
    filters.city,
    filters.venue,
    filters.polaroidType,
    filters.minPrice,
    filters.maxPrice,
    filters.hasBackPhoto !== 'all' ? filters.hasBackPhoto : null,
    filters.hasNote !== 'all' ? filters.hasNote : null,
  ].filter(value => value !== null).length
}

export const filterRankingItems = (
  ranking: RankingItem[],
  searchQuery: string,
  searchType: SearchType,
  filters: FilterOptions,
): RankingItem[] => {
  return ranking.filter(item => {
    if (!matchesSearch(item, searchQuery, searchType)) return false
    return item.records.some(record => matchesFilters(record, filters))
  })
}
