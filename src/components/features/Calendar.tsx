import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface CalendarProps {
  markedDates: Record<string, number>
  onDateSelect: (date: string) => void
  selectedDate: string | null
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const Calendar: React.FC<CalendarProps> = ({
  markedDates,
  onDateSelect,
  selectedDate,
}) => {
  const { colors } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    navButton: {
      padding: 8,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    todayButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.GRAY[100],
      borderRadius: 4,
    },
    todayButtonText: {
      fontSize: 12,
      color: colors.PRIMARY,
    },
    weekdays: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekdayCell: {
      width: '14.28%',
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: 12,
      color: colors.GRAY[600],
      fontWeight: '500',
    },
    weekendText: {
      color: colors.ERROR,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 8,
    },
    cell: {
      width: '14.28%',
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedCell: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
    },
    todayCell: {
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
    },
    dayText: {
      fontSize: 14,
      color: colors.BLACK,
      fontWeight: '500',
    },
    selectedDayText: {
      color: colors.WHITE,
      fontWeight: 'bold',
    },
    countBadge: {
      marginTop: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.PRIMARY,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    countBadgeMultiple: {
      backgroundColor: colors.SUCCESS,
    },
    countBadgeText: {
      fontSize: 10,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
  }), [colors])

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate()
  }, [currentYear, currentMonth])

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay()
  }, [currentYear, currentMonth])

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }, [currentYear, currentMonth])

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }, [currentYear, currentMonth])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
    onDateSelect(new Date().toISOString().split('T')[0])
  }, [onDateSelect])

  const formatDateKey = (day: number): string => {
    const month = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${currentYear}-${month}-${dayStr}`
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    )
  }

  const renderDays = () => {
    const days = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.cell} />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day)
      const count = markedDates[dateKey] || 0
      const isSelected = selectedDate === dateKey
      const isTodayDate = isToday(day)

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.cell,
            isSelected && styles.selectedCell,
            isTodayDate && !isSelected && styles.todayCell,
          ]}
          onPress={() => onDateSelect(dateKey)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
          ]}>
            {day}
          </Text>
          {count > 0 && (
            <View style={[styles.countBadge, count > 3 && styles.countBadgeMultiple]}>
              <Text style={styles.countBadgeText}>{count}</Text>
            </View>
          )}
        </TouchableOpacity>
      )
    }

    return days
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name='chevron-back' size={24} color={colors.BLACK} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {currentYear}年 {MONTHS[currentMonth]}
          </Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>今天</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name='chevron-forward' size={24} color={colors.BLACK} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={[
              styles.weekdayText,
              index === 0 && styles.weekendText,
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {renderDays()}
      </View>
    </View>
  )
}

export default Calendar