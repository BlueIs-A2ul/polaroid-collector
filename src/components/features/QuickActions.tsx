import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { FilterOptions } from './AdvancedFilter'

interface QuickActionsProps {
  filters: FilterOptions
  onNavigateToCalendar: () => void
  onShowFilter: () => void
  onNavigateToUpload: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({
  filters,
  onNavigateToCalendar,
  onShowFilter,
  onNavigateToUpload,
}) => {
  const { colors } = useTheme()
  const hasActiveFilters = Object.values(filters).some(v => v)

  const styles = React.useMemo(() => StyleSheet.create({
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
  }), [colors])

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
        style={styles.quickActionButton}
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
      </TouchableOpacity>
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