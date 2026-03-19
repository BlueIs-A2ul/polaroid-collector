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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { COLORS } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useRecords } from '../hooks/useRecords'
import IdolCard from '../components/features/IdolCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import {
  exportToJSON,
  exportToCSV,
  shareExportedFile,
} from '../services/exportService'
import {
  createBackup,
  restoreFromBackup,
  shareBackupFile,
} from '../services/backupService'
import * as DocumentPicker from 'expo-document-picker'

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp
  route: HomeScreenRouteProp
}

/**
 * 首页
 * 显示偶像排行榜和统计信息
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { ranking, statistics, loading, error, refreshAll } = useRecords()

  /**
   * 显示导出选项
   */
  const showExportOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '导出数据',
          options: ['导出为 JSON', '导出为 CSV', '取消'],
          cancelButtonIndex: 2,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            await handleExportJSON()
          } else if (buttonIndex === 1) {
            await handleExportCSV()
          }
        },
      )
    } else {
      Alert.alert('导出数据', '请选择导出格式', [
        { text: '导出为 JSON', onPress: handleExportJSON },
        { text: '导出为 CSV', onPress: handleExportCSV },
        { text: '取消', style: 'cancel' },
      ])
    }
  }

  /**
   * 导出为 JSON
   */
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

  /**
   * 导出为 CSV
   */
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

  /**
   * 显示更多选项
   */
  const showMoreOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: '更多选项',
          options: ['创建备份', '恢复备份', '取消'],
          cancelButtonIndex: 2,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            await handleCreateBackup()
          } else if (buttonIndex === 1) {
            await handleRestoreBackup()
          }
        },
      )
    } else {
      Alert.alert('更多选项', '请选择操作', [
        { text: '创建备份', onPress: handleCreateBackup },
        { text: '恢复备份', onPress: handleRestoreBackup },
        { text: '取消', style: 'cancel' },
      ])
    }
  }

  /**
   * 创建备份
   */
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

  /**
   * 恢复备份
   */
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
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>我的拍立得收藏</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={showExportOptions}
          >
            <Ionicons name='download-outline' size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showMoreOptions}>
            <Ionicons name='settings-outline' size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Ionicons name='add' size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 统计信息 */}
      {statistics && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name='camera' size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{statistics.totalPhotos}</Text>
            <Text style={styles.statLabel}>拍立得</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='person' size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{statistics.uniqueIdols}</Text>
            <Text style={styles.statLabel}>偶像</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='images' size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{statistics.totalRecords}</Text>
            <Text style={styles.statLabel}>记录</Text>
          </View>
        </View>
      )}

      {/* 排行榜标题 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>偶像排行榜</Text>
        <TouchableOpacity onPress={refreshAll}>
          <Ionicons name='refresh' size={20} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* 排行榜列表 */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {ranking.length === 0 ? (
          <EmptyState
            icon='camera-outline'
            title='还没有拍立得记录'
            message='点击右上角的 + 号开始添加'
          />
        ) : (
          ranking.map((item, index) => (
            <IdolCard
              key={item.idolName}
              idolName={item.idolName}
              totalCount={item.totalCount}
              latestPhoto={item.latestPhoto}
              onPress={() =>
                navigation.navigate('Detail', { idolName: item.idolName })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.PRIMARY,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.WHITE,
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY[600],
    marginTop: 4,
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
    color: COLORS.BLACK,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
})

export default HomeScreen
