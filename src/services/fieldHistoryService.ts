import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { ServiceResult } from '../types'

type FieldHistoryMap = Record<string, string[]>

const getFieldHistoryMap = async (): Promise<ServiceResult<FieldHistoryMap>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FIELD_HISTORY)
    const historyMap: FieldHistoryMap = data ? JSON.parse(data) : {
      groupName: [],
      city: [],
      venue: [],
    }
    return {
      success: true,
      data: historyMap,
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

export const getFieldHistory = async (
  field: 'groupName' | 'city' | 'venue',
): Promise<ServiceResult<string[]>> => {
  try {
    const { success, data, error } = await getFieldHistoryMap()

    if (!success || !data) {
      return { success: false, data: [], error }
    }

    return {
      success: true,
      data: data[field] || [],
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

export const addFieldHistory = async (
  field: 'groupName' | 'city' | 'venue',
  value: string,
): Promise<ServiceResult<null>> => {
  try {
    if (!value.trim()) {
      return { success: true, data: null, error: null }
    }

    const { success, data, error } = await getFieldHistoryMap()

    if (!success || !data) {
      return { success: false, data: null, error }
    }

    const currentList = data[field] || []
    const newList = [value, ...currentList.filter(item => item !== value)].slice(0, 20)

    const newHistoryMap: FieldHistoryMap = {
      ...data,
      [field]: newList,
    }

    await AsyncStorage.setItem(STORAGE_KEYS.FIELD_HISTORY, JSON.stringify(newHistoryMap))

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

export const removeFieldHistory = async (
  field: 'groupName' | 'city' | 'venue',
  value: string,
): Promise<ServiceResult<null>> => {
  try {
    const { success, data, error } = await getFieldHistoryMap()

    if (!success || !data) {
      return { success: false, data: null, error }
    }

    const currentList = data[field] || []
    const newList = currentList.filter(item => item !== value)

    const newHistoryMap: FieldHistoryMap = {
      ...data,
      [field]: newList,
    }

    await AsyncStorage.setItem(STORAGE_KEYS.FIELD_HISTORY, JSON.stringify(newHistoryMap))

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