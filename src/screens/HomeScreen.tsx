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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useRecords } from '../hooks/useRecords'
import IdolCard from '../components/features/IdolCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import SearchBar from '../components/common/SearchBar'
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
import { getAllAvatars } from '../services/avatarService'
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
  const [refreshing, setRefreshing] = React.useState(false)
  const [avatarMap, setAvatarMap] = React.useState<Record<string, string>>({})
  const [showFilter, setShowFilter] = React.useState(false)
  const [filters, setFilters] = React.useState<FilterOptions>({
    groupName: null,
    city: null,
    venue: null,
    polaroidType: null,
  })

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
    let result = ranking.filter(item =>
      item.idolName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

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

    return result
  }, [ranking, searchQuery, filters])

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
    return <LoadingSpinner />
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
          placeholder='搜索偶像...'
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>偶像排行榜</Text>
        <TouchableOpacity onPress={refreshAll}>
          <Ionicons name='refresh' size={20} color={colors.PRIMARY} />
        </TouchableOpacity>
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
            <IdolCard
              key={item.idolName}
              idolName={item.idolName}
              totalCount={item.totalCount}
              latestPhoto={item.latestPhoto}
              avatarUri={avatarMap[item.idolName]}
              onPress={() =>
                navigation.navigate('Detail', { idolName: item.idolName })
              }
            />
          ))
        )}
      </ScrollView>

      <AdvancedFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        currentFilters={filters}
        onApply={setFilters}
      />
    </View>
  )
}

export default HomeScreen