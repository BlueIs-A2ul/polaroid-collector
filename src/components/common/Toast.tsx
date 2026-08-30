import React, { useEffect, useRef, useMemo } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'
import { ToastVariant } from '../../services/dialogService'

interface ToastItemProps {
  message: string
  variant: ToastVariant
  index: number
  onDismiss: () => void
}

const DISMISS_DELAY = 2500
const TOAST_HEIGHT = 48
const TOAST_GAP = 8

const ICON_MAP: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  warning: 'warning-outline',
}

const ToastItem: React.FC<ToastItemProps> = ({ message, variant, index, onDismiss }) => {
  const { colors } = useTheme()
  const translateY = useRef(new Animated.Value(-120)).current
  const opacity = useRef(new Animated.Value(0)).current

  const variantColor = useMemo(() => {
    switch (variant) {
      case 'success': return colors.SUCCESS
      case 'error': return colors.ERROR
      case 'warning': return colors.WARNING
      default: return colors.PRIMARY
    }
  }, [variant, colors])

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 50 + index * (TOAST_HEIGHT + TOAST_GAP),
      left: 16,
      right: 16,
      zIndex: 1000 + index,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: TOAST_HEIGHT,
      borderRadius: 8,
      backgroundColor: colors.SECONDARY,
      paddingLeft: 0,
      paddingRight: 16,
      gap: 10,
      shadowColor: variantColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    },
    accentStrip: {
      width: 4,
      height: '100%',
      backgroundColor: variantColor,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: withOpacity(variantColor, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.BLACK,
      lineHeight: 20,
    },
  }), [colors, variantColor, index])

  useEffect(() => {
    const show = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 320,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ])

    show.start()

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss()
      })
    }, DISMISS_DELAY)

    return () => clearTimeout(hideTimer)
  }, [])

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.accentStrip} />
        <View style={styles.iconContainer}>
          <Ionicons name={ICON_MAP[variant]} size={16} color={variantColor} />
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  )
}

export default React.memo(ToastItem)
