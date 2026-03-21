import React, { useMemo } from 'react'
import { View, Text, StyleSheet, DimensionValue } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
import { MonthlySpending } from '../../types'

interface SpendingChartProps {
  data: MonthlySpending[]
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const { colors } = useTheme()

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
      ...CARD_SHADOW,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    emptyText: {
      fontSize: 14,
      color: colors.GRAY[500],
      marginTop: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[100],
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.GRAY[500],
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.PRIMARY,
    },
    chartContainer: {
      marginTop: 8,
    },
    chart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      paddingHorizontal: 4,
    },
    barWrapper: {
      flex: 1,
      alignItems: 'center',
    },
    barValueContainer: {
      height: 20,
      justifyContent: 'flex-end',
      marginBottom: 4,
    },
    barValue: {
      fontSize: 10,
      color: colors.GRAY[600],
      fontWeight: '500',
    },
    barBackground: {
      width: 20,
      height: 80,
      backgroundColor: colors.GRAY[100],
      borderRadius: 4,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    bar: {
      width: '100%',
      borderRadius: 4,
    },
    barLabel: {
      fontSize: 11,
      color: colors.GRAY[500],
      marginTop: 6,
    },
  }), [colors])

  if (data.length === 0 || data.every(d => d.totalSpending === 0)) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name='bar-chart-outline' size={32} color={colors.GRAY[300]} />
          <Text style={styles.emptyText}>暂无花费记录</Text>
        </View>
      </View>
    )
  }

  const maxSpending = Math.max(...data.map(d => d.totalSpending), 1)
  const totalSpending = data.reduce((sum, d) => sum + d.totalSpending, 0)
  const avgSpending = totalSpending / data.filter(d => d.totalSpending > 0).length || 0

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>近 {data.length} 月总花费</Text>
          <Text style={styles.summaryValue}>¥{totalSpending.toFixed(0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>月均花费</Text>
          <Text style={styles.summaryValue}>¥{avgSpending.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item) => {
            const heightPercent = (item.totalSpending / maxSpending) * 100
            const barHeight = Math.max(heightPercent, 2) as DimensionValue

            return (
              <View key={`${item.year}-${item.month}`} style={styles.barWrapper}>
                <View style={styles.barValueContainer}>
                  {item.totalSpending > 0 && (
                    <Text style={styles.barValue}>
                      {item.totalSpending >= 1000
                        ? `${(item.totalSpending / 1000).toFixed(1)}k`
                        : item.totalSpending.toFixed(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor:
                          item.totalSpending > 0 ? colors.PRIMARY : colors.GRAY[200],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

export default SpendingChart