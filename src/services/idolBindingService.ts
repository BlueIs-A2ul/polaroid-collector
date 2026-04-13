import AsyncStorage from '@react-native-async-storage/async-storage'
import { ServiceResult } from '../types'

const IDOL_GROUP_BINDING_KEY = '@idol_group_bindings'

export const getIdolGroupBinding = async (
  idolName: string,
): Promise<ServiceResult<string | null>> => {
  try {
    const data = await AsyncStorage.getItem(IDOL_GROUP_BINDING_KEY)
    if (data) {
      const bindings: Record<string, string> = JSON.parse(data)
      return { success: true, data: bindings[idolName] || null, error: null }
    }
    return { success: true, data: null, error: null }
  } catch (error) {
    return { success: false, data: null, error: '获取团体绑定失败' }
  }
}

export const setIdolGroupBinding = async (
  idolName: string,
  groupName: string,
): Promise<ServiceResult<void>> => {
  try {
    const data = await AsyncStorage.getItem(IDOL_GROUP_BINDING_KEY)
    const bindings: Record<string, string> = data ? JSON.parse(data) : {}
    bindings[idolName] = groupName
    await AsyncStorage.setItem(IDOL_GROUP_BINDING_KEY, JSON.stringify(bindings))
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return { success: false, data: null, error: '设置团体绑定失败' }
  }
}

export const removeIdolGroupBinding = async (
  idolName: string,
): Promise<ServiceResult<void>> => {
  try {
    const data = await AsyncStorage.getItem(IDOL_GROUP_BINDING_KEY)
    if (data) {
      const bindings: Record<string, string> = JSON.parse(data)
      delete bindings[idolName]
      await AsyncStorage.setItem(IDOL_GROUP_BINDING_KEY, JSON.stringify(bindings))
    }
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return { success: false, data: null, error: '移除团体绑定失败' }
  }
}

export const getAllIdolGroupBindings = async (): Promise<
  ServiceResult<Record<string, string>>
> => {
  try {
    const data = await AsyncStorage.getItem(IDOL_GROUP_BINDING_KEY)
    if (data) {
      return { success: true, data: JSON.parse(data), error: null }
    }
    return { success: true, data: {}, error: null }
  } catch (error) {
    return { success: false, data: {}, error: '获取所有团体绑定失败' }
  }
}