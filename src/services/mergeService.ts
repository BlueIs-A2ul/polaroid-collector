import { PolaroidRecord, ServiceResult } from '../types'
import { getAllRecords } from './storageService'
import { deletePhoto } from './photoService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'

interface MergeResult {
  mergedCount: number
  deletedCount: number
  affectedIdols: string[]
}

/**
 * 批量保存所有记录（直接操作存储，避免多次读写）
 */
const saveAllRecords = async (records: PolaroidRecord[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
}

/**
 * 合并同一偶像同一天的记录
 * 将旧数据（每张照片独立记录）按新逻辑合并
 */
export const mergeSameDayRecords = async (): Promise<
  ServiceResult<MergeResult>
> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records || records.length === 0) {
      return {
        success: true,
        data: {
          mergedCount: 0,
          deletedCount: 0,
          affectedIdols: [],
        },
        error: null,
      }
    }

    // 按偶像名称和日期分组
    const groups: Record<string, PolaroidRecord[]> = {}
    const recordsToKeep: PolaroidRecord[] = []
    const recordsToDelete: PolaroidRecord[] = []
    const affectedIdolsSet = new Set<string>()

    records.forEach(record => {
      const key = `${record.idolName}|${record.photoDate}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(record)
    })

    let mergedCount = 0

    // 处理每个分组
    for (const [key, groupRecords] of Object.entries(groups)) {
      if (groupRecords.length <= 1) {
        // 只有一条记录，保留
        recordsToKeep.push(...groupRecords)
        continue
      }

      const [idolName] = key.split('|')
      affectedIdolsSet.add(idolName)

      // 计算合并后的数据
      const totalPhotoCount = groupRecords.reduce(
        (sum, r) => sum + r.photoCount,
        0,
      )
      const totalPrice = groupRecords.reduce(
        (sum, r) => sum + (r.price || 0),
        0,
      )

      // 选择最新的照片作为主照片（按更新时间倒序）
      const sortedByUpdate = [...groupRecords].sort(
        (a, b) => b.updatedAt - a.updatedAt,
      )
      const mainRecord = sortedByUpdate[0]
      const otherRecords = sortedByUpdate.slice(1)

      // 合并备注
      const notes: string[] = []
      groupRecords.forEach((r, index) => {
        if (r.note) {
          notes.push(`[记录${index + 1}] ${r.note}`)
        }
      })
      const mergedNote = notes.join('\n') || mainRecord.note

      // 创建合并后的记录
      const mergedRecord: PolaroidRecord = {
        ...mainRecord,
        photoCount: totalPhotoCount,
        price: totalPrice > 0 ? totalPrice : mainRecord.price,
        note: mergedNote,
        updatedAt: Date.now(),
      }

      recordsToKeep.push(mergedRecord)
      recordsToDelete.push(...otherRecords)
      mergedCount++
    }

    // 一次性保存所有记录
    await saveAllRecords(recordsToKeep)

    // 删除不再需要的照片（不删除主记录使用的照片）
    const keptPhotoUris = new Set(recordsToKeep.map(r => r.photoUri))
    const keptBackPhotoUris = new Set(
      recordsToKeep.map(r => r.backPhotoUri).filter(Boolean),
    )

    for (const record of recordsToDelete) {
      // 只删除不被保留记录使用的照片
      if (!keptPhotoUris.has(record.photoUri)) {
        await deletePhoto(record.photoUri)
      }
      if (record.backPhotoUri && !keptBackPhotoUris.has(record.backPhotoUri)) {
        await deletePhoto(record.backPhotoUri)
      }
    }

    return {
      success: true,
      data: {
        mergedCount,
        deletedCount: recordsToDelete.length,
        affectedIdols: Array.from(affectedIdolsSet),
      },
      error: null,
    }
  } catch (error) {
    console.error('合并记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 预览哪些记录会被合并（不实际执行）
 */
export const previewMergeResult = async (): Promise<
  ServiceResult<{
    groups: { idolName: string; date: string; count: number; totalPhotos: number }[]
    totalGroups: number
    totalRecords: number
  }>
> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records || records.length === 0) {
      return {
        success: true,
        data: {
          groups: [],
          totalGroups: 0,
          totalRecords: 0,
        },
        error: null,
      }
    }

    // 按偶像名称和日期分组
    const groups: Record<string, PolaroidRecord[]> = {}

    records.forEach(record => {
      const key = `${record.idolName}|${record.photoDate}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(record)
    })

    // 只返回有多条记录的组
    const mergeableGroups = Object.entries(groups)
      .filter(([, groupRecords]) => groupRecords.length > 1)
      .map(([key, groupRecords]) => {
        const [idolName, date] = key.split('|')
        return {
          idolName,
          date,
          count: groupRecords.length,
          totalPhotos: groupRecords.reduce((sum, r) => sum + r.photoCount, 0),
        }
      })

    return {
      success: true,
      data: {
        groups: mergeableGroups,
        totalGroups: mergeableGroups.length,
        totalRecords: mergeableGroups.reduce((sum, g) => sum + g.count, 0),
      },
      error: null,
    }
  } catch (error) {
    console.error('预览合并结果失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
