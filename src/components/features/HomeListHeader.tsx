import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { Statistics } from '../../types'
import { SearchType } from '../../utils/filterUtils'
import {
  SORT_OPTIONS,
  SortOrder,
  SortType,
} from '../../utils/homeRankingUtils'
import SearchBar from '../common/SearchBar'
import QuickActions from './QuickActions'
import StatsCard from './StatsCard'

interface HomeListHeaderProps {
  statistics: Statistics | null
  rankingCount: number
  activeFilterCount: number
  searchQuery: string
  searchType: SearchType
  sortBy: SortType
  sortOrder: SortOrder
  onSearchQueryChange: (value: string) => void
  onSearchTypeChange: (value: SearchType) => void
  onNavigateToStatistics: () => void
  onNavigateToCalendar: () => void
  onNavigateToUpload: () => void
  onShowFilter: () => void
  onClearFilters: () => void
  onShowSortOptions: () => void
  onRefresh: () => void
}

const HomeListHeader: React.FC<HomeListHeaderProps> = ({
  statistics,
  rankingCount,
  activeFilterCount,
  searchQuery,
  searchType,
  sortBy,
  sortOrder,
  onSearchQueryChange,
  onSearchTypeChange,
  onNavigateToStatistics,
  onNavigateToCalendar,
  onNavigateToUpload,
  onShowFilter,
  onClearFilters,
  onShowSortOptions,
  onRefresh,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
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
      color: colors.BLACK,
    },
    sectionActions: {
      flexDirection: 'row',
      gap: 8,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sortText: {
      fontSize: 12,
      color: colors.PRIMARY,
    },
  }), [colors])

  const sortLabel = SORT_OPTIONS.find(
    option => option.type === sortBy && option.order === sortOrder,
  )?.label

  return (
    <>
      <StatsCard
        statistics={statistics}
        onPress={onNavigateToStatistics}
      />

      <QuickActions
        activeFilterCount={activeFilterCount}
        onNavigateToCalendar={onNavigateToCalendar}
        onShowFilter={onShowFilter}
        onClearFilters={onClearFilters}
        onNavigateToUpload={onNavigateToUpload}
      />

      {rankingCount > 0 && (
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>偶像排行榜</Text>
        <View style={styles.sectionActions}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={onShowSortOptions}
          >
            <Ionicons name='swap-vertical' size={18} color={colors.PRIMARY} />
            <Text style={styles.sortText}>{sortLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name='refresh' size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default HomeListHeader
