import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW_SMALL } from '../../constants/themes'

interface QuickActionsProps {
  activeFilterCount: number
  onNavigateToCalendar: () => void
  onShowFilter: () => void
  onClearFilters: () => void
  onNavigateToUpload: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({
  activeFilterCount,
  onNavigateToCalendar,
  onShowFilter,
  onClearFilters,
  onNavigateToUpload,
}) => {
  const { colors } = useTheme()
  const hasActiveFilters = activeFilterCount > 0

  const styles = React.useMemo(() => StyleSheet.create({
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 8,
      ...CARD_SHADOW_SMALL,
    },
    filterButton: {
      position: 'relative',
      borderWidth: hasActiveFilters ? 1 : 0,
      borderColor: colors.PRIMARY,
    },
    clearFilterButton: {
      width: 40,
      justifyContent: 'center',
      paddingHorizontal: 0,
    },
    quickActionText: {
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    quickActionTextInactive: {
      color: colors.GRAY[500],
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 5,
      backgroundColor: colors.ERROR,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.WHITE,
      fontSize: 11,
      fontWeight: '700',
    },
  }), [colors, hasActiveFilters])

  return (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={onNavigateToCalendar}
      >
        <Ionicons name='calendar' size={24} color={colors.PRIMARY} />
        <Text style={styles.quickActionText}>日历</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickActionButton, styles.filterButton]}
        onPress={onShowFilter}
      >
        <Ionicons
          name={hasActiveFilters ? 'filter' : 'filter-outline'}
          size={24}
          color={hasActiveFilters ? colors.PRIMARY : colors.GRAY[500]}
        />
        <Text style={[
          styles.quickActionText,
          !hasActiveFilters && styles.quickActionTextInactive,
        ]}>
          筛选
        </Text>
        {hasActiveFilters && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      {hasActiveFilters && (
        <TouchableOpacity
          style={[styles.quickActionButton, styles.clearFilterButton]}
          onPress={onClearFilters}
        >
          <Ionicons name='close' size={20} color={colors.PRIMARY} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={onNavigateToUpload}
      >
        <Ionicons name='camera' size={24} color={colors.PRIMARY} />
        <Text style={styles.quickActionText}>上传</Text>
      </TouchableOpacity>
    </View>
  )
}

export default QuickActions
