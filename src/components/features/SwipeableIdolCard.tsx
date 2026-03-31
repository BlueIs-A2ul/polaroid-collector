import React, { useMemo, useRef, useCallback, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated, PanResponder, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import CachedImage from '../common/CachedImage'

interface SwipeableIdolCardProps {
  idolName: string
  totalCount: number
  latestPhoto: string | null
  avatarUri?: string | null
  onPress: () => void
  onLongPress?: () => void
  onDelete?: () => void
  selected?: boolean
  selectionMode?: boolean
  onSelect?: () => void
}

const SwipeableIdolCard: React.FC<SwipeableIdolCardProps> = ({
  idolName,
  totalCount,
  latestPhoto,
  avatarUri,
  onPress,
  onLongPress,
  onDelete,
  selected,
  selectionMode,
  onSelect,
}) => {
  const { colors } = useTheme()
  const translateX = useRef(new Animated.Value(0)).current
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteThreshold = -80

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 12,
      overflow: 'hidden',
    },
    deleteAction: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 80,
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 4,
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

  const panResponder = useMemo(() => {
    if (selectionMode || !onDelete) {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => false,
      })
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100))
        } else {
          translateX.setValue(Math.min(gestureState.dx, 0))
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < deleteThreshold) {
          setShowDeleteConfirm(true)
          Animated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start()
        } else {
          setShowDeleteConfirm(false)
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start()
        }
      },
    })
  }, [selectionMode, onDelete, translateX, deleteThreshold])

  const handlePress = useCallback(() => {
    if (selectionMode && onSelect) {
      onSelect()
    } else if (onPress) {
      onPress()
    }
  }, [selectionMode, onSelect, onPress])

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(false)
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
    if (onDelete) {
      onDelete()
    }
  }, [translateX, onDelete])

  return (
    <View style={styles.container}>
      {!selectionMode && onDelete && (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={handleDelete}
          disabled={!showDeleteConfirm}
          activeOpacity={0.7}
        >
          <Ionicons name='trash' size={24} color='#FFFFFF' />
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.card,
          styles.shadow,
          selected && styles.cardSelected,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {selectionMode && (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && (
              <Ionicons name='checkmark' size={16} color={colors.WHITE} />
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.infoContainer}
          onPress={handlePress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>

        {!selectionMode && (
          latestPhoto ? (
            <CachedImage uri={latestPhoto} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name='person' size={20} color={colors.GRAY[400]} />
            </View>
          )
        )}
      </Animated.View>
    </View>
  )
}

export default SwipeableIdolCard