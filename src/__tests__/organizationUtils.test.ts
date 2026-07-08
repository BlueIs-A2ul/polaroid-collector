import { PolaroidRecord } from '../types'
import {
  getDuplicateCandidates,
  getIncompleteRecords,
  getOrganizationSummary,
} from '../utils/organizationUtils'

const createRecord = (
  overrides: Partial<PolaroidRecord>,
): PolaroidRecord => ({
  id: 'record-1',
  idolName: 'Mina',
  photoCount: 1,
  photoDate: '2026-07-01',
  photoUri: 'front-1.jpg',
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

describe('organizationUtils', () => {
  it('detects records with the same idol and date as duplicate candidates', () => {
    const records = [
      createRecord({ id: 'a', photoCount: 1 }),
      createRecord({ id: 'b', photoCount: 2, photoUri: 'front-2.jpg' }),
      createRecord({
        id: 'c',
        idolName: 'Sana',
        photoDate: '2026-07-01',
      }),
    ]

    const candidates = getDuplicateCandidates(records)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      idolName: 'Mina',
      photoDate: '2026-07-01',
      recordCount: 2,
      totalPhotos: 3,
    })
    expect(candidates[0].records.map(record => record.id)).toEqual(['a', 'b'])
  })

  it('raises confidence when duplicate candidates share price and location', () => {
    const records = [
      createRecord({
        id: 'a',
        price: 20,
        city: '上海',
        venue: '梅赛德斯奔驰文化中心',
      }),
      createRecord({
        id: 'b',
        price: 20,
        city: '上海',
        venue: '梅赛德斯奔驰文化中心',
      }),
    ]

    const [candidate] = getDuplicateCandidates(records)

    expect(candidate.confidence).toBe('high')
    expect(candidate.reasons).toEqual(
      expect.arrayContaining(['价格一致', '城市一致', '场馆一致']),
    )
  })

  it('reports missing organization fields for incomplete records', () => {
    const records = [
      createRecord({
        id: 'a',
        groupName: '',
        city: '上海',
        venue: undefined,
        price: undefined,
        backPhotoUri: undefined,
        note: '已确认',
        polaroidType: '',
        memberCount: undefined,
      }),
      createRecord({
        id: 'b',
        groupName: 'TWICE',
        city: '上海',
        venue: '梅赛德斯奔驰文化中心',
        price: 20,
        backPhotoUri: 'back.jpg',
        note: '完整',
        polaroidType: '带签',
        memberCount: '单人',
      }),
    ]

    const issues = getIncompleteRecords(records)

    expect(issues).toHaveLength(1)
    expect(issues[0].record.id).toBe('a')
    expect(issues[0].missingFields.map(field => field.key)).toEqual([
      'groupName',
      'venue',
      'price',
      'backPhoto',
      'polaroidType',
      'memberCount',
    ])
  })

  it('summarizes duplicate and incomplete record counts', () => {
    const records = [
      createRecord({ id: 'a', price: 10 }),
      createRecord({ id: 'b', price: 10, photoUri: 'front-2.jpg' }),
      createRecord({
        id: 'c',
        idolName: 'Sana',
        groupName: 'TWICE',
        city: '上海',
        venue: '梅赛德斯奔驰文化中心',
        price: 20,
        backPhotoUri: 'back.jpg',
        note: '完整',
        polaroidType: '带签',
        memberCount: '单人',
      }),
    ]

    const summary = getOrganizationSummary(records)

    expect(summary.duplicateGroupCount).toBe(1)
    expect(summary.duplicateRecordCount).toBe(2)
    expect(summary.incompleteRecordCount).toBe(2)
    expect(summary.missingFieldCount).toBeGreaterThan(0)
  })
})
