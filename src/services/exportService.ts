import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { ServiceResult, PolaroidRecord } from '../types'
import { getAllRecords, saveRecord } from './storageService'
import { generateId } from '../utils/rankingUtils'

/**
 * 导出数据为 JSON 格式
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

    const headers = [
      '偶像名称',
      '拍立得数量',
      '拍摄日期',
      '价格',
      '备注',
      '团体',
      '城市',
      '场馆',
      '拍立得类型',
      '人数',
    ]

    const rows = records.map((record: PolaroidRecord) => [
      record.idolName || '',
      String(record.photoCount || 1),
      record.photoDate || '',
      record.price ? String(record.price) : '',
      record.note || '',
      record.groupName || '',
      record.city || '',
      record.venue || '',
      record.polaroidType || '',
      record.memberCount || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')

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
 * 从 CSV 导入数据
 */
export const importFromCSV = async (
  csvUri: string,
): Promise<ServiceResult<number>> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(csvUri)

    const lines = fileContent.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return {
        success: false,
        data: null,
        error: 'CSV 文件为空或格式错误',
      }
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim())

    const fieldMap: Record<string, string> = {
      '偶像名称': 'idolName',
      '拍立得数量': 'photoCount',
      '拍摄日期': 'photoDate',
      '价格': 'price',
      '备注': 'note',
      '团体': 'groupName',
      '城市': 'city',
      '场馆': 'venue',
      '拍立得类型': 'polaroidType',
      '人数': 'memberCount',
    }

    const fieldIndices: Record<string, number> = {}
    headers.forEach((header, index) => {
      const field = fieldMap[header]
      if (field) {
        fieldIndices[field] = index
      }
    })

    if (fieldIndices.idolName === undefined) {
      return {
        success: false,
        data: null,
        error: 'CSV 缺少必要字段：偶像名称',
      }
    }

    let successCount = 0
    let failCount = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])

        if (values.length < 1) continue

        const idolName = values[fieldIndices.idolName]?.trim()
        if (!idolName) continue

        const photoCount = parseInt(values[fieldIndices.photoCount] || '1', 10) || 1
        const photoDate = values[fieldIndices.photoDate]?.trim() || new Date().toISOString().split('T')[0]

        const record: PolaroidRecord = {
          id: generateId(),
          idolName,
          photoCount,
          photoDate,
          photoUri: '',
          price: fieldIndices.price !== undefined ? parseFloat(values[fieldIndices.price]) || undefined : undefined,
          note: fieldIndices.note !== undefined ? values[fieldIndices.note]?.trim() || undefined : undefined,
          groupName: fieldIndices.groupName !== undefined ? values[fieldIndices.groupName]?.trim() || undefined : undefined,
          city: fieldIndices.city !== undefined ? values[fieldIndices.city]?.trim() || undefined : undefined,
          venue: fieldIndices.venue !== undefined ? values[fieldIndices.venue]?.trim() || undefined : undefined,
          polaroidType: fieldIndices.polaroidType !== undefined ? values[fieldIndices.polaroidType]?.trim() || undefined : undefined,
          memberCount: fieldIndices.memberCount !== undefined ? values[fieldIndices.memberCount]?.trim() || undefined : undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        const { success } = await saveRecord(record)
        if (success) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }

    return {
      success: true,
      data: successCount,
      error: failCount > 0 ? `${failCount} 条记录导入失败` : null,
    }
  } catch (error) {
    console.error('导入 CSV 失败:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 解析 CSV 行
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }

  values.push(current)
  return values
}

/**
 * 分享导出的文件
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