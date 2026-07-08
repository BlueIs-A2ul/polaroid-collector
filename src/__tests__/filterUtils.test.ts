import {
  DEFAULT_FILTER_OPTIONS,
  filterRankingItems,
  getActiveFilterCount,
  recordHasBackPhoto,
  recordHasNote,
} from '../utils/filterUtils'
import { RankingItem } from '../types'

const createItem = (
  idolName: string,
  overrides: Partial<RankingItem> = {},
): RankingItem => ({
  idolName,
  totalCount: 1,
  totalPrice: 0,
  latestPhoto: null,
  latestDate: null,
  dates: [],
  records: [],
  ...overrides,
})

describe('filterUtils', () => {
  const ranking: RankingItem[] = [
    createItem('Alice', {
      totalPrice: 120,
      records: [
        {
          id: '1',
          idolName: 'Alice',
          photoCount: 1,
          photoDate: '2026-01-01',
          photoUri: 'alice.jpg',
          backPhotoUri: 'alice-back.jpg',
          price: 120,
          note: '签售场很可爱',
          groupName: 'Aurora',
          city: 'Shanghai',
          venue: 'Mercedes',
          polaroidType: '带签',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    }),
    createItem('Bella', {
      totalPrice: 45,
      records: [
        {
          id: '2',
          idolName: 'Bella',
          photoCount: 1,
          photoDate: '2026-02-01',
          photoUri: 'bella.jpg',
          additionalBackPhotoUris: ['bella-extra-back.jpg'],
          price: 45,
          groupName: 'Bloom',
          city: 'Beijing',
          venue: 'Live House',
          polaroidType: '无签',
          createdAt: 2,
          updatedAt: 2,
        },
      ],
    }),
    createItem('Cindy', {
      totalPrice: 0,
      records: [
        {
          id: '3',
          idolName: 'Cindy',
          photoCount: 1,
          photoDate: '2026-03-01',
          photoUri: 'cindy.jpg',
          groupName: 'Aurora',
          city: 'Guangzhou',
          venue: 'Theater',
          polaroidType: '主题',
          createdAt: 3,
          updatedAt: 3,
        },
      ],
    }),
  ]

  it('searches all supported fields when search type is all', () => {
    const result = filterRankingItems(ranking, '签售场', 'all', DEFAULT_FILTER_OPTIONS)

    expect(result.map(item => item.idolName)).toEqual(['Alice'])
  })

  it('filters records by price range', () => {
    const result = filterRankingItems(ranking, '', 'all', {
      ...DEFAULT_FILTER_OPTIONS,
      minPrice: 40,
      maxPrice: 100,
    })

    expect(result.map(item => item.idolName)).toEqual(['Bella'])
  })

  it('filters records by back photo presence', () => {
    const result = filterRankingItems(ranking, '', 'all', {
      ...DEFAULT_FILTER_OPTIONS,
      hasBackPhoto: 'yes',
    })

    expect(result.map(item => item.idolName)).toEqual(['Alice', 'Bella'])
  })

  it('filters records by missing note', () => {
    const result = filterRankingItems(ranking, '', 'all', {
      ...DEFAULT_FILTER_OPTIONS,
      hasNote: 'no',
    })

    expect(result.map(item => item.idolName)).toEqual(['Bella', 'Cindy'])
  })

  it('counts active filters', () => {
    expect(getActiveFilterCount({
      ...DEFAULT_FILTER_OPTIONS,
      groupName: 'Aurora',
      minPrice: 20,
      hasNote: 'yes',
    })).toBe(3)
  })

  it('detects back photo and note presence on a record', () => {
    expect(recordHasBackPhoto(ranking[1].records[0])).toBe(true)
    expect(recordHasNote(ranking[0].records[0])).toBe(true)
    expect(recordHasNote(ranking[1].records[0])).toBe(false)
  })
})
