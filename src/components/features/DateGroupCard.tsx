import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
import { formatDate } from '../../utils/rankingUtils'
import { PolaroidRecord } from '../../types'
import PhotoGridItem from './PhotoGridItem'

interface DateGroup {
  date: string
  records: PolaroidRecord[]
  totalCount: number
  totalPrice: number
}

interface DateGroupCardProps {
  group: DateGroup
  onPhotoPress: (record: PolaroidRecord) => void
  onPhotoLongPress: (recordId: string) => void
  onBatchEdit: (group: DateGroup) => void
}

const DateGroupCard: React.FC<DateGroupCardProps> = ({
  group,
  onPhotoPress,
  onPhotoLongPress,
  onBatchEdit,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    dateGroup: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      marginBottom: 16,
      ...CARD_SHADOW,
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[100],
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    dateHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    batchEditButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.PRIMARY}15`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    batchEditText: {
      fontSize: 12,
      color: colors.PRIMARY,
      marginLeft: 4,
    },
    dateStats: {
      flexDirection: 'row',
    },
    dateStatText: {
      fontSize: 13,
      color: colors.GRAY[600],
    },
    datePriceText: {
      fontSize: 13,
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      gap: 8,
    },
  }), [colors])

  return (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <View style={styles.dateInfo}>
          <Ionicons name='calendar' size={16} color={colors.PRIMARY} />
          <Text style={styles.dateText}>{formatDate(group.date)}</Text>
        </View>
        <View style={styles.dateHeaderRight}>
          <TouchableOpacity
            style={styles.batchEditButton}
            onPress={() => onBatchEdit(group)}
          >
            <Ionicons name='create-outline' size={16} color={colors.PRIMARY} />
            <Text style={styles.batchEditText}>编辑本日</Text>
          </TouchableOpacity>
          <View style={styles.dateStats}>
            <Text style={styles.dateStatText}>{group.totalCount} 张</Text>
            {group.totalPrice > 0 && (
              <Text style={styles.datePriceText}> · ¥{group.totalPrice}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.photoGrid}>
        {group.records.map(record => (
          <PhotoGridItem
            key={record.id}
            record={record}
            onPress={() => onPhotoPress(record)}
            onLongPress={() => onPhotoLongPress(record.id)}
          />
        ))}
      </View>
    </View>
  )
}

export default DateGroupCard
export type { DateGroup }