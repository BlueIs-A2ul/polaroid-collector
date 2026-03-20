import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/themeColors'
import CachedImage from '../common/CachedImage'

interface IdolCardProps {
  idolName: string
  totalCount: number
  latestPhoto: string | null
  avatarUri?: string | null
  onPress: () => void
  index?: number
}

const IdolCard: React.FC<IdolCardProps> = React.memo(
  ({ idolName, totalCount, latestPhoto, avatarUri, onPress }) => {
    return (
      <TouchableOpacity
        style={[styles.container, styles.shadow]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.infoContainer}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <CachedImage uri={avatarUri} style={styles.avatarImage} />
            ) : (
              <Ionicons name='person' size={24} color={COLORS.PRIMARY} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.idolName} numberOfLines={1}>
              {idolName}
            </Text>
            <View style={styles.metaContainer}>
              <Ionicons name='camera' size={14} color={COLORS.GRAY[500]} />
              <Text style={styles.photoCount}>{totalCount} 张</Text>
            </View>
          </View>
        </View>

        {latestPhoto ? (
          <CachedImage uri={latestPhoto} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name='person' size={20} color={COLORS.GRAY[400]} />
          </View>
        )}
      </TouchableOpacity>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: COLORS.SECONDARY,
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
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoCount: {
    fontSize: 14,
    color: COLORS.GRAY[600],
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
    backgroundColor: COLORS.GRAY[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default IdolCard