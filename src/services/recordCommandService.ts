import { savePhoto, deletePhoto } from './photoService'
import {
  saveRecord,
  getRecordById,
  updateRecord,
  deleteRecord as storageDeleteRecord,
  deleteRecordsByIdolNames as storageDeleteRecordsByIdolNames,
  updateRecordsByIdolNames as storageUpdateRecordsByIdolNames,
} from './storageService'
import { generateId } from '../utils/rankingUtils'
import {
  PolaroidRecord,
  CreateRecordData,
  UpdateRecordData,
  ServiceResult,
} from '../types'

export const createRecord = async (
  data: CreateRecordData,
): Promise<ServiceResult<PolaroidRecord>> => {
  try {
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

    const photoResult = await savePhoto(data.photoUri)
    if (!photoResult.success || !photoResult.data) {
      return {
        success: false,
        data: null,
        error: `保存照片失败: ${photoResult.error}`,
      }
    }

    let backPhotoUri: string | undefined
    if (data.backPhotoUri) {
      const backPhotoResult = await savePhoto(data.backPhotoUri)
      if (backPhotoResult.success && backPhotoResult.data) {
        backPhotoUri = backPhotoResult.data
      }
    }

    let additionalPhotoUris: string[] | undefined
    if (data.additionalPhotoUris && data.additionalPhotoUris.length > 0) {
      const saved: string[] = []
      for (const uri of data.additionalPhotoUris) {
        const result = await savePhoto(uri)
        if (result.success && result.data) {
          saved.push(result.data)
        }
      }
      if (saved.length > 0) {
        additionalPhotoUris = saved
      }
    }

    let additionalBackPhotoUris: string[] | undefined
    if (data.additionalBackPhotoUris && data.additionalBackPhotoUris.length > 0) {
      const saved: string[] = []
      for (const uri of data.additionalBackPhotoUris) {
        const result = await savePhoto(uri)
        if (result.success && result.data) {
          saved.push(result.data)
        }
      }
      if (saved.length > 0) {
        additionalBackPhotoUris = saved
      }
    }

    const record: PolaroidRecord = {
      id: generateId(),
      idolName: data.idolName.trim(),
      photoCount: data.photoCount,
      photoDate: data.photoDate,
      photoUri: photoResult.data,
      backPhotoUri,
      additionalPhotoUris,
      additionalBackPhotoUris,
      price: data.price,
      note: data.note,
      groupName: data.groupName,
      city: data.city,
      venue: data.venue,
      polaroidType: data.polaroidType,
      memberCount: data.memberCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

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
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const updateRecordData = async (
  id: string,
  data: UpdateRecordData,
): Promise<ServiceResult<PolaroidRecord>> => {
  try {
    const {
      success: getSuccess,
      data: oldRecord,
      error: getError,
    } = await getRecordById(id)

    if (!getSuccess || !oldRecord) {
      return {
        success: false,
        data: null,
        error: getError,
      }
    }

    let newPhotoUri = oldRecord.photoUri
    if (data.photoUri && data.photoUri !== oldRecord.photoUri) {
      const photoResult = await savePhoto(data.photoUri)
      if (!photoResult.success || !photoResult.data) {
        return {
          success: false,
          data: null,
          error: `保存照片失败: ${photoResult.error}`,
        }
      }

      await deletePhoto(oldRecord.photoUri)
      newPhotoUri = photoResult.data
    }

    let newBackPhotoUri = oldRecord.backPhotoUri
    if (data.backPhotoUri !== undefined) {
      if (data.backPhotoUri === '') {
        if (oldRecord.backPhotoUri) {
          await deletePhoto(oldRecord.backPhotoUri)
        }
        newBackPhotoUri = undefined
      } else if (data.backPhotoUri !== oldRecord.backPhotoUri) {
        const backPhotoResult = await savePhoto(data.backPhotoUri)
        if (backPhotoResult.success && backPhotoResult.data) {
          if (oldRecord.backPhotoUri) {
            await deletePhoto(oldRecord.backPhotoUri)
          }
          newBackPhotoUri = backPhotoResult.data
        }
      }
    }

    let newAdditionalPhotoUris = oldRecord.additionalPhotoUris
    if (data.additionalPhotoUris !== undefined) {
      if (oldRecord.additionalPhotoUris) {
        for (const uri of oldRecord.additionalPhotoUris) {
          await deletePhoto(uri)
        }
      }
      if (data.additionalPhotoUris.length > 0) {
        const saved: string[] = []
        for (const uri of data.additionalPhotoUris) {
          const result = await savePhoto(uri)
          if (result.success && result.data) {
            saved.push(result.data)
          }
        }
        newAdditionalPhotoUris = saved.length > 0 ? saved : undefined
      } else {
        newAdditionalPhotoUris = undefined
      }
    }

    let newAdditionalBackPhotoUris = oldRecord.additionalBackPhotoUris
    if (data.additionalBackPhotoUris !== undefined) {
      if (oldRecord.additionalBackPhotoUris) {
        for (const uri of oldRecord.additionalBackPhotoUris) {
          await deletePhoto(uri)
        }
      }
      if (data.additionalBackPhotoUris.length > 0) {
        const saved: string[] = []
        for (const uri of data.additionalBackPhotoUris) {
          const result = await savePhoto(uri)
          if (result.success && result.data) {
            saved.push(result.data)
          }
        }
        newAdditionalBackPhotoUris = saved.length > 0 ? saved : undefined
      } else {
        newAdditionalBackPhotoUris = undefined
      }
    }

    const updateData: Partial<PolaroidRecord> = {
      ...data,
      photoUri: newPhotoUri,
      backPhotoUri: newBackPhotoUri,
      additionalPhotoUris: newAdditionalPhotoUris,
      additionalBackPhotoUris: newAdditionalBackPhotoUris,
    }

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
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const deleteRecordData = async (
  id: string,
): Promise<ServiceResult<string>> => {
  try {
    const {
      success: getSuccess,
      data: record,
      error: getError,
    } = await getRecordById(id)

    if (!getSuccess || !record) {
      return {
        success: false,
        data: null,
        error: getError,
      }
    }

    await deletePhoto(record.photoUri)
    if (record.backPhotoUri) {
      await deletePhoto(record.backPhotoUri)
    }
    if (record.additionalPhotoUris) {
      for (const uri of record.additionalPhotoUris) {
        await deletePhoto(uri)
      }
    }
    if (record.additionalBackPhotoUris) {
      for (const uri of record.additionalBackPhotoUris) {
        await deletePhoto(uri)
      }
    }

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
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const createMultipleRecords = async (
  recordsData: CreateRecordData[],
): Promise<ServiceResult<PolaroidRecord[]>> => {
  try {
    const createdRecords: PolaroidRecord[] = []

    for (const data of recordsData) {
      const result = await createRecord(data)
      if (result.success && result.data) {
        createdRecords.push(result.data)
      } else {
        return {
          success: false,
          data: createdRecords,
          error: `创建记录失败: ${result.error}`,
        }
      }
    }

    return {
      success: true,
      data: createdRecords,
      error: null,
    }
  } catch (error) {
    console.error('批量创建记录失败:', error)
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
  return storageDeleteRecordsByIdolNames(idolNames)
}

export const updateRecordsByIdolNames = async (
  idolNames: string[],
  updates: Partial<PolaroidRecord>,
): Promise<ServiceResult<number>> => {
  return storageUpdateRecordsByIdolNames(idolNames, updates)
}
