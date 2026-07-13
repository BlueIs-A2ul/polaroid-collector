jest.mock('../services/photoService', () => ({
  savePhoto: jest.fn(),
  deletePhoto: jest.fn(),
}))

jest.mock('../services/storageService', () => ({
  saveRecord: jest.fn(),
  getAllRecords: jest.fn(),
  getRecordById: jest.fn(),
  getRecordsByIdolName: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}))

import {
  createRecord,
  updateRecordData,
  deleteRecordData,
  createMultipleRecords,
} from '../services/recordCommandService'
import {
  getRanking,
  getIdolDetail,
  getAllIdolNames,
  getIdolListWithCount,
} from '../services/recordQueryService'
import {
  getStatistics,
  getMonthlySpending,
} from '../services/recordStatsService'

describe('record service boundaries', () => {
  it('exposes record command operations from recordCommandService', () => {
    expect(createRecord).toEqual(expect.any(Function))
    expect(updateRecordData).toEqual(expect.any(Function))
    expect(deleteRecordData).toEqual(expect.any(Function))
    expect(createMultipleRecords).toEqual(expect.any(Function))
  })

  it('exposes record query operations from recordQueryService', () => {
    expect(getRanking).toEqual(expect.any(Function))
    expect(getIdolDetail).toEqual(expect.any(Function))
    expect(getAllIdolNames).toEqual(expect.any(Function))
    expect(getIdolListWithCount).toEqual(expect.any(Function))
  })

  it('exposes record stats operations from recordStatsService', () => {
    expect(getStatistics).toEqual(expect.any(Function))
    expect(getMonthlySpending).toEqual(expect.any(Function))
  })
})
