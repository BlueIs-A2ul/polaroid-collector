import React from 'react'
import { StackNavigationProp } from '@react-navigation/stack'
import * as DocumentPicker from 'expo-document-picker'
import type { RootStackParamList } from '../types/navigation'
import { ActionSheetOption } from '../components/features/ActionSheetModal'
import {
  createBackup,
  restoreFromBackup,
  shareBackupFile,
} from '../services/backupService'
import { Dialog } from '../services/dialogService'
import {
  exportToCSV,
  exportToJSON,
  importFromCSV,
  shareExportedFile,
} from '../services/exportService'
import { mergeSameDayRecords, previewMergeResult } from '../services/mergeService'

type HomeActionsNavigation = StackNavigationProp<RootStackParamList, 'Home'>

interface UseHomeActionsOptions {
  navigation: HomeActionsNavigation
  refreshAll: () => Promise<void>
}

interface UseHomeActionsResult {
  actionSheetVisible: boolean
  actionSheetTitle: string
  actionSheetOptions: ActionSheetOption[]
  closeActionSheet: () => void
  showExportOptions: () => void
  showMoreOptions: () => void
}

export const useHomeActions = ({
  navigation,
  refreshAll,
}: UseHomeActionsOptions): UseHomeActionsResult => {
  const [actionSheetVisible, setActionSheetVisible] = React.useState(false)
  const [actionSheetTitle, setActionSheetTitle] = React.useState('')
  const [actionSheetOptions, setActionSheetOptions] = React.useState<ActionSheetOption[]>([])

  const closeActionSheet = React.useCallback(() => {
    setActionSheetVisible(false)
  }, [])

  const handleExportJSON = React.useCallback(async () => {
    const { success, data: fileUri, error: err } = await exportToJSON()
    if (success && fileUri) {
      const exportJsonResult = await Dialog.confirm({
        title: '导出成功',
        message: 'JSON 文件已生成，是否分享？',
        buttons: [
          { text: '取消', style: 'cancel' },
          { text: '分享', style: 'primary' },
        ],
      })
      if (exportJsonResult === 1) {
        shareExportedFile(fileUri)
      }
    } else {
      Dialog.toast(err || '未知错误', 'error')
    }
  }, [])

  const handleExportCSV = React.useCallback(async () => {
    const { success, data: fileUri, error: err } = await exportToCSV()
    if (success && fileUri) {
      const exportCsvResult = await Dialog.confirm({
        title: '导出成功',
        message: 'CSV 文件已生成，是否分享？',
        buttons: [
          { text: '取消', style: 'cancel' },
          { text: '分享', style: 'primary' },
        ],
      })
      if (exportCsvResult === 1) {
        shareExportedFile(fileUri)
      }
    } else {
      Dialog.toast(err || '未知错误', 'error')
    }
  }, [])

  const handleImportCSV = React.useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { success, data: count, error: err } = await importFromCSV(
          result.assets[0].uri,
        )

        if (success) {
          Dialog.toast(`成功导入 ${count} 条记录`, 'success')
          refreshAll()
        } else {
          Dialog.toast(err || '未知错误', 'error')
        }
      }
    } catch (error) {
      Dialog.toast(
        error instanceof Error ? error.message : String(error),
        'error',
      )
    }
  }, [refreshAll])

  const handleMergeSameDayRecords = React.useCallback(async () => {
    const previewResult = await previewMergeResult()
    if (!previewResult.success || !previewResult.data) {
      Dialog.toast('无法预览合并结果', 'error')
      return
    }

    const { groups, totalGroups, totalRecords } = previewResult.data

    if (totalGroups === 0) {
      Dialog.toast('没有需要合并的记录（所有偶像的同一天都只有一条记录）', 'info')
      return
    }

    const previewText = groups
      .slice(0, 5)
      .map(g => `• ${g.idolName} - ${g.date}: ${g.count}条记录，共${g.totalPhotos}张`)
      .join('\n')

    const moreText = groups.length > 5 ? `\n...还有 ${groups.length - 5} 个分组` : ''

    const mergeConfirmResult = await Dialog.confirm({
      title: '确认合并',
      message: `发现 ${totalGroups} 个分组需要合并，共涉及 ${totalRecords} 条记录\n\n${previewText}${moreText}\n\n是否继续合并？`,
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '合并', style: 'destructive' },
      ],
    })
    if (mergeConfirmResult === 1) {
      const result = await mergeSameDayRecords()
      if (result.success && result.data) {
        const { mergedCount, deletedCount, affectedIdols } = result.data
        Dialog.toast(
          `成功合并 ${mergedCount} 个分组\n删除了 ${deletedCount} 条重复记录\n涉及 ${affectedIdols.length} 位偶像`,
          'success',
        )
        refreshAll()
      } else {
        Dialog.toast(result.error || '未知错误', 'error')
      }
    }
  }, [refreshAll])

  const handleCreateBackup = React.useCallback(async () => {
    const { success, data: fileUri, error: err } = await createBackup()
    if (success && fileUri) {
      const backupResult = await Dialog.confirm({
        title: '备份成功',
        message: '备份文件已生成，是否分享？',
        buttons: [
          { text: '取消', style: 'cancel' },
          { text: '分享', style: 'primary' },
        ],
      })
      if (backupResult === 1) {
        shareBackupFile(fileUri)
      }
    } else {
      Dialog.toast(err || '未知错误', 'error')
    }
  }, [])

  const handleRestoreBackup = React.useCallback(async () => {
    const restoreResult = await Dialog.confirm({
      title: '恢复备份',
      message: '这将清除当前所有数据并从备份恢复，是否继续？',
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '继续', style: 'destructive' },
      ],
    })
    if (restoreResult === 1) {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const { success, error: err } = await restoreFromBackup(
            result.assets[0].uri,
          )

          if (success) {
            Dialog.toast('数据已恢复', 'success')
            refreshAll()
          } else {
            Dialog.toast(err || '未知错误', 'error')
          }
        }
      } catch (error) {
        Dialog.toast(
          error instanceof Error ? error.message : String(error),
          'error',
        )
      }
    }
  }, [refreshAll])

  const showExportOptions = React.useCallback(() => {
    setActionSheetTitle('数据导入导出')
    setActionSheetOptions([
      { text: '导出为 JSON', icon: 'document-text-outline', onPress: handleExportJSON },
      { text: '导出为 CSV', icon: 'grid-outline', onPress: handleExportCSV },
      { text: '从 CSV 导入', icon: 'download-outline', onPress: handleImportCSV },
    ])
    setActionSheetVisible(true)
  }, [handleExportCSV, handleExportJSON, handleImportCSV])

  const showMoreOptions = React.useCallback(() => {
    setActionSheetTitle('更多选项')
    setActionSheetOptions([
      { text: '主题设置', icon: 'color-palette-outline', onPress: () => navigation.navigate('ThemeSettings') },
      { text: '整理中心', icon: 'albums-outline', onPress: () => navigation.navigate('OrganizationCenter') },
      { text: '合并同日记录', icon: 'copy-outline', onPress: handleMergeSameDayRecords },
      { text: '创建备份', icon: 'cloud-upload-outline', onPress: handleCreateBackup },
      { text: '恢复备份', icon: 'cloud-download-outline', onPress: handleRestoreBackup },
    ])
    setActionSheetVisible(true)
  }, [
    handleCreateBackup,
    handleMergeSameDayRecords,
    handleRestoreBackup,
    navigation,
  ])

  return {
    actionSheetVisible,
    actionSheetTitle,
    actionSheetOptions,
    closeActionSheet,
    showExportOptions,
    showMoreOptions,
  }
}
