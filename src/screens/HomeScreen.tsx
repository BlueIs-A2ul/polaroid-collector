import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Upload')}
        >
          <Ionicons name='add' size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
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
