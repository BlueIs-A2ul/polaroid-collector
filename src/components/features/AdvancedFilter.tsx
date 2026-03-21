import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
import { getAllRecords } from '../../services/storageService'
import { PolaroidRecord } from '../../types'

export interface FilterOptions {
  groupName: string | null
  city: string | null
  venue: string | null
  polaroidType: string | null
}

interface AdvancedFilterProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const { colors } = useTheme()
  const [records, setRecords] = useState<PolaroidRecord[]>([])
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)

  const [groupNames, setGroupNames] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [venues, setVenues] = useState<string[]>([])
  const [types] = useState<string[]>(['无签', '带签', '主题', '宿题'])

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.WHITE,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    modalContent: {
      padding: 16,
      maxHeight: 400,
    },
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
      backgroundColor: colors.GRAY[100],
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
    }
  }, [visible, currentFilters])

  const loadRecords = async () => {
    const { success, data } = await getAllRecords()
    if (success && data) {
      setRecords(data)
      extractOptions(data)
    }
  }

  const extractOptions = (records: PolaroidRecord[]) => {
    const groupNameSet = new Set<string>()
    const citySet = new Set<string>()
    const venueSet = new Set<string>()

    records.forEach(r => {
      if (r.groupName) groupNameSet.add(r.groupName)
      if (r.city) citySet.add(r.city)
      if (r.venue) venueSet.add(r.venue)
    })

    setGroupNames(Array.from(groupNameSet).sort())
    setCities(Array.from(citySet).sort())
    setVenues(Array.from(venueSet).sort())
  }

  const handleSelect = (field: keyof FilterOptions, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }))
  }

  const handleClear = () => {
    setFilters({
      groupName: null,
      city: null,
      venue: null,
      polaroidType: null,
    })
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== null)

  const renderFilterSection = (
    title: string,
    field: keyof FilterOptions,
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>高级筛选</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={24} color={colors.BLACK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {groupNames.length > 0 &&
              renderFilterSection('团体', 'groupName', groupNames)}

            {cities.length > 0 &&
              renderFilterSection('城市', 'city', cities)}

            {venues.length > 0 &&
              renderFilterSection('场馆', 'venue', venues)}

            {types.length > 0 &&
              renderFilterSection('拍立得类型', 'polaroidType', types)}

            {groupNames.length === 0 &&
              cities.length === 0 &&
              venues.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name='filter-outline'
                    size={48}
                    color={colors.GRAY[300]}
                  />
                  <Text style={styles.emptyText}>
                    暂无可筛选的数据
                  </Text>
                  <Text style={styles.emptyHint}>
                    添加记录后可使用筛选功能
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
        </View>
      </View>
    </Modal>
  )
}

export default AdvancedFilter