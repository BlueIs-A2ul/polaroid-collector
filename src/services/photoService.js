import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

/**
 * 照片服务
 * 负责照片的选择、存储、读取和删除
 */

const PHOTO_DIR = `${FileSystem.documentDirectory}photos/`

/**
 * 确保照片目录存在
 * @returns {Promise<void>}
 */
const ensurePhotoDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true })
  }
}

/**
 * 选择照片（相机或相册）
 * @param {string} source - 照片来源 'camera' | 'library'
 * @returns {Promise<Object>} 选择结果
 */
export const pickPhoto = async source => {
  try {
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
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })

    if (result.canceled) {
      return {
        success: false,
        data: null,
        error: '用户取消选择',
      }
    }

    return {
      success: true,
      data: result.assets[0].uri,
      error: null,
    }
  } catch (error) {
    console.error('选择照片失败:', error)
    return {
      success: false,
      data: null,
      error: error.message,
    }
  }
}

/**
 * 保存照片到本地文件系统
 * @param {string} uri - 照片URI
 * @returns {Promise<Object>} 保存结果
 */
export const savePhoto = async uri => {
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
      error: error.message,
    }
  }
}

/**
 * 读取照片并转为 Base64
 * @param {string} uri - 照片URI
 * @returns {Promise<Object>} 读取结果
 */
export const getPhotoBase64 = async uri => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
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
      error: error.message,
    }
  }
}

/**
 * 删除本地照片
 * @param {string} uri - 照片URI
 * @returns {Promise<Object>} 删除结果
 */
export const deletePhoto = async uri => {
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
      error: error.message,
    }
  }
}

/**
 * 获取照片信息
 * @param {string} uri - 照片URI
 * @returns {Promise<Object>} 照片信息
 */
export const getPhotoInfo = async uri => {
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
      error: error.message,
    }
  }
}

/**
 * 获取所有照片
 * @returns {Promise<Object>} 照片列表
 */
export const getAllPhotos = async () => {
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
      error: error.message,
    }
  }
}

/**
 * 清空所有照片
 * @returns {Promise<Object>} 清空结果
 */
export const clearAllPhotos = async () => {
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
      error: error.message,
    }
  }
}
