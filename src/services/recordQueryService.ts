import {
  getAllRecords as storageGetAllRecords,
  getRecordById as storageGetRecordById,
  getRecordsByIdolName,
} from './storageService'
import {
  calculateRanking,
  sortRecordsByDate,
} from '../utils/rankingUtils'
import {
  IdolDetail,
  PolaroidRecord,
  ServiceResult,
} from '../types'

export const getAllRecords = async (): Promise<
  ServiceResult<PolaroidRecord[]>
> => {
  return storageGetAllRecords()
}

export const getRecordById = async (
  id: string,
): Promise<ServiceResult<PolaroidRecord>> => {
  return storageGetRecordById(id)
}

export const getRanking = async (): Promise<
  ServiceResult<ReturnType<typeof calculateRanking>>
> => {
  try {
    const { success, data: records, error } = await storageGetAllRecords()

    if (!success || !records) {
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
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getIdolDetail = async (
  idolName: string,
  ascending = true,
): Promise<ServiceResult<IdolDetail>> => {
  try {
    const {
      success,
      data: records,
      error,
    } = await getRecordsByIdolName(idolName)

    if (!success || !records) {
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

    const totalCount = records.reduce((sum, r) => sum + r.photoCount, 0)
    const totalPrice = records.reduce((sum, r) => sum + (r.price || 0), 0)
    const sortedByDate = sortRecordsByDate(records, false)
    const latestPhoto = sortedByDate[0].photoUri
    const sortedRecords = sortRecordsByDate(records, ascending)

    return {
      success: true,
      data: {
        idolName,
        totalCount,
        totalPrice,
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
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getAllIdolNames = async (): Promise<ServiceResult<string[]>> => {
  try {
    const { success, data: records, error } = await storageGetAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: [],
        error,
      }
    }

    const idolNames = Array.from(new Set(records.map(r => r.idolName))).sort()

    return {
      success: true,
      data: idolNames,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getIdolListWithCount = async (): Promise<
  ServiceResult<{ name: string; count: number }[]>
> => {
  try {
    const { success, data: records, error } = await storageGetAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: [],
        error,
      }
    }

    const idolMap = new Map<string, number>()
    records.forEach(record => {
      const currentCount = idolMap.get(record.idolName) || 0
      idolMap.set(record.idolName, currentCount + record.photoCount)
    })

    const idolList = Array.from(idolMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: idolList,
      error: null,
    }
  } catch (error) {
    console.error('获取偶像列表失败:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
