import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { ServiceResult } from '../types'
import { pickPhoto } from './photoService'
import { savePhoto, deletePhoto } from './photoService'

type AvatarMap = Record<string, string>

const getAvatarMap = async (): Promise<ServiceResult<AvatarMap>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AVATARS)
    const avatarMap: AvatarMap = data ? JSON.parse(data) : {}
    return {
      success: true,
      data: avatarMap,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: {},
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getAvatar = async (
  idolName: string,
): Promise<ServiceResult<string | null>> => {
  try {
    const { success, data, error } = await getAvatarMap()

    if (!success || !data) {
      return { success: false, data: null, error }
    }

    return {
      success: true,
      data: data[idolName] || null,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getAllAvatars = async (): Promise<ServiceResult<AvatarMap>> => {
  return getAvatarMap()
}

export const setAvatar = async (
  idolName: string,
  imageUri: string,
): Promise<ServiceResult<string>> => {
  try {
    const { success: saveSuccess, data: savedUri, error: saveError } = await savePhoto(imageUri)

    if (!saveSuccess || !savedUri) {
      return {
        success: false,
        data: '',
        error: `保存头像失败: ${saveError}`,
      }
    }

    const { success, data, error } = await getAvatarMap()

    if (!success || !data) {
      return { success: false, data: '', error }
    }

    const newAvatarMap: AvatarMap = {
      ...data,
      [idolName]: savedUri,
    }

    await AsyncStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(newAvatarMap))

    return {
      success: true,
      data: savedUri,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const removeAvatar = async (
  idolName: string,
): Promise<ServiceResult<null>> => {
  try {
    const { success, data, error } = await getAvatarMap()

    if (!success || !data) {
      return { success: false, data: null, error }
    }

    if (data[idolName]) {
      await deletePhoto(data[idolName])
    }

    const newAvatarMap = { ...data }
    delete newAvatarMap[idolName]

    await AsyncStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(newAvatarMap))

    return {
      success: true,
      data: null,
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export const pickAndSetAvatar = async (
  idolName: string,
  allowCrop: boolean = false,
): Promise<ServiceResult<string>> => {
  try {
    const { success, data, error } = await pickPhoto('library', {
      allowCrop,
      cropWidth: 1,
      cropHeight: 1,
    })

    if (!success || !data) {
      return {
        success: false,
        data: '',
        error: error || '选择头像失败',
      }
    }

    return setAvatar(idolName, data)
  } catch (error) {
    return {
      success: false,
      data: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}