import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import CachedImage from '../common/CachedImage'
import { PolaroidRecord } from '../../types'

interface PhotoGridItemProps {
  record: PolaroidRecord
  onPress: () => void
  onLongPress: () => void
}

const PhotoGridItem: React.FC<PhotoGridItemProps> = ({
  record,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    photoItem: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    photoImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    backPhotoBadge: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: colors.SUCCESS,
      borderRadius: 6,
      padding: 2,
    },
    countBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    countBadgeText: {
      fontSize: 11,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
    priceBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.PRIMARY,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    priceBadgeText: {
      fontSize: 11,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
  }), [colors])

  return (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <CachedImage uri={record.photoUri} style={styles.photoImage} />
      {record.backPhotoUri && (
        <View style={styles.backPhotoBadge}>
          <Ionicons name='document-text' size={10} color={colors.WHITE} />
        </View>
      )}
      {record.photoCount > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>×{record.photoCount}</Text>
        </View>
      )}
      {record.price !== undefined && record.price > 0 && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>¥{record.price}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default PhotoGridItem