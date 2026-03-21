import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { getYearlyReport, getAvailableYears, YearlyReport } from '../services/reportService'
import { getAllAvatars } from '../services/avatarService'
import YearlyReportScreen from './YearlyReportScreen'

const YearlyReportEntryScreen: React.FC = () => {
  const { colors } = useTheme()
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [report, setReport] = useState<YearlyReport | null>(null)
  const [avatarMap, setAvatarMap] = useState<Record<string, string | undefined>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const years = await getAvailableYears()
    setAvailableYears(years)
    if (years.length > 0) {
      setSelectedYear(years[0])
    }

    const { success, data } = await getAllAvatars()
    if (success && data) {
      setAvatarMap(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (selectedYear) {
      loadReport(selectedYear)
    }
  }, [selectedYear])

  const loadReport = async (year: number) => {
    setReport(null)
    const { success, data } = await getYearlyReport(year)
    if (success && data) {
      setReport(data)
    }
  }

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
    yearSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      padding: 16,
    },
    yearButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.WHITE,
    },
    yearButtonActive: {
      backgroundColor: colors.PRIMARY,
    },
    yearButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    yearButtonTextActive: {
      color: colors.WHITE,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.GRAY[600],
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportContainer: {
      flex: 1,
    },
  }), [colors])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.PRIMARY} />
      </View>
    )
  }

  if (availableYears.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>年度报告</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name='calendar-outline' size={64} color={colors.GRAY[300]} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>暂无数据</Text>
          <Text style={styles.emptyText}>还没有拍立得记录{'\n'}无法生成年度报告</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!report ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>年度报告</Text>
          </View>

          <View style={styles.yearSelector}>
            {availableYears.map(year => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonActive,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.yearButtonTextActive,
                ]}>
                  {year} 年
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emptyContainer}>
            <ActivityIndicator size='large' color={colors.PRIMARY} />
          </View>
        </>
      ) : (
        <View style={styles.reportContainer}>
          <YearlyReportScreen report={report} avatarMap={avatarMap} />
        </View>
      )}
    </View>
  )
}

export default YearlyReportEntryScreen