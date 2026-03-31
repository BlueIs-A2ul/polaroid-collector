import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import CachedImage from '../common/CachedImage'

interface IdolCardProps {
  idolName: string
  totalCount: number
  latestPhoto: string | null
  avatarUri?: string | null
  onPress: () => void
  onLongPress?: () => void
  selected?: boolean
  selectionMode?: boolean
  onSelect?: () => void
  index?: number
}

const IdolCard: React.FC<IdolCardProps> = React.memo(
  ({ idolName, totalCount, latestPhoto, avatarUri, onPress, onLongPress, selected, selectionMode, onSelect }) => {
    const { colors } = useTheme()

    const styles = useMemo(() => StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      },
      containerSelected: {
        backgroundColor: colors.PRIMARY + '15',
        borderWidth: 2,
        borderColor: colors.PRIMARY,
      },
      shadow: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
      infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.SECONDARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
      },
      avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
      },
      textContainer: {
        flex: 1,
      },
      idolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 4,
      },
      metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      photoCount: {
        fontSize: 14,
        color: colors.GRAY[600],
      },
      thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 8,
      },
      thumbnailPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.GRAY[100],
        justifyContent: 'center',
        alignItems: 'center',
      },
      checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.GRAY[300],
        backgroundColor: colors.WHITE,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
      },
      checkboxSelected: {
        backgroundColor: colors.PRIMARY,
        borderColor: colors.PRIMARY,
      },
    }), [colors])

    const handlePress = () => {
      if (selectionMode && onSelect) {
        onSelect()
      } else if (onPress) {
        onPress()
      }
    }

    return (
      <TouchableOpacity
        style={[styles.container, styles.shadow, selected && styles.containerSelected]}
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {selectionMode && (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && (
              <Ionicons name='checkmark' size={16} color={colors.WHITE} />
            )}
          </View>
        )}
        <View style={styles.infoContainer}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <CachedImage uri={avatarUri} style={styles.avatarImage} />
            ) : (
              <Ionicons name='person' size={24} color={colors.PRIMARY} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.idolName} numberOfLines={1}>
              {idolName}
            </Text>
            <View style={styles.metaContainer}>
              <Ionicons name='camera' size={14} color={colors.GRAY[500]} />
              <Text style={styles.photoCount}>{totalCount} 张</Text>
            </View>
          </View>
        </View>

        {!selectionMode && (latestPhoto ? (
          <CachedImage uri={latestPhoto} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name='person' size={20} color={colors.GRAY[400]} />
          </View>
        ))}
      </TouchableOpacity>
    )
  },
)

export default IdolCard