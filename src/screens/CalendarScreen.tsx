import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, CARD_SHADOW } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { getAllRecords } from '../services/storageService'
import { PolaroidRecord } from '../types'
import Calendar from '../components/features/Calendar'
import CachedImage from '../components/common/CachedImage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { formatDate } from '../utils/rankingUtils'

type CalendarScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Calendar'
>
type CalendarScreenRouteProp = RouteProp<RootStackParamList, 'Calendar'>

interface CalendarScreenProps {
  navigation: CalendarScreenNavigationProp
  route: CalendarScreenRouteProp
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const [records, setRecords] = useState<PolaroidRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    const { success, data } = await getAllRecords()
    if (success && data) {
      setRecords(data)
    }
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadRecords()
    }, [loadRecords]),
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadRecords()
    setRefreshing(false)
  }, [loadRecords])

  const markedDates = useMemo(() => {
    const dates: Record<string, number> = {}
    records.forEach(record => {
      dates[record.photoDate] = (dates[record.photoDate] || 0) + 1
    })
    return dates
  }, [records])

  const selectedRecords = useMemo(() => {
    if (!selectedDate) return []
    return records.filter(r => r.photoDate === selectedDate)
  }, [records, selectedDate])

  const totalPhotosOnDate = useMemo(() => {
    return selectedRecords.reduce((sum, r) => sum + r.photoCount, 0)
  }, [selectedRecords])

  if (loading) {
    return <LoadingSpinner />
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
        <Text style={styles.headerTitle}>日历视图</Text>
        <Text style={styles.headerSubtitle}>
          共 {records.length} 条记录
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </View>

      {selectedDate && (
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Ionicons name='calendar' size={20} color={COLORS.PRIMARY} />
            <Text style={styles.selectedTitle}>{formatDate(selectedDate)}</Text>
            <Text style={styles.selectedCount}>
              {selectedRecords.length} 条记录 · {totalPhotosOnDate} 张
            </Text>
          </View>

          {selectedRecords.length > 0 ? (
            <View style={styles.recordsGrid}>
              {selectedRecords.map(record => (
                <TouchableOpacity
                  key={record.id}
                  style={styles.recordCard}
                  onPress={() => navigation.navigate('Edit', { recordId: record.id })}
                >
                  <CachedImage
                    uri={record.photoUri}
                    style={styles.recordImage}
                  />
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordIdolName} numberOfLines={1}>
                      {record.idolName}
                    </Text>
                    <View style={styles.recordMeta}>
                      <Text style={styles.recordCount}>{record.photoCount} 张</Text>
                      {record.price !== undefined && record.price > 0 && (
                        <Text style={styles.recordPrice}>¥{record.price}</Text>
                      )}
                    </View>
                    {record.note && (
                      <Text style={styles.recordNote} numberOfLines={1}>
                        {record.note}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyDate}>
              <Ionicons name='camera-outline' size={40} color={COLORS.GRAY[300]} />
              <Text style={styles.emptyDateText}>这天没有拍摄记录</Text>
            </View>
          )}
        </View>
      )}

      {!selectedDate && (
        <View style={styles.hint}>
          <Ionicons name='hand-left-outline' size={20} color={COLORS.GRAY[500]} />
          <Text style={styles.hintText}>点击日期查看当天的拍摄记录</Text>
        </View>
      )}

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
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.8,
    marginTop: 4,
  },
  calendarContainer: {
    padding: 16,
  },
  selectedSection: {
    padding: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
  },
  selectedCount: {
    fontSize: 14,
    color: COLORS.GRAY[600],
  },
  recordsGrid: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  recordImage: {
    width: 80,
    height: 80,
  },
  recordInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recordIdolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  recordCount: {
    fontSize: 14,
    color: COLORS.GRAY[600],
  },
  recordPrice: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  recordNote: {
    fontSize: 12,
    color: COLORS.GRAY[500],
  },
  emptyDate: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  emptyDateText: {
    fontSize: 14,
    color: COLORS.GRAY[500],
    marginTop: 8,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.GRAY[500],
  },
  bottomPadding: {
    height: 20,
  },
})

export default CalendarScreen