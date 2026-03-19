import { savePhoto, deletePhoto } from './photoService'
import {
  saveRecord,
  getAllRecords,
  getRecordById,
  getRecordsByIdolName,
  updateRecord,
  deleteRecord as storageDeleteRecord,
} from './storageService'
import {
  calculateRanking,
  sortRecordsByDate,
  getTodayDateString,
  generateId,
  formatDate,
} from '../utils/rankingUtils'

/**
 * 记录服务
 * 整合存储和照片服务，提供完整的拍立得记录管理功能
 */

/**
 * 创建拍立得记录
 * @param {Object} data - 记录数据
 * @param {string} data.idolName - 偶像名称
 * @param {number} data.photoCount - 拍立得数量
 * @param {string} data.photoDate - 拍摄日期
 * @param {string} data.photoUri - 照片URI（临时URI）
 * @returns {Promise<Object>} 创建结果
 */
export const createRecord = async data => {
  try {
    // 验证数据
    if (!data.idolName || !data.idolName.trim()) {
      return {
        success: false,
        data: null,
        error: '偶像名称不能为空',
      }
    }

    if (!data.photoCount || data.photoCount <= 0) {
      return {
        success: false,
        data: null,
        error: '拍立得数量必须大于0',
      }
    }

    if (!data.photoDate) {
      return {
        success: false,
        data: null,
        error: '拍摄日期不能为空',
      }
    }

    if (!data.photoUri) {
      return {
        success: false,
        data: null,
        error: '照片不能为空',
      }
    }

    // 保存照片到本地
    const photoResult = await savePhoto(data.photoUri)
    if (!photoResult.success) {
      return {
        success: false,
        data: null,
        error: `保存照片失败: ${photoResult.error}`,
      }
    }

    // 创建记录对象
    const record = {
      id: generateId(),
      idolName: data.idolName.trim(),
      photoCount: data.photoCount,
      photoDate: data.photoDate,
      photoUri: photoResult.data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // 保存记录
    const saveResult = await saveRecord(record)
    if (!saveResult.success) {
      return {
        success: false,
        data: null,
        error: `保存记录失败: ${saveResult.error}`,
      }
    }

    return {
      success: true,
      data: record,
      error: null,
    }
  } catch (error) {
    console.error('创建记录失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

/**
 * 获取排行榜数据
 * @returns {Promise<Object>} 排行榜数据
 */
export const getRanking = async () => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success) {
      return {
        success: false,
        data: [],
        error,
      }
    }

    const ranking = calculateRanking(records)

    return {
      success: true,
      data: ranking,
      error: null,
    }
  } catch (error) {
    console.error('获取排行榜失败:', error)
    return {
      success: false,
      data: [],
      error: error.message,
    }
  }
}

/**
 * 获取偶像的详细记录
 * @param {string} idolName - 偶像名称
 * @param {boolean} ascending - 是否按日期升序排列
 * @returns {Promise<Object>} 详细记录
 */
export const getIdolDetail = async (idolName, ascending = true) => {
  try {
    const {
      success,
      data: records,
      error,
    } = await getRecordsByIdolName(idolName)

    if (!success) {
      return {
        success: false,
        data: null,
        error,
      }
    }

    if (records.length === 0) {
      return {
        success: false,
        data: null,
        error: '偶像不存在',
      }
    }

    // 计算总数
    const totalCount = records.reduce((sum, r) => sum + r.photoCount, 0)

    // 获取最新照片
    const sortedByDate = sortRecordsByDate(records, false)
    const latestPhoto = sortedByDate[0].photoUri

    // 排序记录
    const sortedRecords = sortRecordsByDate(records, ascending)

    return {
      success: true,
      data: {
        idolName,
        totalCount,
        records: sortedRecords,
        latestPhoto,
        totalRecords: records.length,
      },
      error: null,
    }
  } catch (error) {
    console.error('获取偶像详情失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

/**
 * 更新拍立得记录
 * @param {string} id - 记录ID
 * @param {Object} data - 更新的数据
 * @param {string} data.photoUri - 新照片URI（可选）
 * @returns {Promise<Object>} 更新结果
 */
export const updateRecordData = async (id, data) => {
  try {
    // 获取原记录
    const {
      success: getSuccess,
      data: oldRecord,
      error: getError,
    } = await getRecordById(id)

    if (!getSuccess) {
      return {
        success: false,
        data: null,
        error: getError,
      }
    }

    // 如果有新照片，保存新照片并删除旧照片
    let newPhotoUri = oldRecord.photoUri
    if (data.photoUri && data.photoUri !== oldRecord.photoUri) {
      const photoResult = await savePhoto(data.photoUri)
      if (!photoResult.success) {
        return {
          success: false,
          data: null,
          error: `保存照片失败: ${photoResult.error}`,
        }
      }

      // 删除旧照片
      await deletePhoto(oldRecord.photoUri)
      newPhotoUri = photoResult.data
    }

    // 准备更新数据
    const updateData = {
      ...data,
      photoUri: newPhotoUri,
    }

    // 更新记录
    const {
      success: updateSuccess,
      data: updatedRecord,
      error: updateError,
    } = await updateRecord(id, updateData)

    if (!updateSuccess) {
      return {
        success: false,
        data: null,
        error: updateError,
      }
    }

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
export const deleteRecordData = async id => {
  try {
    // 获取记录信息
    const {
      success: getSuccess,
      data: record,
      error: getError,
    } = await getRecordById(id)

    if (!getSuccess) {
      return {
        success: false,
        data: null,
        error: getError,
      }
    }

    // 删除照片
    await deletePhoto(record.photoUri)

    // 删除记录
    const { success: deleteSuccess, error: deleteError } =
      await storageDeleteRecord(id)

    if (!deleteSuccess) {
      return {
        success: false,
        data: null,
        error: deleteError,
      }
    }

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
 * 获取统计信息
 * @returns {Promise<Object>} 统计信息
 */
export const getStatistics = async () => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success) {
      return {
        success: false,
        data: null,
        error,
      }
    }

    const totalRecords = records.length
    const totalPhotos = records.reduce((sum, r) => sum + r.photoCount, 0)
    const uniqueIdols = new Set(records.map(r => r.idolName)).size

    return {
      success: true,
      data: {
        totalRecords,
        totalPhotos,
        uniqueIdols,
      },
      error: null,
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

// 导出工具函数
export { getTodayDateString, formatDate }
