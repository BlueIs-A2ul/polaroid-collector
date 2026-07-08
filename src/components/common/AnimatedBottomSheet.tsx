import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'

interface AnimatedBottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  showHeader?: boolean
  children: React.ReactNode
}

const SHEET_OFFSET = 600

const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
  visible,
  onClose,
  title,
  showHeader = true,
  children,
}) => {
  const { colors } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const animating = useRef(false)

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.OVERLAY,
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.SECONDARY,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      overflow: 'hidden',
      shadowColor: colors.PRIMARY,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 12,
    },
    accentStrip: {
      height: 4,
      backgroundColor: colors.PRIMARY,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.BLACK,
      letterSpacing: -0.3,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: withOpacity(colors.BLACK, 0.06),
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerDivider: {
      height: 1,
      backgroundColor: colors.BORDER,
      marginHorizontal: 20,
    },
    content: {
      paddingBottom: 34,
    },
    noHeaderContent: {
      paddingBottom: 34,
    },
  }), [colors])

  useEffect(() => {
    if (visible && !modalVisible) {
      animating.current = true
      setModalVisible(true)
      translateY.setValue(SHEET_OFFSET)
      overlayOpacity.setValue(0)
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            tension: 300,
            friction: 22,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          animating.current = false
        })
      })
    } else if (!visible && modalVisible) {
      animating.current = true
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_OFFSET,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false)
        animating.current = false
      })
    }
  }, [visible, modalVisible])

  if (!modalVisible) return null

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType='none'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              opacity: overlayOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <View style={styles.accentStrip} />
          <Pressable onPress={() => {}}>
            {showHeader && (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>{title || ''}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name='close' size={18} color={colors.BLACK} />
                  </TouchableOpacity>
                </View>
                <View style={styles.headerDivider} />
              </>
            )}
            <View style={showHeader ? styles.content : styles.noHeaderContent}>
              {children}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

export default AnimatedBottomSheet
