import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { Statistics } from '../../types'

interface StatsCardProps {
  statistics: Statistics | null
  onPress: () => void
}

const StatsCard: React.FC<StatsCardProps> = ({ statistics, onPress }) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.WHITE,
      padding: 20,
      margin: 16,
      borderRadius: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statMoreHint: {
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginTop: 4,
    },
  }), [colors])

  if (!statistics) return null

  return (
    <TouchableOpacity style={styles.statsContainer} onPress={onPress}>
      <View style={styles.statItem}>
        <Ionicons name='camera' size={24} color={colors.PRIMARY} />
        <Text style={styles.statValue}>{statistics.totalPhotos}</Text>
        <Text style={styles.statLabel}>拍立得</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name='person' size={24} color={colors.PRIMARY} />
        <Text style={styles.statValue}>{statistics.uniqueIdols}</Text>
        <Text style={styles.statLabel}>偶像</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name='wallet' size={24} color={colors.PRIMARY} />
        <Text style={styles.statValue}>¥{statistics.totalPrice}</Text>
        <Text style={styles.statLabel}>总花费</Text>
      </View>
      <View style={styles.statMoreHint}>
        <Ionicons name='chevron-forward' size={20} color={colors.GRAY[400]} />
      </View>
    </TouchableOpacity>
  )
}

export default StatsCard