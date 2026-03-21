import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { ServiceResult } from '../types'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { saveRecord, getAllRecords, clearAllRecords } from './storageService'
import { getPhotoBase64 } from './photoService'
import { getAllAvatars } from './avatarService'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PHOTO_DIR = `${(FileSystem as any).documentDirectory}photos/`

interface PhotoBackup {
  originalUri: string
  base64: string
}

interface BackupData {
  version: '2.0.0'
  backupDate: string
  records: any[]
  photos: PhotoBackup[]
  avatars: Record<string, string>
  fieldHistory: Record<string, string[]>
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
      if (record.photoUri) photoUris.add(record.photoUri)
      if (record.backPhotoUri) photoUris.add(record.backPhotoUri)
    })

    const { success: avatarSuccess, data: avatarMap } = await getAllAvatars()
    if (avatarSuccess && avatarMap) {
      Object.values(avatarMap).forEach(uri => {
        if (uri) photoUris.add(uri)
      })
    }

    for (const uri of photoUris) {
      try {
        const { success: base64Success, data: base64 } = await getPhotoBase64(uri)
        if (base64Success && base64) {
          photos.push({ originalUri: uri, base64 })
        }
      } catch (e) {
        console.error('读取照片失败:', uri, e)
      }
    }

    let fieldHistory: Record<string, string[]> = {}
    try {
      const fieldHistoryData = await AsyncStorage.getItem(STORAGE_KEYS.FIELD_HISTORY)
      if (fieldHistoryData) {
        fieldHistory = JSON.parse(fieldHistoryData)
      }
    } catch (e) {
      console.error('读取字段历史失败:', e)
    }

    const backupData: BackupData = {
      version: '2.0.0',
      backupDate: new Date().toISOString(),
      records: records || [],
      photos,
      avatars: avatarMap || {},
      fieldHistory,
    }

    const jsonString = JSON.stringify(backupData)
    const fileName = `polaroid_backup_${Date.now()}.json`
    const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(fileUri, jsonString)

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
    const backupData: BackupData = JSON.parse(fileContent)

    if (!backupData.version) {
      return {
        success: false,
        data: null,
        error: '备份文件格式不正确',
      }
    }

    const { records, photos, avatars, fieldHistory } = backupData

    if (!Array.isArray(records)) {
      return {
        success: false,
        data: null,
        error: '备份数据格式错误',
      }
    }

    await clearAllRecords()

    const uriMapping: Record<string, string> = {}

    if (photos && photos.length > 0) {
      try {
        const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
        }
      } catch {
        await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
      }

      for (const photo of photos) {
        try {
          const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
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

    const newAvatars: Record<string, string> = {}
    for (const record of records) {
      if (record.photoUri && uriMapping[record.photoUri]) {
        record.photoUri = uriMapping[record.photoUri]
      }
      if (record.backPhotoUri && uriMapping[record.backPhotoUri]) {
        record.backPhotoUri = uriMapping[record.backPhotoUri]
      }

      await saveRecord(record)
    }

    if (avatars) {
      for (const [idolName, oldUri] of Object.entries(avatars)) {
        if (oldUri && uriMapping[oldUri]) {
          newAvatars[idolName] = uriMapping[oldUri]
        }
      }
      await AsyncStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(newAvatars))
    }

    if (fieldHistory) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIELD_HISTORY, JSON.stringify(fieldHistory))
    }

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