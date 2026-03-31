import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useRecords } from '../hooks/useRecords'
import IdolCard from '../components/features/IdolCard'
import SwipeableIdolCard from '../components/features/SwipeableIdolCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import SearchBar, { SearchType } from '../components/common/SearchBar'

export type SortType = 'date' | 'count' | 'price'
export type SortOrder = 'asc' | 'desc'

interface SortOption {
  type: SortType
  order: SortOrder
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { type: 'date', order: 'desc', label: '最新日期' },
  { type: 'date', order: 'asc', label: '最早日期' },
  { type: 'count', order: 'desc', label: '数量最多' },
  { type: 'count', order: 'asc', label: '数量最少' },
  { type: 'price', order: 'desc', label: '花费最高' },
  { type: 'price', order: 'asc', label: '花费最低' },
]

import AdvancedFilter, { FilterOptions } from '../components/features/AdvancedFilter'
import FieldHistorySelector from '../components/features/FieldHistorySelector'
import { HomeSkeleton } from '../components/common/Skeleton'
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
  const [showFieldHistory, setShowFieldHistory] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<SortType>('date')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')
  const [showSortOptions, setShowSortOptions] = React.useState(false)

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 40,
      backgroundColor: colors.PRIMARY,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    selectAllText: {
      fontSize: 14,
      color: colors.WHITE,
      fontWeight: '500',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    iconButton: {
      padding: 8,
    },
    addButton: {
      padding: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.WHITE,
      padding: 20,
      margin: 16,
      borderRadius: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statMoreHint: {
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginTop: 4,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    quickActionText: {
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    quickActionTextInactive: {
      color: colors.GRAY[500],
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
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    batchActionBar: {
      flexDirection: 'row',
      backgroundColor: colors.PRIMARY,
      padding: 16,
      paddingBottom: 24,
      gap: 16,
    },
    batchActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    deleteButton: {
      backgroundColor: '#EF4444',
    },
    batchActionText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.WHITE,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    modalContent: {
      padding: 16,
    },
    modalHint: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 16,
    },
    fieldSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    fieldOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.GRAY[100],
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    fieldOptionActive: {
      backgroundColor: colors.PRIMARY,
      borderColor: colors.PRIMARY,
    },
    fieldOptionText: {
      fontSize: 14,
      color: colors.BLACK,
    },
    fieldOptionTextActive: {
      color: colors.WHITE,
      fontWeight: '500',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.GRAY[300],
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.BLACK,
    },
    historyButton: {
      padding: 10,
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
    },
    applyButton: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.WHITE,
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
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.GRAY[100],
      gap: 12,
    },
    sortOptionActive: {
      backgroundColor: colors.PRIMARY + '20',
      borderWidth: 2,
      borderColor: colors.PRIMARY,
    },
    sortOptionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.PRIMARY + '30',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortOptionText: {
      fontSize: 16,
      color: colors.BLACK,
      fontWeight: '500',
    },
    sortOptionTextActive: {
      color: colors.PRIMARY,
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

  const handleDeleteIdol = React.useCallback(async (idolName: string) => {
    Alert.alert(
      '删除偶像',
      `确定要删除 ${idolName} 的所有记录吗？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await removeAvatar(idolName)
            const { success, data: deletedCount } = await deleteRecordsByIdolNames([idolName])
            if (success) {
              Alert.alert('删除成功', `已删除 ${deletedCount} 条记录`)
              refreshAll()
              loadAvatars()
            } else {
              Alert.alert('删除失败', '请稍后重试')
            }
          },
        },
      ],
    )
  }, [refreshAll, loadAvatars])

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
      <View style={styles.header}>
        {selectionMode ? (
          <>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.iconButton}>
              <Ionicons name='close' size={24} color={colors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.title}>已选择 {selectedIdols.size} 个</Text>
            <TouchableOpacity onPress={selectAll} style={styles.iconButton}>
              <Text style={styles.selectAllText}>全选</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>我的拍立得收藏</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={showExportOptions}
              >
                <Ionicons name='download-outline' size={24} color={colors.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={showMoreOptions}>
                <Ionicons name='settings-outline' size={24} color={colors.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <Ionicons name='add' size={24} color={colors.WHITE} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {statistics && (
        <TouchableOpacity
          style={styles.statsContainer}
          onPress={() => navigation.navigate('Statistics')}
        >
          <View style={styles.statItem}>
            <Ionicons name='camera' size={24} color={colors.PRIMARY} />
            <Text style={styles.statValue}>{statistics.totalPhotos}</Text>
            <Text style={styles.statLabel}>拍立得</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='person' size={24} color={colors.PRIMARY} />
            <Text style={styles.statValue}>{statistics.uniqueIdols}</Text>
            <Text style={styles.statLabel}>偶像</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='wallet' size={24} color={colors.PRIMARY} />
            <Text style={styles.statValue}>¥{statistics.totalPrice}</Text>
            <Text style={styles.statLabel}>总花费</Text>
          </View>
          <View style={styles.statMoreHint}>
            <Ionicons name='chevron-forward' size={20} color={colors.GRAY[400]} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name='calendar' size={24} color={colors.PRIMARY} />
          <Text style={styles.quickActionText}>日历</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons
            name={Object.values(filters).some(v => v) ? 'filter' : 'filter-outline'}
            size={24}
            color={Object.values(filters).some(v => v) ? colors.PRIMARY : colors.GRAY[500]}
          />
          <Text style={[
            styles.quickActionText,
            !Object.values(filters).some(v => v) && styles.quickActionTextInactive,
          ]}>
            筛选
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Upload')}
        >
          <Ionicons name='camera' size={24} color={colors.PRIMARY} />
          <Text style={styles.quickActionText}>上传</Text>
        </TouchableOpacity>
      </View>

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

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.PRIMARY]}
            tintColor={colors.PRIMARY}
          />
        }
      >
        {filteredRanking.length === 0 && searchQuery.length > 0 ? (
          <EmptyState
            icon='search-outline'
            title='未找到相关偶像'
            message='试试其他关键词'
          />
        ) : filteredRanking.length === 0 ? (
          <EmptyState
            icon='camera-outline'
            title='还没有拍立得记录'
            message='点击右上角的 + 号开始添加'
          />
        ) : (
          filteredRanking.map((item, index) => (
            <SwipeableIdolCard
              key={item.idolName}
              idolName={item.idolName}
              totalCount={item.totalCount}
              latestPhoto={item.latestPhoto}
              avatarUri={avatarMap[item.idolName]}
              onPress={() =>
                navigation.navigate('Detail', { idolName: item.idolName })
              }
              onLongPress={() => enterSelectionMode(item.idolName)}
              onDelete={() => handleDeleteIdol(item.idolName)}
              selected={selectedIdols.has(item.idolName)}
              selectionMode={selectionMode}
              onSelect={() => toggleSelection(item.idolName)}
            />
          ))
        )}
      </ScrollView>

      {selectionMode && selectedIdols.size > 0 && (
        <View style={styles.batchActionBar}>
          <TouchableOpacity
            style={styles.batchActionButton}
            onPress={handleBatchEdit}
          >
            <Ionicons name='create-outline' size={20} color={colors.WHITE} />
            <Text style={styles.batchActionText}>修改</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.batchActionButton, styles.deleteButton]}
            onPress={handleBatchDelete}
          >
            <Ionicons name='trash-outline' size={20} color={colors.WHITE} />
            <Text style={styles.batchActionText}>删除</Text>
          </TouchableOpacity>
        </View>
      )}

      <AdvancedFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        currentFilters={filters}
        onApply={setFilters}
      />

      <Modal
        visible={showBatchEdit}
        transparent
        animationType='slide'
        onRequestClose={() => setShowBatchEdit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>批量修改字段</Text>
              <TouchableOpacity onPress={() => setShowBatchEdit(false)}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalHint}>
                将修改 {selectedIdols.size} 个偶像的所有记录
              </Text>
              <View style={styles.fieldSelector}>
                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    batchEditField === 'groupName' && styles.fieldOptionActive,
                  ]}
                  onPress={() => setBatchEditField('groupName')}
                >
                  <Text
                    style={[
                      styles.fieldOptionText,
                      batchEditField === 'groupName' && styles.fieldOptionTextActive,
                    ]}
                  >
                    团体
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    batchEditField === 'city' && styles.fieldOptionActive,
                  ]}
                  onPress={() => setBatchEditField('city')}
                >
                  <Text
                    style={[
                      styles.fieldOptionText,
                      batchEditField === 'city' && styles.fieldOptionTextActive,
                    ]}
                  >
                    城市
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.fieldOption,
                    batchEditField === 'venue' && styles.fieldOptionActive,
                  ]}
                  onPress={() => setBatchEditField('venue')}
                >
                  <Text
                    style={[
                      styles.fieldOptionText,
                      batchEditField === 'venue' && styles.fieldOptionTextActive,
                    ]}
                  >
                    场馆
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={batchEditValue}
                  onChangeText={setBatchEditValue}
                  placeholder='输入新的值...'
                  placeholderTextColor={colors.GRAY[400]}
                />
                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={() => setShowFieldHistory(true)}
                >
                  <Ionicons name='time-outline' size={20} color={colors.PRIMARY} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyBatchEdit}
              >
                <Text style={styles.applyButtonText}>应用修改</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FieldHistorySelector
        visible={showFieldHistory}
        field={batchEditField}
        title={batchEditField === 'groupName' ? '团体' : batchEditField === 'city' ? '城市' : '场馆'}
        currentValue={batchEditValue}
        onSelect={(value) => {
          setBatchEditValue(value)
          setShowFieldHistory(false)
        }}
        onClose={() => setShowFieldHistory(false)}
      />

      <Modal
        visible={showSortOptions}
        transparent
        animationType='slide'
        onRequestClose={() => setShowSortOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>排序方式</Text>
              <TouchableOpacity onPress={() => setShowSortOptions(false)}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={`${option.type}-${option.order}`}
                  style={[
                    styles.sortOption,
                    sortBy === option.type && sortOrder === option.order && styles.sortOptionActive,
                  ]}
                  onPress={() => {
                    setSortBy(option.type)
                    setSortOrder(option.order)
                    setShowSortOptions(false)
                  }}
                >
                  <View style={styles.sortOptionIcon}>
                    <Ionicons
                      name={
                        option.type === 'date' ? 'calendar' :
                        option.type === 'count' ? 'camera' :
                        'wallet'
                      }
                      size={18}
                      color={colors.PRIMARY}
                    />
                  </View>
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.type && sortOrder === option.order && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.type && sortOrder === option.order && (
                    <Ionicons
                      name='checkmark'
                      size={20}
                      color={colors.PRIMARY}
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default HomeScreen