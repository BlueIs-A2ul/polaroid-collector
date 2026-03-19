import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, CARD_SHADOW } from '../../constants/themeColors'
import { formatDate } from '../../utils/rankingUtils'

interface IdolCardProps {
  idolName: string
  totalCount: number
  latestPhoto: string | null
  onPress: () => void
}

/**
 * 偶像卡片组件
 * 显示偶像的排行榜信息
 */
const IdolCard: React.FC<IdolCardProps> = ({
  idolName,
  totalCount,
  latestPhoto,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.rankText}>
          <Ionicons name='trophy' size={16} color={COLORS.PRIMARY} /> #
          {totalCount}
        </Text>
        <Text style={styles.name}>{idolName}</Text>
      </View>

      {latestPhoto ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: latestPhoto }} style={styles.photo} />
        </View>
      ) : (
        <View style={styles.noPhotoContainer}>
          <Ionicons name='image-outline' size={48} color={COLORS.GRAY[400]} />
          <Text style={styles.noPhotoText}>暂无照片</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name='camera' size={16} color={COLORS.PRIMARY} />
        <Text style={styles.countText}>{totalCount} 张拍立得</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  photoContainer: {
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    aspectRatio: 4 / 3,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhotoContainer: {
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    aspectRatio: 4 / 3,
  },
  noPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.GRAY[500],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.GRAY[600],
  },
})

export default IdolCard
