import React, { useMemo, forwardRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image as RNImage,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemeColors } from '../../types/theme'
import { PolaroidRecord } from '../../types'

interface ShareCardProps {
  idolName: string
  avatarUri: string | null
  totalCount: number
  totalRecords: number
  totalPrice: number
  records: PolaroidRecord[]
  colors: ThemeColors
}

const ShareCard = forwardRef<View, ShareCardProps>(({
  idolName,
  avatarUri,
  totalCount,
  totalRecords,
  totalPrice,
  records,
  colors,
}, ref) => {
  const recentPhotos = records
    .sort((a, b) => new Date(b.photoDate).getTime() - new Date(a.photoDate).getTime())
    .slice(0, 6)

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: 360,
      backgroundColor: colors.WHITE,
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: colors.PRIMARY,
      paddingTop: 28,
      paddingBottom: 20,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.SECONDARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 3,
      borderColor: colors.WHITE,
      overflow: 'hidden',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    idolName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.WHITE,
      marginBottom: 4,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
      marginTop: 8,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    statLabel: {
      fontSize: 11,
      color: colors.WHITE,
      opacity: 0.8,
      marginTop: 2,
    },
    content: {
      padding: 20,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    photoItem: {
      width: 100,
      height: 100,
      borderRadius: 12,
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    photoCountBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    photoCountText: {
      fontSize: 10,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.GRAY[100],
    },
    appName: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    appLogo: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
    },
    appTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    appSubtitle: {
      fontSize: 11,
      color: colors.GRAY[500],
    },
    priceTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.PRIMARY}15`,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    priceText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginLeft: 4,
    },
  }), [colors])

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <RNImage source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Ionicons name='person' size={36} color={colors.PRIMARY} />
          )}
        </View>
        <Text style={styles.idolName}>{idolName}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>拍立得</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalRecords}</Text>
            <Text style={styles.statLabel}>次拍摄</Text>
          </View>
          {totalPrice > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>¥{totalPrice}</Text>
              <Text style={styles.statLabel}>总花费</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.photoGrid}>
          {recentPhotos.map((record, index) => (
            <View key={record.id} style={styles.photoItem}>
              <RNImage source={{ uri: record.photoUri }} style={styles.photo} />
              {record.photoCount > 1 && (
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCountText}>×{record.photoCount}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.appName}>
          <View style={styles.appLogo}>
            <Ionicons name='camera' size={16} color={colors.WHITE} />
          </View>
          <View>
            <Text style={styles.appTitle}>拍立得收藏</Text>
            <Text style={styles.appSubtitle}>记录每一份心动</Text>
          </View>
        </View>

        {totalPrice > 0 && (
          <View style={styles.priceTag}>
            <Ionicons name='wallet' size={14} color={colors.PRIMARY} />
            <Text style={styles.priceText}>¥{totalPrice}</Text>
          </View>
        )}
      </View>
    </View>
  )
})

ShareCard.displayName = 'ShareCard'

export default ShareCard