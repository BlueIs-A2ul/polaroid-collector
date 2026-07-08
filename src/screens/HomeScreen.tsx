import React from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useRecords } from '../hooks/useRecords'
import IdolCardAnimated from '../components/features/IdolCardAnimated'
import EmptyState from '../components/common/EmptyState'
import SearchBar from '../components/common/SearchBar'
import { HomeSkeleton } from '../components/common/Skeleton'
import HomeHeader from '../components/features/HomeHeader'
import StatsCard from '../components/features/StatsCard'
import QuickActions from '../components/features/QuickActions'
import BatchActionBar from '../components/features/BatchActionBar'
import BatchEditModal from '../components/features/BatchEditModal'
import SortOptionsModal, { SortType, SortOrder, SORT_OPTIONS } from '../components/features/SortOptionsModal'
import ActionSheetModal, { ActionSheetOption } from '../components/features/ActionSheetModal'
import AdvancedFilter from '../components/features/AdvancedFilter'
import {
  exportToJSON,
  exportToCSV,
  importFromCSV,
  shareExportedFile,
} from '../services/exportService'
import {
  createBackup,
  restoreFromBackup,
  shareBackupFile,
} from '../services/backupService'
import { getAllAvatars, removeAvatar } from '../services/avatarService'
import { deleteRecordsByIdolNames, updateRecordsByIdolNames } from '../services/storageService'
import { mergeSameDayRecords, previewMergeResult } from '../services/mergeService'
import { Dialog } from '../services/dialogService'
import * as DocumentPicker from 'expo-document-picker'
import { RankingItem } from '../types'
import {
  DEFAULT_FILTER_OPTIONS,
  FilterOptions,
  SearchType,
  filterRankingItems,
  getActiveFilterCount,
} from '../utils/filterUtils'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
  route: HomeScreenRouteProp
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme()
  const { ranking, statistics, loading, error, refreshAll } = useRecords()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchType, setSearchType] = React.useState<SearchType>('all')
  const [refreshing, setRefreshing] = React.useState(false)
  const [avatarMap, setAvatarMap] = React.useState<Record<string, string>>({})
  const [showFilter, setShowFilter] = React.useState(false)
  const [filters, setFilters] = React.useState<FilterOptions>(DEFAULT_FILTER_OPTIONS)
  const [selectionMode, setSelectionMode] = React.useState(false)
  const [selectedIdols, setSelectedIdols] = React.useState<Set<string>>(new Set())
  const [showBatchEdit, setShowBatchEdit] = React.useState(false)
  const [batchEditField, setBatchEditField] = React.useState<'groupName' | 'city' | 'venue'>('groupName')
  const [batchEditValue, setBatchEditValue] = React.useState('')
  const [sortBy, setSortBy] = React.useState<SortType>('date')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')
  const [showSortOptions, setShowSortOptions] = React.useState(false)
  const [actionSheetVisible, setActionSheetVisible] = React.useState(false)
  const [actionSheetTitle, setActionSheetTitle] = React.useState('')
  const [actionSheetOptions, setActionSheetOptions] = React.useState<ActionSheetOption[]>([])

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sortText: {
      fontSize: 12,
      color: colors.PRIMARY,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    listFooter: {
      height: 80,
    },
  }), [colors])

  const loadAvatars = React.useCallback(async () => {
    const { success, data } = await getAllAvatars()
    if (success && data) {
      setAvatarMap(data)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      refreshAll()
      loadAvatars()
    }, [refreshAll, loadAvatars]),
  )

  const activeFilterCount = React.useMemo(() => {
    return getActiveFilterCount(filters)
  }, [filters])

  const clearFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTER_OPTIONS)
  }, [])

  const filteredRanking = React.useMemo(() => {
    let result = filterRankingItems(ranking, searchQuery, searchType, filters)

    result = result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.latestDate ? new Date(a.latestDate).getTime() : 0
        const dateB = b.latestDate ? new Date(b.latestDate).getTime() : 0
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      }
      if (sortBy === 'count') {
        return sortOrder === 'desc' ? b.totalCount - a.totalCount : a.totalCount - b.totalCount
      }
      if (sortBy === 'price') {
        return sortOrder === 'desc' ? b.totalPrice - a.totalPrice : a.totalPrice - b.totalPrice
      }
      return 0
    })

    return result
  }, [ranking, searchQuery, searchType, filters, sortBy, sortOrder])

  const toggleSelection = React.useCallback((idolName: string) => {
    setSelectedIdols(prev => {
      const newSet = new Set(prev)
      if (newSet.has(idolName)) {
        newSet.delete(idolName)
      } else {
        newSet.add(idolName)
      }
      return newSet
    })
  }, [])

  const enterSelectionMode = React.useCallback((idolName: string) => {
    setSelectionMode(true)
    setSelectedIdols(new Set([idolName]))
  }, [])

  const exitSelectionMode = React.useCallback(() => {
    setSelectionMode(false)
    setSelectedIdols(new Set())
  }, [])

  const selectAll = React.useCallback(() => {
    setSelectedIdols(new Set(filteredRanking.map(item => item.idolName)))
  }, [filteredRanking])

  const handleBatchDelete = React.useCallback(async () => {
    const count = selectedIdols.size
    const deleteResult = await Dialog.confirm({
      title: '批量删除',
      message: `确定要删除 ${count} 个偶像的所有记录吗？此操作不可撤销。`,
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive' },
      ],
    })
    if (deleteResult === 1) {
      const idolNames = Array.from(selectedIdols)
      for (const name of idolNames) {
        await removeAvatar(name)
      }
      const { success, data: deletedCount } = await deleteRecordsByIdolNames(idolNames)
      if (success) {
        Dialog.toast(`已删除 ${deletedCount} 条记录`, 'success')
        exitSelectionMode()
        refreshAll()
        loadAvatars()
      } else {
        Dialog.toast('请稍后重试', 'error')
      }
    }
  }, [selectedIdols, exitSelectionMode, refreshAll, loadAvatars])

  const handleBatchEdit = React.useCallback(() => {
    setBatchEditValue('')
    setShowBatchEdit(true)
  }, [])

  const applyBatchEdit = React.useCallback(async () => {
    if (!batchEditValue.trim()) {
      Dialog.toast('请输入值', 'warning')
      return
    }

    const idolNames = Array.from(selectedIdols)
    const updates: Record<string, string | undefined> = {
      [batchEditField]: batchEditValue.trim(),
    }

    const { success, data: updatedCount } = await updateRecordsByIdolNames(idolNames, updates)
    if (success) {
      Dialog.toast(`已更新 ${updatedCount} 条记录`, 'success')
      setShowBatchEdit(false)
      exitSelectionMode()
      refreshAll()
    } else {
      Dialog.toast('请稍后重试', 'error')
    }
  }, [selectedIdols, batchEditField, batchEditValue, exitSelectionMode, refreshAll])

  const showExportOptions = () => {
    setActionSheetTitle('数据导入导出')
    setActionSheetOptions([
      { text: '导出为 JSON', icon: 'document-text-outline', onPress: handleExportJSON },
      { text: '导出为 CSV', icon: 'grid-outline', onPress: handleExportCSV },
      { text: '从 CSV 导入', icon: 'download-outline', onPress: handleImportCSV },
    ])
    setActionSheetVisible(true)
  }

  const handleExportJSON = async () => {
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
  }

  const handleExportCSV = async () => {
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
  }

  const handleImportCSV = async () => {
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
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }, [refreshAll])

  const showMoreOptions = () => {
    setActionSheetTitle('更多选项')
    setActionSheetOptions([
      { text: '主题设置', icon: 'color-palette-outline', onPress: () => navigation.navigate('ThemeSettings') },
      { text: '合并同日记录', icon: 'copy-outline', onPress: handleMergeSameDayRecords },
      { text: '创建备份', icon: 'cloud-upload-outline', onPress: handleCreateBackup },
      { text: '恢复备份', icon: 'cloud-download-outline', onPress: handleRestoreBackup },
    ])
    setActionSheetVisible(true)
  }

  const handleMergeSameDayRecords = async () => {
    // 先预览可以合并的记录
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
  }

  const handleCreateBackup = async () => {
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
  }

  const handleRestoreBackup = async () => {
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
  }

  const renderItem = React.useCallback(({ item, index }: { item: RankingItem; index: number }) => (
    <IdolCardAnimated
      idolName={item.idolName}
      totalCount={item.totalCount}
      latestPhoto={item.latestPhoto}
      avatarUri={avatarMap[item.idolName]}
      onPress={() => navigation.navigate('Detail', { idolName: item.idolName })}
      onLongPress={() => enterSelectionMode(item.idolName)}
      selected={selectedIdols.has(item.idolName)}
      selectionMode={selectionMode}
      onSelect={() => toggleSelection(item.idolName)}
      index={index}
    />
  ), [avatarMap, navigation, enterSelectionMode, selectedIdols, selectionMode, toggleSelection])

  const ListHeaderComponent = React.useMemo(() => (
    <>
      <StatsCard
        statistics={statistics}
        onPress={() => navigation.navigate('Statistics')}
      />

      <QuickActions
        activeFilterCount={activeFilterCount}
        onNavigateToCalendar={() => navigation.navigate('Calendar')}
        onShowFilter={() => setShowFilter(true)}
        onClearFilters={clearFilters}
        onNavigateToUpload={() => navigation.navigate('Upload', {})}
      />

      {ranking.length > 0 && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>偶像排行榜</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortOptions(true)}
          >
            <Ionicons name='swap-vertical' size={18} color={colors.PRIMARY} />
            <Text style={styles.sortText}>
              {SORT_OPTIONS.find(o => o.type === sortBy && o.order === sortOrder)?.label}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refreshAll}>
            <Ionicons name='refresh' size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  ), [statistics, filters, activeFilterCount, clearFilters, ranking.length, searchQuery, searchType, sortBy, sortOrder, colors.PRIMARY, styles, navigation, refreshAll])

  const ListFooterComponent = React.useMemo(() => (
    selectionMode ? null : <View style={styles.listFooter} />
  ), [selectionMode, styles.listFooter])

  if (loading) {
    return <HomeSkeleton />
  }

  if (error) {
    return (
      <EmptyState
        icon='alert-circle-outline'
        title='加载失败'
        message={error}
      />
    )
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        selectionMode={selectionMode}
        selectedCount={selectedIdols.size}
        onExitSelection={exitSelectionMode}
        onSelectAll={selectAll}
        onShowExportOptions={showExportOptions}
        onShowMoreOptions={showMoreOptions}
        onNavigateToUpload={() => navigation.navigate('Upload', {})}
      />

      <FlatList
        data={filteredRanking}
        renderItem={renderItem}
        keyExtractor={(item) => item.idolName}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={
          searchQuery.length > 0 || activeFilterCount > 0 ? (
            <EmptyState
              icon='search-outline'
              title='未找到相关偶像'
              message='试试其他关键词'
            />
          ) : (
            <EmptyState
              icon='camera-outline'
              title='还没有拍立得记录'
              message='点击右上角的 + 号开始添加'
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.PRIMARY]}
            tintColor={colors.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <BatchActionBar
        visible={selectionMode && selectedIdols.size > 0}
        onEdit={handleBatchEdit}
        onDelete={handleBatchDelete}
      />

      <AdvancedFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        currentFilters={filters}
        onApply={setFilters}
      />

      <BatchEditModal
        visible={showBatchEdit}
        selectedCount={selectedIdols.size}
        batchEditField={batchEditField}
        batchEditValue={batchEditValue}
        onFieldChange={setBatchEditField}
        onValueChange={setBatchEditValue}
        onApply={applyBatchEdit}
        onClose={() => setShowBatchEdit(false)}
      />

      <SortOptionsModal
        visible={showSortOptions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSelect={(type, order) => {
          setSortBy(type)
          setSortOrder(order)
        }}
        onClose={() => setShowSortOptions(false)}
      />

      <ActionSheetModal
        visible={actionSheetVisible}
        title={actionSheetTitle}
        options={actionSheetOptions}
        onClose={() => setActionSheetVisible(false)}
      />
    </View>
  )
}

export default HomeScreen
