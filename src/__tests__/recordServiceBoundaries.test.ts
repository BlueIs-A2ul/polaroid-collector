jest.mock('../services/photoService', () => ({
  savePhoto: jest.fn(),
  deletePhoto: jest.fn(),
}))

jest.mock('../services/storageService', () => ({
  saveRecord: jest.fn(),
  getRecordById: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}))

import {
  createRecord,
  updateRecordData,
  deleteRecordData,
  createMultipleRecords,
} from '../services/recordCommandService'

describe('record service boundaries', () => {
  it('exposes record command operations from recordCommandService', () => {
    expect(createRecord).toEqual(expect.any(Function))
    expect(updateRecordData).toEqual(expect.any(Function))
    expect(deleteRecordData).toEqual(expect.any(Function))
    expect(createMultipleRecords).toEqual(expect.any(Function))
  })
})
