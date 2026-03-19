import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'

/**
 * 存储服务
 * 负责拍立得记录的本地存储和检索
 */

/**
 * 保存拍立得记录
 * @param {Object} record - 要保存的记录
 * @returns {Promise<Object>} 保存结果
 */
export const saveRecord = async record => {
  try {
    const records = await getAllRecords()
    const updatedRecords = [...records, record]
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
      error: error.message,
    }
  }
}

/**
 * 获取所有拍立得记录
 * @returns {Promise<Object>} 查询结果
 */
export const getAllRecords = async () => {
  try {
    const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS)
    const records = recordsJson ? JSON.parse(recordsJson) : []

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
      error: error.message,
    }
  }
}

/**
 * 根据ID获取单条记录
 * @param {string} id - 记录ID
 * @returns {Promise<Object>} 查询结果
 */
export const getRecordById = async id => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success) {
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
      error: error.message,
    }
  }
}

/**
 * 根据偶像名称获取所有记录
 * @param {string} idolName - 偶像名称
 * @returns {Promise<Object>} 查询结果
 */
export const getRecordsByIdolName = async idolName => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success) {
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
      error: error.message,
    }
  }
}

/**
 * 更新拍立得记录
 * @param {string} id - 记录ID
 * @param {Object} updatedData - 更新的数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateRecord = async (id, updatedData) => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success) {
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

    const updatedRecord = {
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
      error: error.message,
    }
  }
}

/**
 * 删除拍立得记录
 * @param {string} id - 记录ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteRecord = async id => {
  try {
    const { success, data: records } = await getAllRecords()
    if (!success) {
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
      error: error.message,
    }
  }
}

/**
 * 清空所有记录
 * @returns {Promise<Object>} 清空结果
 */
export const clearAllRecords = async () => {
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
      error: error.message,
    }
  }
}

/**
 * 获取最后更新时间
 * @returns {Promise<Object>} 查询结果
 */
export const getLastUpdated = async () => {
  try {
    const lastUpdated = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATED)

    return {
      success: true,
      data: lastUpdated ? parseInt(lastUpdated) : null,
      error: null,
    }
  } catch (error) {
    console.error('获取最后更新时间失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

/**
 * 更新最后更新时间
 * @returns {Promise<void>}
 */
const updateLastUpdated = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATED, String(Date.now()))
  } catch (error) {
    console.error('更新最后更新时间失败:', error)
  }
}
