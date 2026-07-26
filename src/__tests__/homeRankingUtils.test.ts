import {
  SORT_OPTIONS,
  sortRankingItems,
} from '../utils/homeRankingUtils'
import { RankingItem } from '../types'

const createRankingItem = (
  overrides: Partial<RankingItem>,
): RankingItem => ({
  idolName: 'Default',
  totalCount: 0,
  totalPrice: 0,
  records: [],
  latestPhoto: null,
  latestDate: null,
  dates: [],
  ...overrides,
})

describe('homeRankingUtils', () => {
  it('sorts ranking items by latest date without mutating the source array', () => {
    const ranking = [
      createRankingItem({ idolName: 'Older', latestDate: '2026-01-01' }),
      createRankingItem({ idolName: 'Missing', latestDate: null }),
      createRankingItem({ idolName: 'Newer', latestDate: '2026-07-27' }),
    ]

    const sorted = sortRankingItems(ranking, 'date', 'desc')

    expect(sorted.map(item => item.idolName)).toEqual([
      'Newer',
      'Older',
      'Missing',
    ])
    expect(ranking.map(item => item.idolName)).toEqual([
      'Older',
      'Missing',
      'Newer',
    ])
  })

  it('sorts ranking items by count and price in both directions', () => {
    const ranking = [
      createRankingItem({ idolName: 'Low', totalCount: 1, totalPrice: 10 }),
      createRankingItem({ idolName: 'High', totalCount: 5, totalPrice: 50 }),
    ]

    expect(
      sortRankingItems(ranking, 'count', 'asc').map(item => item.idolName),
    ).toEqual(['Low', 'High'])
    expect(
      sortRankingItems(ranking, 'price', 'desc').map(item => item.idolName),
    ).toEqual(['High', 'Low'])
  })

  it('exposes every sort option used by the home screen modal', () => {
    expect(SORT_OPTIONS.map(option => `${option.type}-${option.order}`)).toEqual([
      'date-desc',
      'date-asc',
      'count-desc',
      'count-asc',
      'price-desc',
      'price-asc',
    ])
  })
})
