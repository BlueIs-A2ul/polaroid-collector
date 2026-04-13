import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image as RNImage,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface DetailHeaderProps {
  idolName: string
  avatarUri: string | null
  totalCount: number
  totalRecords: number
  totalPrice: number
  onAvatarPress: () => void
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  idolName,
  avatarUri,
  totalCount,
  totalRecords,
  totalPrice,
  onAvatarPress,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    header: {
      backgroundColor: colors.PRIMARY,
      padding: 20,
      paddingTop: 40,
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.WHITE,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.WHITE,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.PRIMARY,
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: colors.WHITE,
    },
    idolName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.WHITE,
      marginBottom: 16,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.WHITE,
    },
  }), [colors])

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress}>
        {avatarUri ? (
          <RNImage source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name='person' size={40} color={colors.WHITE} />
          </View>
        )}
        <View style={styles.avatarEditBadge}>
          <Ionicons name='camera' size={14} color={colors.WHITE} />
        </View>
      </TouchableOpacity>
      <Text style={styles.idolName}>{idolName}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name='camera' size={20} color={colors.PRIMARY} />
          <Text style={styles.statText}>{totalCount} 张</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name='calendar' size={20} color={colors.PRIMARY} />
          <Text style={styles.statText}>{totalRecords} 次</Text>
        </View>
        {totalPrice > 0 && (
          <View style={styles.stat}>
            <Ionicons name='wallet' size={20} color={colors.PRIMARY} />
            <Text style={styles.statText}>¥{totalPrice}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default DetailHeader