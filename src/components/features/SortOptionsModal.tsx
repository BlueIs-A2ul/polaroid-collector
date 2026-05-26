import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'
import AnimatedBottomSheet from '../common/AnimatedBottomSheet'

export type SortType = 'date' | 'count' | 'price'
export type SortOrder = 'asc' | 'desc'

interface SortOption {
  type: SortType
  order: SortOrder
  label: string
}

export const SORT_OPTIONS: SortOption[] = [
  { type: 'date', order: 'desc', label: '最新日期' },
  { type: 'date', order: 'asc', label: '最早日期' },
  { type: 'count', order: 'desc', label: '数量最多' },
  { type: 'count', order: 'asc', label: '数量最少' },
  { type: 'price', order: 'desc', label: '花费最高' },
  { type: 'price', order: 'asc', label: '花费最低' },
]

interface SortOptionsModalProps {
  visible: boolean
  sortBy: SortType
  sortOrder: SortOrder
  onSelect: (type: SortType, order: SortOrder) => void
  onClose: () => void
}

const SortOptionsModal: React.FC<SortOptionsModalProps> = ({
  visible,
  sortBy,
  sortOrder,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.WHITE,
      gap: 12,
    },
    sortOptionActive: {
      backgroundColor: withOpacity(colors.PRIMARY, 0.12),
      borderWidth: 2,
      borderColor: colors.PRIMARY,
    },
    sortOptionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: withOpacity(colors.PRIMARY, 0.19),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortOptionText: {
      fontSize: 16,
      color: colors.BLACK,
      fontWeight: '500',
    },
    sortOptionTextActive: {
      color: colors.PRIMARY,
    },
  }), [colors])

  const getIconName = (type: SortType): 'calendar' | 'camera' | 'wallet' => {
    switch (type) {
      case 'date': return 'calendar'
      case 'count': return 'camera'
      case 'price': return 'wallet'
      default: return 'calendar'
    }
  }

  return (
    <AnimatedBottomSheet
      visible={visible}
      onClose={onClose}
      title='排序方式'
    >
      <View style={{ padding: 16 }}>
        <ScrollView>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={`${option.type}-${option.order}`}
              style={[
                styles.sortOption,
                sortBy === option.type && sortOrder === option.order && styles.sortOptionActive,
              ]}
              onPress={() => {
                onSelect(option.type, option.order)
                onClose()
              }}
            >
              <View style={styles.sortOptionIcon}>
                <Ionicons
                  name={getIconName(option.type)}
                  size={18}
                  color={colors.PRIMARY}
                />
              </View>
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.type && sortOrder === option.order && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.type && sortOrder === option.order && (
                <Ionicons
                  name='checkmark'
                  size={20}
                  color={colors.PRIMARY}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </AnimatedBottomSheet>
  )
}

export default SortOptionsModal
