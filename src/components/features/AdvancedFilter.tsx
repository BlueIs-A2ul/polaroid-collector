import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { getAllRecords } from '../../services/storageService'
import { PolaroidRecord } from '../../types'
import {
  DEFAULT_FILTER_OPTIONS,
  FilterOptions,
  PresenceFilter,
  getActiveFilterCount,
} from '../../utils/filterUtils'
import { POLAROID_TYPES } from '../../constants/polaroidOptions'
import AnimatedBottomSheet from '../common/AnimatedBottomSheet'

interface AdvancedFilterProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

type ChoiceFilterField = 'groupName' | 'city' | 'venue' | 'polaroidType'

const PRESENCE_OPTIONS: Array<{ value: PresenceFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'yes', label: '有' },
  { value: 'no', label: '无' },
]

const parsePrice = (value: string): number | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  if (Number.isNaN(parsed)) return null
  return parsed
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const { colors } = useTheme()
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)
  const [minPriceText, setMinPriceText] = useState('')
  const [maxPriceText, setMaxPriceText] = useState('')

  const [groupNames, setGroupNames] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [venues, setVenues] = useState<string[]>([])

  const styles = useMemo(() => StyleSheet.create({
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.BLACK,
      marginBottom: 12,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.WHITE,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    optionButtonActive: {
      backgroundColor: colors.PRIMARY,
      borderColor: colors.PRIMARY,
    },
    optionText: {
      fontSize: 14,
      color: colors.BLACK,
    },
    optionTextActive: {
      color: colors.WHITE,
      fontWeight: '500',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    priceInput: {
      flex: 1,
      backgroundColor: colors.WHITE,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.BLACK,
    },
    priceDivider: {
      color: colors.GRAY[400],
      fontSize: 14,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.GRAY[500],
      marginTop: 12,
    },
    emptyHint: {
      fontSize: 12,
      color: colors.GRAY[400],
      marginTop: 4,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.GRAY[200],
      gap: 12,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    clearButtonText: {
      fontSize: 14,
      color: colors.GRAY[600],
    },
    applyButton: {
      flex: 1,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
  }), [colors])

  useEffect(() => {
    if (visible) {
      loadRecords()
      setFilters(currentFilters)
      setMinPriceText(currentFilters.minPrice === null ? '' : String(currentFilters.minPrice))
      setMaxPriceText(currentFilters.maxPrice === null ? '' : String(currentFilters.maxPrice))
    }
  }, [visible, currentFilters])

  const loadRecords = async (): Promise<void> => {
    const { success, data } = await getAllRecords()
    if (success && data) {
      extractOptions(data)
    }
  }

  const extractOptions = (records: PolaroidRecord[]): void => {
    const groupNameSet = new Set<string>()
    const citySet = new Set<string>()
    const venueSet = new Set<string>()

    records.forEach(record => {
      if (record.groupName) groupNameSet.add(record.groupName)
      if (record.city) citySet.add(record.city)
      if (record.venue) venueSet.add(record.venue)
    })

    setGroupNames(Array.from(groupNameSet).sort())
    setCities(Array.from(citySet).sort())
    setVenues(Array.from(venueSet).sort())
  }

  const getDraftFilters = (): FilterOptions => ({
    ...filters,
    minPrice: parsePrice(minPriceText),
    maxPrice: parsePrice(maxPriceText),
  })

  const handleSelect = (field: ChoiceFilterField, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }))
  }

  const handlePresenceSelect = (
    field: 'hasBackPhoto' | 'hasNote',
    value: PresenceFilter,
  ): void => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClear = (): void => {
    setFilters(DEFAULT_FILTER_OPTIONS)
    setMinPriceText('')
    setMaxPriceText('')
  }

  const handleApply = (): void => {
    onApply(getDraftFilters())
    onClose()
  }

  const hasActiveFilters = getActiveFilterCount(getDraftFilters()) > 0
  const hasFieldOptions = groupNames.length > 0 || cities.length > 0 || venues.length > 0

  const renderFilterSection = (
    title: string,
    field: ChoiceFilterField,
    options: string[],
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              filters[field] === option && styles.optionButtonActive,
            ]}
            onPress={() => handleSelect(field, option)}
          >
            <Text
              style={[
                styles.optionText,
                filters[field] === option && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderPresenceSection = (
    title: string,
    field: 'hasBackPhoto' | 'hasNote',
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {PRESENCE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              filters[field] === option.value && styles.optionButtonActive,
            ]}
            onPress={() => handlePresenceSelect(field, option.value)}
          >
            <Text
              style={[
                styles.optionText,
                filters[field] === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <AnimatedBottomSheet
      visible={visible}
      onClose={onClose}
      title='高级筛选'
    >
      <ScrollView style={{ padding: 16, maxHeight: 500 }}>
        {groupNames.length > 0 &&
          renderFilterSection('团体', 'groupName', groupNames)}

        {cities.length > 0 &&
          renderFilterSection('城市', 'city', cities)}

        {venues.length > 0 &&
          renderFilterSection('场馆', 'venue', venues)}

        {renderFilterSection('拍立得类型', 'polaroidType', [...POLAROID_TYPES])}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>价格区间</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              value={minPriceText}
              onChangeText={setMinPriceText}
              placeholder='最低价'
              placeholderTextColor={colors.GRAY[400]}
              keyboardType='numeric'
            />
            <Text style={styles.priceDivider}>至</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPriceText}
              onChangeText={setMaxPriceText}
              placeholder='最高价'
              placeholderTextColor={colors.GRAY[400]}
              keyboardType='numeric'
            />
          </View>
        </View>

        {renderPresenceSection('背签照片', 'hasBackPhoto')}
        {renderPresenceSection('备注', 'hasNote')}

        {!hasFieldOptions && (
          <View style={styles.emptyState}>
            <Ionicons
              name='filter-outline'
              size={48}
              color={colors.GRAY[300]}
            />
            <Text style={styles.emptyText}>
              暂无团体、城市或场馆数据
            </Text>
            <Text style={styles.emptyHint}>
              仍可按类型、价格、背签和备注筛选
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.modalFooter}>
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Ionicons name='close-circle' size={18} color={colors.GRAY[600]} />
            <Text style={styles.clearButtonText}>清除筛选</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>应用筛选</Text>
        </TouchableOpacity>
      </View>
    </AnimatedBottomSheet>
  )
}

export default AdvancedFilter
