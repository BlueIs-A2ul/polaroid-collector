import * as FileSystem from 'expo-file-system/legacy'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import { ServiceResult } from '../types'

export interface PhotoWithDate {
  uri: string
  capturedDate?: string
}

const PHOTO_DIR = `${(FileSystem as any).documentDirectory}photos/`

const extractDateFromExif = (exif: any): string | undefined => {
  if (!exif) {
    return undefined
  }

  const dateStr = exif.DateTimeOriginal || exif.DateTime || exif.CreateDate || exif.ModifyDate
  if (!dateStr) {
    return undefined
  }

  try {
    if (typeof dateStr === 'string') {
      const formats = [
        /(\d{4}):(\d{2}):(\d{2})/,
        /(\d{4})-(\d{2})-(\d{2})/,
        /(\d{4})\/(\d{2})\/(\d{2})/,
      ]

      for (const regex of formats) {
        const match = dateStr.match(regex)
        if (match) {
          return `${match[1]}-${match[2]}-${match[3]}`
        }
      }
    }
    if (typeof dateStr === 'number') {
      const date = new Date(dateStr * 1000)
      return date.toISOString().split('T')[0]
    }
  } catch {
    return undefined
  }
  return undefined
}

const getPhotoDateFromAsset = async (assetUri: string, asset?: any): Promise<string | undefined> => {
  try {
    if (asset?.creationTime || asset?.modificationTime) {
      const time = asset.creationTime || asset.modificationTime
      const date = new Date(time)
      return date.toISOString().split('T')[0]
    }

    const { status } = await MediaLibrary.requestPermissionsAsync()
    if (status !== 'granted') return undefined

    if (assetUri.startsWith('ph://')) {
      const localUri = assetUri.replace('ph://', '')
      const parts = localUri.split('/')
      const assetId = parts[0]

      const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId)
      if (assetInfo?.creationTime) {
        const date = new Date(assetInfo.creationTime)
        return date.toISOString().split('T')[0]
      }
    }
  } catch {
    return undefined
  }
  return undefined
}

/**
 * 确保照片目录存在
 * @returns Promise<void>
 */
const ensurePhotoDir = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
  }
}

/**
 * 选择照片（相机或相册）
 * @param source - 照片来源 'camera' | 'library'
 * @param options - 裁切选项
 * @returns 选择结果
 */
export const pickPhoto = async (
  source: 'camera' | 'library',
  options?: {
    allowCrop?: boolean
    cropWidth?: number
    cropHeight?: number
  },
): Promise<ServiceResult<PhotoWithDate>> => {
  try {
    const { allowCrop = true, cropWidth = 4, cropHeight = 3 } = options || {}

    const permissionResult =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      return {
        success: false,
        data: null,
        error: '需要相机/相册权限',
      }
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: allowCrop,
            aspect: allowCrop ? [cropWidth, cropHeight] : undefined,
            quality: 0.6,
            exif: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: allowCrop,
            aspect: allowCrop ? [cropWidth, cropHeight] : undefined,
            quality: 0.6,
            exif: true,
          })

    if (result.canceled) {
      return {
        success: false,
        data: null,
        error: '用户取消选择',
      }
    }

    const asset = result.assets[0]
    const originalUri = asset.uri
    const compressResult = await compressPhoto(originalUri)

    let capturedDate: string | undefined
    if (asset.exif) {
      capturedDate = extractDateFromExif(asset.exif)
    }
    if (!capturedDate && source === 'library') {
      capturedDate = await getPhotoDateFromAsset(originalUri, asset)
    }

    const finalUri = compressResult.success && compressResult.data ? compressResult.data : originalUri

    return {
      success: true,
      data: { uri: finalUri, capturedDate },
      error: null,
    }
  } catch (error) {
    console.error('选择照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 保存照片到本地文件系统
 * @param uri - 照片URI
 * @returns 保存结果
 */
export const savePhoto = async (
  uri: string,
): Promise<ServiceResult<string>> => {
  try {
    await ensurePhotoDir()

    const filename = `${Date.now()}.jpg`
    const fileUri = `${PHOTO_DIR}${filename}`

    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    })

    return {
      success: true,
      data: fileUri,
      error: null,
    }
  } catch (error) {
    console.error('保存照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 读取照片并转为 Base64
 * @param uri - 照片URI
 * @returns 读取结果
 */
export const getPhotoBase64 = async (
  uri: string,
): Promise<ServiceResult<string>> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: (FileSystem as any).EncodingType.Base64,
    })

    return {
      success: true,
      data: base64,
      error: null,
    }
  } catch (error) {
    console.error('读取照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 删除本地照片
 * @param uri - 照片URI
 * @returns 删除结果
 */
export const deletePhoto = async (
  uri: string,
): Promise<ServiceResult<string>> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true })

    return {
      success: true,
      data: uri,
      error: null,
    }
  } catch (error) {
    console.error('删除照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 获取照片信息
 * @param uri - 照片URI
 * @returns 照片信息
 */
export const getPhotoInfo = async (
  uri: string,
): Promise<ServiceResult<FileSystem.FileInfo>> => {
  try {
    const info = await FileSystem.getInfoAsync(uri)

    return {
      success: true,
      data: info,
      error: null,
    }
  } catch (error) {
    console.error('获取照片信息失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 获取所有照片
 * @returns 照片列表
 */
export const getAllPhotos = async (): Promise<ServiceResult<string[]>> => {
  try {
    await ensurePhotoDir()

    const files = await FileSystem.readDirectoryAsync(PHOTO_DIR)
    const photoUris = files
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(file => `${PHOTO_DIR}${file}`)

    return {
      success: true,
      data: photoUris,
      error: null,
    }
  } catch (error) {
    console.error('获取照片列表失败:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 清空所有照片
 * @returns 清空结果
 */
export const clearAllPhotos = async (): Promise<ServiceResult<null>> => {
  try {
    await FileSystem.deleteAsync(PHOTO_DIR, { idempotent: true })
    await ensurePhotoDir()

    return {
      success: true,
      data: null,
      error: null,
    }
  } catch (error) {
    console.error('清空照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 选择多张照片（仅支持相册）
 * @param options - 裁切选项
 * @returns 选择结果（照片URI数组）
 */
export const pickMultiplePhotos = async (
  options?: {
    allowCrop?: boolean
    cropWidth?: number
    cropHeight?: number
  },
): Promise<ServiceResult<PhotoWithDate[]>> => {
  try {
    const { allowCrop = false } = options || {}

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      return {
        success: false,
        data: null,
        error: '需要相册权限',
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      allowsEditing: allowCrop,
      quality: 0.6,
      exif: true,
    })

    if (result.canceled) {
      return {
        success: false,
        data: null,
        error: '用户取消选择',
      }
    }

    const photos: PhotoWithDate[] = []
    for (const asset of result.assets) {
      const compressResult = await compressPhoto(asset.uri)
      const finalUri = compressResult.success && compressResult.data ? compressResult.data : asset.uri

      let capturedDate: string | undefined
      if (asset.exif) {
        capturedDate = extractDateFromExif(asset.exif)
      }
      if (!capturedDate) {
        capturedDate = await getPhotoDateFromAsset(asset.uri, asset)
      }

      photos.push({ uri: finalUri, capturedDate })
    }

    return {
      success: true,
      data: photos,
      error: null,
    }
  } catch (error) {
    console.error('选择多张照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 压缩照片
 * @param uri - 照片URI
 * @param maxWidth - 最大宽度，默认1024
 * @param quality - 压缩质量，默认0.6
 * @returns 压缩后的照片URI
 */
export const compressPhoto = async (
  uri: string,
  maxWidth = 1024,
  quality = 0.6,
): Promise<ServiceResult<string>> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    )

    return {
      success: true,
      data: result.uri,
      error: null,
    }
  } catch (error) {
    console.error('压缩照片失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
