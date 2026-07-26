import { RankingItem } from '../types'

export type SortType = 'date' | 'count' | 'price'
export type SortOrder = 'asc' | 'desc'

interface SortOption {
  type: SortType
  order: SortOrder
  label: string
}

export const SORT_OPTIONS: SortOption[] = [
  { type: 'date', order: 'desc', label: '最新日期' },
  { type: 'date', order: 'asc', label: '最早日期' },
  { type: 'count', order: 'desc', label: '数量最多' },
  { type: 'count', order: 'asc', label: '数量最少' },
  { type: 'price', order: 'desc', label: '花费最高' },
  { type: 'price', order: 'asc', label: '花费最低' },
]

export const sortRankingItems = (
  ranking: RankingItem[],
  sortBy: SortType,
  sortOrder: SortOrder,
): RankingItem[] => {
  return [...ranking].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.latestDate ? new Date(a.latestDate).getTime() : 0
      const dateB = b.latestDate ? new Date(b.latestDate).getTime() : 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    }

    if (sortBy === 'count') {
      return sortOrder === 'desc'
        ? b.totalCount - a.totalCount
        : a.totalCount - b.totalCount
    }

    if (sortBy === 'price') {
      return sortOrder === 'desc'
        ? b.totalPrice - a.totalPrice
        : a.totalPrice - b.totalPrice
    }

    return 0
  })
}
