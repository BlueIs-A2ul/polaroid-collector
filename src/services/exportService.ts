import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { ServiceResult } from '../types'
import { PolaroidRecord } from '../types'
import { getAllRecords } from './storageService'

/**
 * 导出服务
 * 负责数据导出为 JSON 或 CSV 格式
 */

/**
 * 导出数据为 JSON 格式
 * @returns 导出结果
 */
export const exportToJSON = async (): Promise<ServiceResult<string>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: error || '获取数据失败',
      }
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: records.length,
      records,
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const fileName = `polaroid_export_${Date.now()}.json`
    const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(fileUri, jsonString)

    return {
      success: true,
      data: fileUri,
      error: null,
    }
  } catch (error) {
    console.error('导出 JSON 失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 导出数据为 CSV 格式
 * @returns 导出结果
 */
export const exportToCSV = async (): Promise<ServiceResult<string>> => {
  try {
    const { success, data: records, error } = await getAllRecords()

    if (!success || !records) {
      return {
        success: false,
        data: null,
        error: error || '获取数据失败',
      }
    }

    // CSV 表头
    const headers = [
      'ID',
      '偶像名称',
      '拍立得数量',
      '拍摄日期',
      '照片路径',
      '创建时间',
      '更新时间',
    ]

    // CSV 行数据
    const rows = records.map((record: PolaroidRecord) => [
      record.id,
      record.idolName,
      record.photoCount,
      record.photoDate,
      record.photoUri,
      new Date(record.createdAt).toLocaleString('zh-CN'),
      new Date(record.updatedAt).toLocaleString('zh-CN'),
    ])

    // 构建 CSV 内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')

    // 添加 BOM 以支持中文
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    const fileName = `polaroid_export_${Date.now()}.csv`
    const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`

    await FileSystem.writeAsStringAsync(fileUri, csvWithBom)

    return {
      success: true,
      data: fileUri,
      error: null,
    }
  } catch (error) {
    console.error('导出 CSV 失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 分享导出的文件
 * @param fileUri - 文件 URI
 */
export const shareExportedFile = async (fileUri: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync()
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: '分享导出文件',
      })
    }
  } catch (error) {
    console.error('分享文件失败:', error)
    throw error
  }
}
