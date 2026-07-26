import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { createBackup, restoreFromBackup } from '../services/backupService'
import { PolaroidRecord } from '../types'

const mockStorage: Record<string, string> = {}
const mockFiles: Record<string, string> = {}

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value
    return Promise.resolve()
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key]
    return Promise.resolve()
  }),
}))

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  EncodingType: {
    Base64: 'base64',
  },
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn((uri: string) => {
    if (!(uri in mockFiles)) {
      return Promise.reject(new Error(`Missing file: ${uri}`))
    }
    return Promise.resolve(mockFiles[uri])
  }),
  writeAsStringAsync: jest.fn((uri: string, content: string) => {
    mockFiles[uri] = content
    return Promise.resolve()
  }),
}))

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock('expo-image-picker', () => ({}))
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}))
jest.mock('expo-media-library', () => ({}))

const createRecord = (
  overrides: Partial<PolaroidRecord> = {},
): PolaroidRecord => ({
  id: 'record-1',
  idolName: 'Test Idol',
  photoCount: 1,
  photoDate: '2026-07-25',
  photoUri: 'file:///photos/front.jpg',
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

const getStoredRecords = (): PolaroidRecord[] =>
  JSON.parse(mockStorage[STORAGE_KEYS.RECORDS] ?? '[]')

describe('backupService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key]
    }
    for (const key of Object.keys(mockFiles)) {
      delete mockFiles[key]
    }
  })

  it('includes front, back, and additional photo files when creating a backup', async () => {
    const record = createRecord({
      backPhotoUri: 'file:///photos/back.jpg',
      additionalPhotoUris: [
        'file:///photos/extra-front-1.jpg',
        'file:///photos/extra-front-2.jpg',
      ],
      additionalBackPhotoUris: ['file:///photos/extra-back-1.jpg'],
    })
    mockStorage[STORAGE_KEYS.RECORDS] = JSON.stringify([record])
    for (const uri of [
      record.photoUri,
      record.backPhotoUri,
      ...(record.additionalPhotoUris ?? []),
      ...(record.additionalBackPhotoUris ?? []),
    ]) {
      if (uri) {
        mockFiles[uri] = `base64:${uri}`
      }
    }

    const result = await createBackup()

    expect(result.success).toBe(true)
    const backup = JSON.parse(mockFiles[result.data as string])
    const backedUpUris = backup.photos.map(
      (photo: { originalUri: string }) => photo.originalUri,
    )
    expect(backedUpUris).toEqual([
      'file:///photos/front.jpg',
      'file:///photos/back.jpg',
      'file:///photos/extra-front-1.jpg',
      'file:///photos/extra-front-2.jpg',
      'file:///photos/extra-back-1.jpg',
    ])
  })

  it('restores legacy backups that do not have an explicit version', async () => {
    const legacyRecord = createRecord({
      id: 'legacy-record',
      photoUri: 'file:///photos/legacy-front.jpg',
    })
    mockFiles['file:///legacy-backup.json'] = JSON.stringify({
      backupDate: '2026-07-25T00:00:00.000Z',
      records: [legacyRecord],
    })

    const result = await restoreFromBackup('file:///legacy-backup.json')

    expect(result.success).toBe(true)
    expect(getStoredRecords()).toEqual([legacyRecord])
  })

  it('rewrites additional photo URIs when restoring a v2 backup with embedded photos', async () => {
    const record = createRecord({
      photoUri: 'old-front',
      backPhotoUri: 'old-back',
      additionalPhotoUris: ['old-extra-front'],
      additionalBackPhotoUris: ['old-extra-back'],
    })
    mockFiles['file:///backup.json'] = JSON.stringify({
      version: '2.0.0',
      backupDate: '2026-07-25T00:00:00.000Z',
      records: [record],
      photos: [
        { originalUri: 'old-front', base64: 'front-data' },
        { originalUri: 'old-back', base64: 'back-data' },
        { originalUri: 'old-extra-front', base64: 'extra-front-data' },
        { originalUri: 'old-extra-back', base64: 'extra-back-data' },
      ],
      avatars: {},
      fieldHistory: {},
    })

    const result = await restoreFromBackup('file:///backup.json')

    expect(result.success).toBe(true)
    const [restoredRecord] = getStoredRecords()
    expect(restoredRecord.photoUri).toMatch(/^file:\/\/\/documents\/photos\//)
    expect(restoredRecord.backPhotoUri).toMatch(/^file:\/\/\/documents\/photos\//)
    expect(restoredRecord.additionalPhotoUris?.[0]).toMatch(
      /^file:\/\/\/documents\/photos\//,
    )
    expect(restoredRecord.additionalBackPhotoUris?.[0]).toMatch(
      /^file:\/\/\/documents\/photos\//,
    )
  })

  it('rejects unsupported backup versions without clearing existing records', async () => {
    const existingRecord = createRecord({ id: 'existing-record' })
    mockStorage[STORAGE_KEYS.RECORDS] = JSON.stringify([existingRecord])
    mockFiles['file:///unsupported-backup.json'] = JSON.stringify({
      version: '9.0.0',
      backupDate: '2026-07-25T00:00:00.000Z',
      records: [],
      photos: [],
      avatars: {},
      fieldHistory: {},
    })

    const result = await restoreFromBackup('file:///unsupported-backup.json')

    expect(result.success).toBe(false)
    expect(result.error).toContain('不支持')
    expect(getStoredRecords()).toEqual([existingRecord])
    expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith(STORAGE_KEYS.RECORDS)
  })
})
