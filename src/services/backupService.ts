import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { PolaroidRecord, ServiceResult } from '../types'
import { getAllAvatars } from './avatarService'
import { getPhotoBase64 } from './photoService'
import { clearAllRecords, getAllRecords, saveRecord } from './storageService'

const PHOTO_DIR = `${(FileSystem as any).documentDirectory}photos/`
const CURRENT_BACKUP_VERSION = '2.0.0'

interface PhotoBackup {
  originalUri: string
  base64: string
}

interface BackupData {
  version: typeof CURRENT_BACKUP_VERSION
  backupDate: string
  records: PolaroidRecord[]
  photos: PhotoBackup[]
  avatars: Record<string, string>
  fieldHistory: Record<string, string[]>
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isPolaroidRecord = (value: unknown): value is PolaroidRecord => {
  if (!isObjectRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.idolName === 'string' &&
    typeof value.photoCount === 'number' &&
    typeof value.photoDate === 'string' &&
    typeof value.photoUri === 'string' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  )
}

const normalizePhotos = (value: unknown): PhotoBackup[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (photo): photo is PhotoBackup =>
      isObjectRecord(photo) &&
      typeof photo.originalUri === 'string' &&
      typeof photo.base64 === 'string',
  )
}

const normalizeStringMap = (value: unknown): Record<string, string> => {
  if (!isObjectRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (result, [key, mapValue]) => {
      if (typeof mapValue === 'string') {
        result[key] = mapValue
      }
      return result
    },
    {},
  )
}

const normalizeFieldHistory = (
  value: unknown,
): Record<string, string[]> => {
  if (!isObjectRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string[]>>(
    (result, [key, historyValue]) => {
      if (
        Array.isArray(historyValue) &&
        historyValue.every(item => typeof item === 'string')
      ) {
        result[key] = historyValue
      }
      return result
    },
    {},
  )
}

const normalizeBackupData = (
  rawData: unknown,
): ServiceResult<BackupData> => {
  if (!isObjectRecord(rawData)) {
    return {
      success: false,
      data: null,
      error: '备份文件格式不正确',
    }
  }

  const version = rawData.version
  if (
    version !== undefined &&
    version !== '1.0.0' &&
    version !== CURRENT_BACKUP_VERSION
  ) {
    return {
      success: false,
      data: null,
      error: `不支持的备份版本: ${String(version)}`,
    }
  }

  if (!Array.isArray(rawData.records)) {
    return {
      success: false,
      data: null,
      error: '备份数据格式错误',
    }
  }

  if (!rawData.records.every(isPolaroidRecord)) {
    return {
      success: false,
      data: null,
      error: '备份记录格式错误',
    }
  }

  return {
    success: true,
    data: {
      version: CURRENT_BACKUP_VERSION,
      backupDate:
        typeof rawData.backupDate === 'string'
          ? rawData.backupDate
          : new Date().toISOString(),
      records: rawData.records,
      photos: normalizePhotos(rawData.photos),
      avatars: normalizeStringMap(rawData.avatars),
      fieldHistory: normalizeFieldHistory(rawData.fieldHistory),
    },
    error: null,
  }
}

const addPhotoUri = (photoUris: Set<string>, uri?: string): void => {
  if (uri) {
    photoUris.add(uri)
  }
}

const remapUri = (
  uri: string | undefined,
  uriMapping: Record<string, string>,
): string | undefined => {
  if (!uri) {
    return uri
  }
  return uriMapping[uri] || uri
}

const remapUriList = (
  uris: string[] | undefined,
  uriMapping: Record<string, string>,
): string[] | undefined => {
  if (!uris) {
    return undefined
  }
  return uris.map(uri => uriMapping[uri] || uri)
}

export const createBackup = async (): Promise<ServiceResult<string>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success) {
      return {
        success: false,
        data: null,
        error: error || '获取数据失败',
      }
    }

    const photos: PhotoBackup[] = []
    const photoUris = new Set<string>()

    records?.forEach(record => {
      addPhotoUri(photoUris, record.photoUri)
      addPhotoUri(photoUris, record.backPhotoUri)
      record.additionalPhotoUris?.forEach(uri => addPhotoUri(photoUris, uri))
      record.additionalBackPhotoUris?.forEach(uri =>
        addPhotoUri(photoUris, uri),
      )
    })

    const { success: avatarSuccess, data: avatarMap } = await getAllAvatars()
    if (avatarSuccess && avatarMap) {
      Object.values(avatarMap).forEach(uri => addPhotoUri(photoUris, uri))
    }

    for (const uri of photoUris) {
      try {
        const { success: base64Success, data: base64 } =
          await getPhotoBase64(uri)
        if (base64Success && base64) {
          photos.push({ originalUri: uri, base64 })
        }
      } catch (e) {
        console.error('读取照片失败:', uri, e)
      }
    }

    let fieldHistory: Record<string, string[]> = {}
    try {
      const fieldHistoryData = await AsyncStorage.getItem(
        STORAGE_KEYS.FIELD_HISTORY,
      )
      if (fieldHistoryData) {
        fieldHistory = normalizeFieldHistory(JSON.parse(fieldHistoryData))
      }
    } catch (e) {
      console.error('读取字段历史失败:', e)
    }

    const backupData: BackupData = {
      version: CURRENT_BACKUP_VERSION,
      backupDate: new Date().toISOString(),
      records: records || [],
      photos,
      avatars: avatarMap || {},
      fieldHistory,
    }

    const fileName = `polaroid_backup_${Date.now()}.json`
    const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData))

    return {
      success: true,
      data: fileUri,
      error: null,
    }
  } catch (error) {
    console.error('创建备份失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const restoreFromBackup = async (
  backupUri: string,
): Promise<ServiceResult<void>> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(backupUri)
    const parsedBackup = normalizeBackupData(JSON.parse(fileContent))

    if (!parsedBackup.success || !parsedBackup.data) {
      return {
        success: false,
        data: null,
        error: parsedBackup.error,
      }
    }

    const { records, photos, avatars, fieldHistory } = parsedBackup.data

    await clearAllRecords()

    const uriMapping: Record<string, string> = {}

    if (photos.length > 0) {
      try {
        const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(PHOTO_DIR, {
            intermediates: true,
          })
        }
      } catch {
        await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
      }

      for (const photo of photos) {
        try {
          const filename = `${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}.jpg`
          const newUri = `${PHOTO_DIR}${filename}`

          await FileSystem.writeAsStringAsync(newUri, photo.base64, {
            encoding: (FileSystem as any).EncodingType.Base64,
          })

          uriMapping[photo.originalUri] = newUri
        } catch (e) {
          console.error('恢复照片失败:', e)
        }
      }
    }

    for (const record of records) {
      const restoredRecord: PolaroidRecord = {
        ...record,
        photoUri: remapUri(record.photoUri, uriMapping) || record.photoUri,
        backPhotoUri: remapUri(record.backPhotoUri, uriMapping),
        additionalPhotoUris: remapUriList(
          record.additionalPhotoUris,
          uriMapping,
        ),
        additionalBackPhotoUris: remapUriList(
          record.additionalBackPhotoUris,
          uriMapping,
        ),
      }

      await saveRecord(restoredRecord)
    }

    const newAvatars: Record<string, string> = {}
    for (const [idolName, oldUri] of Object.entries(avatars)) {
      if (oldUri && uriMapping[oldUri]) {
        newAvatars[idolName] = uriMapping[oldUri]
      } else if (oldUri) {
        newAvatars[idolName] = oldUri
      }
    }
    await AsyncStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(newAvatars))
    await AsyncStorage.setItem(
      STORAGE_KEYS.FIELD_HISTORY,
      JSON.stringify(fieldHistory),
    )

    return {
      success: true,
      data: null,
      error: null,
    }
  } catch (error) {
    console.error('恢复备份失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const shareBackupFile = async (fileUri: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync()
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: '分享备份文件',
      })
    }
  } catch (error) {
    console.error('分享备份文件失败:', error)
    throw error
  }
}
