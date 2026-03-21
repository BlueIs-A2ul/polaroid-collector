import React, { useMemo } from 'react'
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
import { useTheme } from '../contexts/ThemeContext'
import { CARD_SHADOW } from '../constants/themes'
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

type RankingTab = 'count' | 'price'

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
  const { colors } = useTheme()

  const styles = useMemo(() => StyleSheet.create({
    sectionContainer: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 12,
    },
    emptySection: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      ...CARD_SHADOW,
    },
    emptySectionText: {
      fontSize: 14,
      color: colors.GRAY[500],
      marginTop: 8,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      ...CARD_SHADOW,
    },
    statRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.GRAY[400],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statRankText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    statInfo: {
      flex: 1,
    },
    statName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 6,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.GRAY[200],
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.GRAY[400],
      borderRadius: 3,
    },
    statStats: {
      alignItems: 'flex-end',
      marginLeft: 12,
    },
    statCount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    statPercent: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginTop: 2,
    },
  }), [colors])

  if (stats.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptySection}>
          <Ionicons name={icon} size={32} color={colors.GRAY[300]} />
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
  const { colors } = useTheme()
  const [statistics, setStatistics] = React.useState<Statistics | null>(null)
  const [ranking, setRanking] = React.useState<RankingItem[]>([])
  const [monthlySpending, setMonthlySpending] = React.useState<MonthlySpending[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [rankingTab, setRankingTab] = React.useState<RankingTab>('count')

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    header: {
      backgroundColor: colors.PRIMARY,
      padding: 20,
      paddingTop: 60,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      marginTop: -20,
    },
    summaryCard: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      minWidth: 100,
      ...CARD_SHADOW,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginTop: 8,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginTop: 4,
    },
    sectionContainer: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 12,
    },
    idolItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      ...CARD_SHADOW,
    },
    idolRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    idolRankText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    idolInfo: {
      flex: 1,
    },
    idolName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 6,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.GRAY[200],
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.GRAY[400],
      borderRadius: 3,
    },
    idolStats: {
      alignItems: 'flex-end',
      marginLeft: 12,
    },
    idolCount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    idolPercent: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginTop: 2,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    tabActive: {
      backgroundColor: colors.PRIMARY,
    },
    tabText: {
      fontSize: 14,
      color: colors.GRAY[600],
      fontWeight: '500',
    },
    tabTextActive: {
      color: colors.WHITE,
    },
    yearlyReportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 16,
      borderRadius: 16,
      ...CARD_SHADOW,
    },
    yearlyReportIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    yearlyReportContent: {
      flex: 1,
    },
    yearlyReportTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    yearlyReportSubtitle: {
      fontSize: 12,
      color: colors.GRAY[500],
      marginTop: 2,
    },
    bottomPadding: {
      height: 20,
    },
  }), [colors])

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
          colors={[colors.PRIMARY]}
          tintColor={colors.PRIMARY}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>统计概览</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name='camera' size={32} color={colors.PRIMARY} />
          <Text style={styles.summaryValue}>{statistics.totalPhotos}</Text>
          <Text style={styles.summaryLabel}>总拍立得</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name='person' size={32} color={colors.PRIMARY} />
          <Text style={styles.summaryValue}>{statistics.uniqueIdols}</Text>
          <Text style={styles.summaryLabel}>偶像数</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name='wallet' size={32} color={colors.PRIMARY} />
          <Text style={styles.summaryValue}>¥{statistics.totalPrice}</Text>
          <Text style={styles.summaryLabel}>总花费</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.yearlyReportCard}
        onPress={() => navigation.navigate('YearlyReport')}
      >
        <View style={styles.yearlyReportIcon}>
          <Ionicons name='sparkles' size={24} color={colors.WHITE} />
        </View>
        <View style={styles.yearlyReportContent}>
          <Text style={styles.yearlyReportTitle}>年度报告</Text>
          <Text style={styles.yearlyReportSubtitle}>回顾你的拍立得之旅</Text>
        </View>
        <Ionicons name='chevron-forward' size={24} color={colors.GRAY[400]} />
      </TouchableOpacity>

      {statistics.totalPrice > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>花费趋势</Text>
          <SpendingChart data={monthlySpending} />
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>偶像排行</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, rankingTab === 'count' && styles.tabActive]}
            onPress={() => setRankingTab('count')}
          >
            <Text style={[styles.tabText, rankingTab === 'count' && styles.tabTextActive]}>
              数量排行
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, rankingTab === 'price' && styles.tabActive]}
            onPress={() => setRankingTab('price')}
          >
            <Text style={[styles.tabText, rankingTab === 'price' && styles.tabTextActive]}>
              花费排行
            </Text>
          </TouchableOpacity>
        </View>

        {(rankingTab === 'count' ? ranking : [...ranking].sort((a, b) => b.totalPrice - a.totalPrice)).map((item, index) => {
          const isCountTab = rankingTab === 'count'
          const value = isCountTab ? item.totalCount : item.totalPrice
          const total = isCountTab ? statistics.totalPhotos : statistics.totalPrice
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'

          if (!isCountTab && item.totalPrice === 0) return null

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
                <Text style={styles.idolCount}>
                  {isCountTab ? `${item.totalCount} 张` : `¥${item.totalPrice}`}
                </Text>
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

export default StatisticsScreen