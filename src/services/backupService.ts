import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { ServiceResult } from '../types'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { saveRecord, getAllRecords, clearAllRecords } from './storageService'

/**
 * 备份服务
 * 负责数据备份和恢复
 */

/**
 * 创建数据备份
 * @returns 备份结果
 */
export const createBackup = async (): Promise<ServiceResult<string>> => {
  try {
    // 读取所有存储的数据
    const { success, data: records, error } = await getAllRecords()

    if (!success) {
      return {
        success: false,
        data: null,
        error: error || '获取数据失败',
      }
    }

    // 创建备份数据
    const backupData = {
      version: '1.0.0',
      backupDate: new Date().toISOString(),
      data: {
        records: records || [],
      },
    }

    const jsonString = JSON.stringify(backupData, null, 2)
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

/**
 * 从备份恢复数据
 * @param backupUri - 备份文件 URI
 * @returns 恢复结果
 */
export const restoreFromBackup = async (
  backupUri: string,
): Promise<ServiceResult<void>> => {
  try {
    // 读取备份文件
    const fileContent = await FileSystem.readAsStringAsync(backupUri)
    const backupData = JSON.parse(fileContent)

    // 验证备份格式
    if (!backupData.version || !backupData.data) {
      return {
        success: false,
        data: null,
        error: '备份文件格式不正确',
      }
    }

    const { records } = backupData.data

    if (!Array.isArray(records)) {
      return {
        success: false,
        data: null,
        error: '备份数据格式错误',
      }
    }

    // 清除现有数据
    await clearAllRecords()

    // 恢复数据
    for (const record of records) {
      const { error: saveError } = await saveRecord(record)
      if (saveError) {
        console.error('恢复记录失败:', saveError)
      }
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

/**
 * 分享备份文件
 * @param fileUri - 文件 URI
 */
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
