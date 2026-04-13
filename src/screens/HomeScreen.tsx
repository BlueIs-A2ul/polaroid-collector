import React from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
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
import SearchBar, { SearchType } from '../components/common/SearchBar'
import { HomeSkeleton } from '../components/common/Skeleton'
import HomeHeader from '../components/features/HomeHeader'
import StatsCard from '../components/features/StatsCard'
import QuickActions from '../components/features/QuickActions'
import BatchActionBar from '../components/features/BatchActionBar'
import BatchEditModal from '../components/features/BatchEditModal'
import SortOptionsModal, { SortType, SortOrder, SORT_OPTIONS } from '../components/features/SortOptionsModal'
import AdvancedFilter, { FilterOptions } from '../components/features/AdvancedFilter'
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
import * as DocumentPicker from 'expo-document-picker'
import { RankingItem } from '../types'

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
  const [searchType, setSearchType] = React.useState<SearchType>('idolName')
  const [refreshing, setRefreshing] = React.useState(false)
  const [avatarMap, setAvatarMap] = React.useState<Record<string, string>>({})
  const [showFilter, setShowFilter] = React.useState(false)
  const [filters, setFilters] = React.useState<FilterOptions>({
    groupName: null,
    city: null,
    venue: null,
    polaroidType: null,
  })
  const [selectionMode, setSelectionMode] = React.useState(false)
  const [selectedIdols, setSelectedIdols] = React.useState<Set<string>>(new Set())
  const [showBatchEdit, setShowBatchEdit] = React.useState(false)
  const [batchEditField, setBatchEditField] = React.useState<'groupName' | 'city' | 'venue'>('groupName')
  const [batchEditValue, setBatchEditValue] = React.useState('')
  const [sortBy, setSortBy] = React.useState<SortType>('date')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')
  const [showSortOptions, setShowSortOptions] = React.useState(false)

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

  const filteredRanking = React.useMemo(() => {
    let result = ranking

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => {
        if (searchType === 'idolName') {
          return item.idolName.toLowerCase().includes(query)
        }

        const records = item.records
        if (searchType === 'groupName') {
          return records.some(r => r.groupName?.toLowerCase().includes(query))
        }
        if (searchType === 'city') {
          return records.some(r => r.city?.toLowerCase().includes(query))
        }
        if (searchType === 'venue') {
          return records.some(r => r.venue?.toLowerCase().includes(query))
        }
        return false
      })
    }

    if (filters.groupName || filters.city || filters.venue || filters.polaroidType) {
      result = result.filter(item => {
        const records = item.records
        return records.some(r => {
          if (filters.groupName && r.groupName !== filters.groupName) return false
          if (filters.city && r.city !== filters.city) return false
          if (filters.venue && r.venue !== filters.venue) return false
          if (filters.polaroidType && r.polaroidType !== filters.polaroidType) return false
          return true
        })
      })
    }

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

  const handleBatchDelete = React.useCallback(() => {
    const count = selectedIdols.size
    Alert.alert(
      '批量删除',
      `确定要删除 ${count} 个偶像的所有记录吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const idolNames = Array.from(selectedIdols)
            for (const name of idolNames) {
              await removeAvatar(name)
            }
            const { success, data: deletedCount } = await deleteRecordsByIdolNames(idolNames)
            if (success) {
              Alert.alert('删除成功', `已删除 ${deletedCount} 条记录`)
              exitSelectionMode()
              refreshAll()
              loadAvatars()
            } else {
              Alert.alert('删除失败', '请稍后重试')
            }
          },
        },
      ],
    )
  }, [selectedIdols, exitSelectionMode, refreshAll, loadAvatars])

  const handleBatchEdit = React.useCallback(() => {
    setBatchEditValue('')
    setShowBatchEdit(true)
  }, [])

  const applyBatchEdit = React.useCallback(async () => {
    if (!batchEditValue.trim()) {
      Alert.alert('提示', '请输入值')
      return
    }

    const idolNames = Array.from(selectedIdols)
    const updates: Record<string, string | undefined> = {
      [batchEditField]: batchEditValue.trim(),
    }

    const { success, data: updatedCount } = await updateRecordsByIdolNames(idolNames, updates)
    if (success) {
      Alert.alert('修改成功', `已更新 ${updatedCount} 条记录`)
      setShowBatchEdit(false)
      exitSelectionMode()
      refreshAll()
    } else {
      Alert.alert('修改失败', '请稍后重试')
    }
  }, [selectedIdols, batchEditField, batchEditValue, exitSelectionMode, refreshAll])

  const showExportOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '数据导入导出',
          options: ['导出为 JSON', '导出为 CSV', '从 CSV 导入', '取消'],
          cancelButtonIndex: 3,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            await handleExportJSON()
          } else if (buttonIndex === 1) {
            await handleExportCSV()
          } else if (buttonIndex === 2) {
            await handleImportCSV()
          }
        },
      )
    } else {
      Alert.alert('数据导入导出', '请选择操作', [
        { text: '导出为 JSON', onPress: handleExportJSON },
        { text: '导出为 CSV', onPress: handleExportCSV },
        { text: '从 CSV 导入', onPress: handleImportCSV },
        { text: '取消', style: 'cancel' },
      ])
    }
  }

  const handleExportJSON = async () => {
    const { success, data: fileUri, error: err } = await exportToJSON()
    if (success && fileUri) {
      Alert.alert('导出成功', 'JSON 文件已生成，是否分享？', [
        { text: '取消', style: 'cancel' },
        {
          text: '分享',
          onPress: () => shareExportedFile(fileUri),
        },
      ])
    } else {
      Alert.alert('导出失败', err || '未知错误')
    }
  }

  const handleExportCSV = async () => {
    const { success, data: fileUri, error: err } = await exportToCSV()
    if (success && fileUri) {
      Alert.alert('导出成功', 'CSV 文件已生成，是否分享？', [
        { text: '取消', style: 'cancel' },
        {
          text: '分享',
          onPress: () => shareExportedFile(fileUri),
        },
      ])
    } else {
      Alert.alert('导出失败', err || '未知错误')
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
          Alert.alert('导入成功', `成功导入 ${count} 条记录`, [
            {
              text: '确定',
              onPress: () => refreshAll(),
            },
          ])
        } else {
          Alert.alert('导入失败', err || '未知错误')
        }
      }
    } catch (error) {
      Alert.alert(
        '导入失败',
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }, [refreshAll])

  const showMoreOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '更多选项',
          options: ['主题设置', '创建备份', '恢复备份', '取消'],
          cancelButtonIndex: 3,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            navigation.navigate('ThemeSettings')
          } else if (buttonIndex === 1) {
            await handleCreateBackup()
          } else if (buttonIndex === 2) {
            await handleRestoreBackup()
          }
        },
      )
    } else {
      Alert.alert('更多选项', '请选择操作', [
        { text: '主题设置', onPress: () => navigation.navigate('ThemeSettings') },
        { text: '创建备份', onPress: handleCreateBackup },
        { text: '恢复备份', onPress: handleRestoreBackup },
        { text: '取消', style: 'cancel' },
      ])
    }
  }

  const handleCreateBackup = async () => {
    const { success, data: fileUri, error: err } = await createBackup()
    if (success && fileUri) {
      Alert.alert('备份成功', '备份文件已生成，是否分享？', [
        { text: '取消', style: 'cancel' },
        {
          text: '分享',
          onPress: () => shareBackupFile(fileUri),
        },
      ])
    } else {
      Alert.alert('备份失败', err || '未知错误')
    }
  }

  const handleRestoreBackup = async () => {
    Alert.alert('恢复备份', '这将清除当前所有数据并从备份恢复，是否继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '继续',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: 'application/json',
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const { success, error: err } = await restoreFromBackup(
                result.assets[0].uri,
              )

              if (success) {
                Alert.alert('恢复成功', '数据已恢复', [
                  {
                    text: '确定',
                    onPress: () => refreshAll(),
                  },
                ])
              } else {
                Alert.alert('恢复失败', err || '未知错误')
              }
            }
          } catch (error) {
            Alert.alert(
              '恢复失败',
              error instanceof Error ? error.message : String(error),
            )
          }
        },
      },
    ])
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
        filters={filters}
        onNavigateToCalendar={() => navigation.navigate('Calendar')}
        onShowFilter={() => setShowFilter(true)}
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
  ), [statistics, filters, ranking.length, searchQuery, searchType, sortBy, sortOrder, colors.PRIMARY, styles, navigation, refreshAll])

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
          searchQuery.length > 0 ? (
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
    </View>
  )
}

export default HomeScreen