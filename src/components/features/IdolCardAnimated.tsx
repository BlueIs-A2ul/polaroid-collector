import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import CachedImage from '../common/CachedImage'

interface IdolCardAnimatedProps {
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

const IdolCardAnimated: React.FC<IdolCardAnimatedProps> = ({
  idolName,
  totalCount,
  latestPhoto,
  avatarUri,
  onPress,
  onLongPress,
  selected,
  selectionMode,
  onSelect,
  index = 0,
}) => {
  const { colors } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const styles = StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
    },
    cardSelected: {
      backgroundColor: colors.PRIMARY + '15',
      borderWidth: 2,
      borderColor: colors.PRIMARY,
    },
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
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
    idolNameText: {
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
  })

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim, index])

  const handlePress = () => {
    if (selectionMode && onSelect) {
      onSelect()
    } else if (onPress) {
      onPress()
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          styles.shadow,
          selected && styles.cardSelected,
        ]}
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
            <Text style={styles.idolNameText} numberOfLines={1}>
              {idolName}
            </Text>
            <View style={styles.metaContainer}>
              <Ionicons name='camera' size={14} color={colors.GRAY[500]} />
              <Text style={styles.photoCount}>{totalCount} 张</Text>
            </View>
          </View>
        </View>

        {!selectionMode && (
          latestPhoto ? (
            <CachedImage uri={latestPhoto} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name='image' size={20} color={colors.GRAY[400]} />
            </View>
          )
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default IdolCardAnimated