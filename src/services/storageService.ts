import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { PolaroidRecord, ServiceResult } from '../types'

/**
 * 存储服务
 * 负责拍立得记录的本地存储和检索
 */

/**
 * 保存拍立得记录
 * @param record - 要保存的记录
 * @returns 保存结果
 */
export const saveRecord = async (
  record: PolaroidRecord,
): Promise<ServiceResult<PolaroidRecord>> => {
  try {
    const records = await getAllRecords()
    if (!records.data) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }
    const updatedRecords = [...records.data, record]
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECORDS,
      JSON.stringify(updatedRecords),
    )
    await updateLastUpdated()

    return {
      success: true,
      data: record,
      error: null,
    }
  } catch (error) {
    console.error('保存记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 获取所有拍立得记录
 * @returns 查询结果
 */
export const getAllRecords = async (): Promise<
  ServiceResult<PolaroidRecord[]>
> => {
  try {
    const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS)
    const records = recordsJson
      ? (JSON.parse(recordsJson) as PolaroidRecord[])
      : []

    return {
      success: true,
      data: records,
      error: null,
    }
  } catch (error) {
    console.error('获取记录失败:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 根据ID获取单条记录
 * @param id - 记录ID
 * @returns 查询结果
 */
export const getRecordById = async (
  id: string,
): Promise<ServiceResult<PolaroidRecord>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }

    const record = records.find(r => r.id === id)

    if (!record) {
      return {
        success: false,
        data: null,
        error: '记录不存在',
      }
    }

    return {
      success: true,
      data: record,
      error: null,
    }
  } catch (error) {
    console.error('获取记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 根据偶像名称获取所有记录
 * @param idolName - 偶像名称
 * @returns 查询结果
 */
export const getRecordsByIdolName = async (
  idolName: string,
): Promise<ServiceResult<PolaroidRecord[]>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: [],
        error: '获取记录失败',
      }
    }

    const idolRecords = records.filter(r => r.idolName === idolName)

    return {
      success: true,
      data: idolRecords,
      error: null,
    }
  } catch (error) {
    console.error('获取记录失败:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 更新拍立得记录
 * @param id - 记录ID
 * @param updatedData - 更新的数据
 * @returns 更新结果
 */
export const updateRecord = async (
  id: string,
  updatedData: Partial<PolaroidRecord>,
): Promise<ServiceResult<PolaroidRecord>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }

    const index = records.findIndex(r => r.id === id)
    if (index === -1) {
      return {
        success: false,
        data: null,
        error: '记录不存在',
      }
    }

    const updatedRecord: PolaroidRecord = {
      ...records[index],
      ...updatedData,
      updatedAt: Date.now(),
    }

    records[index] = updatedRecord
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
    await updateLastUpdated()

    return {
      success: true,
      data: updatedRecord,
      error: null,
    }
  } catch (error) {
    console.error('更新记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 删除拍立得记录
 * @param id - 记录ID
 * @returns 删除结果
 */
export const deleteRecord = async (
  id: string,
): Promise<ServiceResult<string>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }

    const filteredRecords = records.filter(r => r.id !== id)
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECORDS,
      JSON.stringify(filteredRecords),
    )
    await updateLastUpdated()

    return {
      success: true,
      data: id,
      error: null,
    }
  } catch (error) {
    console.error('删除记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const deleteRecordsByIdolNames = async (
  idolNames: string[],
): Promise<ServiceResult<number>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }

    const filteredRecords = records.filter(r => !idolNames.includes(r.idolName))
    const deletedCount = records.length - filteredRecords.length
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECORDS,
      JSON.stringify(filteredRecords),
    )
    await updateLastUpdated()

    return {
      success: true,
      data: deletedCount,
      error: null,
    }
  } catch (error) {
    console.error('批量删除记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const updateRecordsByIdolNames = async (
  idolNames: string[],
  updates: Partial<PolaroidRecord>,
): Promise<ServiceResult<number>> => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: '获取记录失败',
      }
    }

    let updatedCount = 0
    const updatedRecords = records.map(r => {
      if (idolNames.includes(r.idolName)) {
        updatedCount++
        return {
          ...r,
          ...updates,
          updatedAt: Date.now(),
        }
      }
      return r
    })

    await AsyncStorage.setItem(
      STORAGE_KEYS.RECORDS,
      JSON.stringify(updatedRecords),
    )
    await updateLastUpdated()

    return {
      success: true,
      data: updatedCount,
      error: null,
    }
  } catch (error) {
    console.error('批量更新记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 清空所有记录
 * @returns 清空结果
 */
export const clearAllRecords = async (): Promise<ServiceResult<null>> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECORDS)
    await updateLastUpdated()

    return {
      success: true,
      data: null,
      error: null,
    }
  } catch (error) {
    console.error('清空记录失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 获取最后更新时间
 * @returns 查询结果
 */
export const getLastUpdated = async (): Promise<
  ServiceResult<number | null>
> => {
  try {
    const lastUpdated = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATED)

    return {
      success: true,
      data: lastUpdated ? parseInt(lastUpdated, 10) : null,
      error: null,
    }
  } catch (error) {
    console.error('获取最后更新时间失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 更新最后更新时间
 * @returns Promise<void>
 */
const updateLastUpdated = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATED, String(Date.now()))
  } catch (error) {
    console.error('更新最后更新时间失败:', error)
  }
}
