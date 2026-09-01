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
  deleteRecordsByIdolNames: jest.fn(),
  updateRecordsByIdolNames: jest.fn(),
}))

import {
  getAllRecords as storageGetAllRecords,
  getRecordById as storageGetRecordById,
  deleteRecordsByIdolNames as storageDeleteRecordsByIdolNames,
  updateRecordsByIdolNames as storageUpdateRecordsByIdolNames,
} from '../services/storageService'
import {
  createRecord,
  updateRecordData,
  deleteRecordData,
  createMultipleRecords,
  deleteRecordsByIdolNames,
  updateRecordsByIdolNames,
} from '../services/recordCommandService'
import {
  getRanking,
  getIdolDetail,
  getAllIdolNames,
  getIdolListWithCount,
  getAllRecords,
  getRecordById,
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

  it('forwards record queries to storageService', async () => {
    await getAllRecords()
    expect(storageGetAllRecords).toHaveBeenCalled()

    await getRecordById('test-id')
    expect(storageGetRecordById).toHaveBeenCalledWith('test-id')
  })

  it('forwards batch record commands to storageService', async () => {
    await deleteRecordsByIdolNames(['偶像A'])
    expect(storageDeleteRecordsByIdolNames).toHaveBeenCalledWith(['偶像A'])

    await updateRecordsByIdolNames(['偶像A'], { city: '上海' })
    expect(storageUpdateRecordsByIdolNames).toHaveBeenCalledWith(['偶像A'], { city: '上海' })
  })
})
