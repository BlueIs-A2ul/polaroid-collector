import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  DimensionValue,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, CARD_SHADOW } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { getRanking, getStatistics, getMonthlySpending } from '../services/recordService'
import { RankingItem, Statistics, FieldStat, MonthlySpending } from '../types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import SpendingChart from '../components/common/SpendingChart'

type StatisticsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Statistics'
>
type StatisticsScreenRouteProp = RouteProp<RootStackParamList, 'Statistics'>

interface StatisticsScreenProps {
  navigation: StatisticsScreenNavigationProp
  route: StatisticsScreenRouteProp
}

interface FieldStatSectionProps {
  title: string
  stats: FieldStat[]
  icon: keyof typeof Ionicons.glyphMap
  emptyText: string
}

const FieldStatSection: React.FC<FieldStatSectionProps> = ({
  title,
  stats,
  icon,
  emptyText,
}) => {
  if (stats.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptySection}>
          <Ionicons name={icon} size={32} color={COLORS.GRAY[300]} />
          <Text style={styles.emptySectionText}>{emptyText}</Text>
        </View>
      </View>
    )
  }

  const total = stats.reduce((sum, s) => sum + s.count, 0)

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {stats.map((item, index) => {
        const percentage = ((item.count / total) * 100).toFixed(1)
        return (
          <View key={item.name} style={styles.statItem}>
            <View style={styles.statRank}>
              <Text style={styles.statRankText}>{index + 1}</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: (parseFloat(percentage) + '%') as DimensionValue },
                  ]}
                />
              </View>
            </View>
            <View style={styles.statStats}>
              <Text style={styles.statCount}>{item.count} 次</Text>
              <Text style={styles.statPercent}>{percentage}%</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const [statistics, setStatistics] = React.useState<Statistics | null>(null)
  const [ranking, setRanking] = React.useState<RankingItem[]>([])
  const [monthlySpending, setMonthlySpending] = React.useState<MonthlySpending[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const [statsResult, rankingResult, spendingResult] = await Promise.all([
      getStatistics(),
      getRanking(),
      getMonthlySpending(6),
    ])

    if (statsResult.success && statsResult.data) {
      setStatistics(statsResult.data)
    }
    if (rankingResult.success && rankingResult.data) {
      setRanking(rankingResult.data)
    }
    if (spendingResult.success && spendingResult.data) {
      setMonthlySpending(spendingResult.data)
    }
    setLoading(false)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadData()
    }, [loadData]),
  )

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!statistics || ranking.length === 0) {
    return (
      <EmptyState
        icon='stats-chart-outline'
        title='暂无数据'
        message='还没有拍立得记录'
      />
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.PRIMARY]}
          tintColor={COLORS.PRIMARY}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>统计概览</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name='camera' size={32} color={COLORS.PRIMARY} />
          <Text style={styles.summaryValue}>{statistics.totalPhotos}</Text>
          <Text style={styles.summaryLabel}>总拍立得</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name='person' size={32} color={COLORS.PRIMARY} />
          <Text style={styles.summaryValue}>{statistics.uniqueIdols}</Text>
          <Text style={styles.summaryLabel}>偶像数</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name='wallet' size={32} color={COLORS.PRIMARY} />
          <Text style={styles.summaryValue}>¥{statistics.totalPrice}</Text>
          <Text style={styles.summaryLabel}>总花费</Text>
        </View>
      </View>

      {statistics.totalPrice > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>花费趋势</Text>
          <SpendingChart data={monthlySpending} />
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>偶像占比</Text>
        {ranking.map((item, index) => {
          const percentage = ((item.totalCount / statistics.totalPhotos) * 100).toFixed(1)
          return (
            <TouchableOpacity
              key={item.idolName}
              style={styles.idolItem}
              onPress={() => navigation.navigate('Detail', { idolName: item.idolName })}
            >
              <View style={styles.idolRank}>
                <Text style={styles.idolRankText}>{index + 1}</Text>
              </View>
              <View style={styles.idolInfo}>
                <Text style={styles.idolName}>{item.idolName}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: (parseFloat(percentage) + '%') as DimensionValue },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.idolStats}>
                <Text style={styles.idolCount}>{item.totalCount} 张</Text>
                <Text style={styles.idolPercent}>{percentage}%</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      <FieldStatSection
        title='团体统计'
        stats={statistics.groupStats}
        icon='people'
        emptyText='暂无团体记录'
      />

      <FieldStatSection
        title='城市统计'
        stats={statistics.cityStats}
        icon='location'
        emptyText='暂无城市记录'
      />

      <FieldStatSection
        title='场馆统计'
        stats={statistics.venueStats}
        icon='business'
        emptyText='暂无场馆记录'
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: -20,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    ...CARD_SHADOW,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.GRAY[600],
    marginTop: 4,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  emptySection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  emptySectionText: {
    fontSize: 14,
    color: COLORS.GRAY[500],
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...CARD_SHADOW,
  },
  statRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GRAY[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.GRAY[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.GRAY[400],
    borderRadius: 3,
  },
  statStats: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  statCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  statPercent: {
    fontSize: 12,
    color: COLORS.GRAY[600],
    marginTop: 2,
  },
  idolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...CARD_SHADOW,
  },
  idolRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  idolRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  idolInfo: {
    flex: 1,
  },
  idolName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  idolStats: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  idolCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  idolPercent: {
    fontSize: 12,
    color: COLORS.GRAY[600],
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
})

export default StatisticsScreen