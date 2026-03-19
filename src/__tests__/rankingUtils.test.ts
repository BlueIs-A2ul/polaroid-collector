import {
  calculateRanking,
  sortRecordsByDate,
  formatDate,
  getTodayDateString,
  generateId,
} from '../utils/rankingUtils'
import { PolaroidRecord } from '../types'

describe('rankingUtils', () => {
  const createMockRecord = (
    id: string,
    idolName: string,
    photoCount: number,
    photoDate: string,
    photoUri: string = `uri_${id}`,
  ): PolaroidRecord => ({
    id,
    idolName,
    photoCount,
    photoDate,
    photoUri,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  describe('calculateRanking', () => {
    it('should return empty array for empty records', () => {
      const ranking = calculateRanking([])
      expect(ranking).toEqual([])
    })

    it('should calculate total count per idol', () => {
      const records = [
        createMockRecord('1', 'idolA', 3, '2026-01-01'),
        createMockRecord('2', 'idolA', 2, '2026-01-02'),
        createMockRecord('3', 'idolB', 5, '2026-01-01'),
      ]

      const ranking = calculateRanking(records)

      expect(ranking).toHaveLength(2)
      expect(ranking.find(r => r.idolName === 'idolA')?.totalCount).toBe(5)
      expect(ranking.find(r => r.idolName === 'idolB')?.totalCount).toBe(5)
    })

    it('should sort by total count descending', () => {
      const records = [
        createMockRecord('1', 'idolA', 3, '2026-01-01'),
        createMockRecord('2', 'idolB', 10, '2026-01-01'),
        createMockRecord('3', 'idolC', 5, '2026-01-01'),
      ]

      const ranking = calculateRanking(records)

      expect(ranking[0].idolName).toBe('idolB')
      expect(ranking[0].totalCount).toBe(10)
      expect(ranking[1].idolName).toBe('idolC')
      expect(ranking[2].idolName).toBe('idolA')
    })

    it('should track latest photo and date', () => {
      const records = [
        createMockRecord('1', 'idolA', 1, '2026-01-01', 'old_photo'),
        createMockRecord('2', 'idolA', 1, '2026-01-03', 'new_photo'),
        createMockRecord('3', 'idolA', 1, '2026-01-02', 'mid_photo'),
      ]

      const ranking = calculateRanking(records)

      expect(ranking[0].latestPhoto).toBe('new_photo')
      expect(ranking[0].latestDate).toBe('2026-01-03')
    })

    it('should collect all dates for each idol', () => {
      const records = [
        createMockRecord('1', 'idolA', 1, '2026-01-01'),
        createMockRecord('2', 'idolA', 1, '2026-01-03'),
        createMockRecord('3', 'idolA', 1, '2026-01-02'),
      ]

      const ranking = calculateRanking(records)

      expect(ranking[0].dates).toHaveLength(3)
      expect(ranking[0].dates).toContain('2026-01-01')
      expect(ranking[0].dates).toContain('2026-01-02')
      expect(ranking[0].dates).toContain('2026-01-03')
    })
  })

  describe('sortRecordsByDate', () => {
    const createRecordWithDate = (date: string) =>
      createMockRecord(date, 'idol', 1, date)

    it('should sort records ascending by date', () => {
      const records = [
        createRecordWithDate('2026-03-01'),
        createRecordWithDate('2026-01-01'),
        createRecordWithDate('2026-02-01'),
      ]

      const sorted = sortRecordsByDate(records, true)

      expect(sorted[0].photoDate).toBe('2026-01-01')
      expect(sorted[1].photoDate).toBe('2026-02-01')
      expect(sorted[2].photoDate).toBe('2026-03-01')
    })

    it('should sort records descending by date', () => {
      const records = [
        createRecordWithDate('2026-01-01'),
        createRecordWithDate('2026-03-01'),
        createRecordWithDate('2026-02-01'),
      ]

      const sorted = sortRecordsByDate(records, false)

      expect(sorted[0].photoDate).toBe('2026-03-01')
      expect(sorted[1].photoDate).toBe('2026-02-01')
      expect(sorted[2].photoDate).toBe('2026-01-01')
    })

    it('should default to ascending order', () => {
      const records = [
        createRecordWithDate('2026-03-01'),
        createRecordWithDate('2026-01-01'),
      ]

      const sorted = sortRecordsByDate(records)

      expect(sorted[0].photoDate).toBe('2026-01-01')
    })

    it('should not mutate original array', () => {
      const records = [
        createRecordWithDate('2026-03-01'),
        createRecordWithDate('2026-01-01'),
      ]

      sortRecordsByDate(records, true)

      expect(records[0].photoDate).toBe('2026-03-01')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2026-01-05')).toBe('2026.01.05')
      expect(formatDate('2026-12-31')).toBe('2026.12.31')
    })

    it('should handle single digit month and day', () => {
      expect(formatDate('2026-3-7')).toBe('2026.03.07')
    })
  })

  describe('getTodayDateString', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const today = getTodayDateString()
      const regex = /^\d{4}-\d{2}-\d{2}$/
      expect(today).toMatch(regex)
    })

    it('should return correct date', () => {
      const today = new Date()
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      expect(getTodayDateString()).toBe(expected)
    })
  })

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('should generate unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(100)
    })

    it('should match expected format', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })
})