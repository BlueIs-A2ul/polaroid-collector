import React from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import type { RootStackParamList } from '../types/navigation'
import { useHomeActions } from '../hooks/useHomeActions'
import { useRecords } from '../hooks/useRecords'
import IdolCardAnimated from '../components/features/IdolCardAnimated'
import EmptyState from '../components/common/EmptyState'
import { HomeSkeleton } from '../components/common/Skeleton'
import HomeHeader from '../components/features/HomeHeader'
import HomeListHeader from '../components/features/HomeListHeader'
import BatchActionBar from '../components/features/BatchActionBar'
import BatchEditModal from '../components/features/BatchEditModal'
import SortOptionsModal from '../components/features/SortOptionsModal'
import ActionSheetModal from '../components/features/ActionSheetModal'
import AdvancedFilter from '../components/features/AdvancedFilter'
import { getAllAvatars, removeAvatar } from '../services/avatarService'
import { Dialog } from '../services/dialogService'
import { deleteRecordsByIdolNames, updateRecordsByIdolNames } from '../services/storageService'
import { RankingItem } from '../types'
import {
  DEFAULT_FILTER_OPTIONS,
  FilterOptions,
  SearchType,
  filterRankingItems,
  getActiveFilterCount,
} from '../utils/filterUtils'
import {
  SortOrder,
  SortType,
  sortRankingItems,
} from '../utils/homeRankingUtils'

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

  const {
    actionSheetVisible,
    actionSheetTitle,
    actionSheetOptions,
    closeActionSheet,
    showExportOptions,
    showMoreOptions,
  } = useHomeActions({ navigation, refreshAll })

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
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
    const result = filterRankingItems(ranking, searchQuery, searchType, filters)
    return sortRankingItems(result, sortBy, sortOrder)
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }, [refreshAll])

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
    <HomeListHeader
      statistics={statistics}
      rankingCount={ranking.length}
      activeFilterCount={activeFilterCount}
      searchQuery={searchQuery}
      searchType={searchType}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSearchQueryChange={setSearchQuery}
      onSearchTypeChange={setSearchType}
      onNavigateToStatistics={() => navigation.navigate('Statistics')}
      onNavigateToCalendar={() => navigation.navigate('Calendar')}
      onNavigateToUpload={() => navigation.navigate('Upload', {})}
      onShowFilter={() => setShowFilter(true)}
      onClearFilters={clearFilters}
      onShowSortOptions={() => setShowSortOptions(true)}
      onRefresh={refreshAll}
    />
  ), [
    activeFilterCount,
    clearFilters,
    navigation,
    ranking.length,
    refreshAll,
    searchQuery,
    searchType,
    sortBy,
    sortOrder,
    statistics,
  ])

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
        onClose={closeActionSheet}
      />
    </View>
  )
}

export default HomeScreen
