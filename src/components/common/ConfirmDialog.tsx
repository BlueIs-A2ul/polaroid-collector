import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'
import { ConfirmButton } from '../../services/dialogService'

interface ConfirmDialogProps {
  title: string
  message: string
  buttons: ConfirmButton[]
  onResult: (index: number) => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  buttons,
  onResult,
}) => {
  const { colors } = useTheme()
  const [modalVisible, setModalVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const selectedIdx = useRef<number>(-1)
  const resolved = useRef(false)

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    container: {
      width: '100%',
      backgroundColor: colors.SECONDARY,
      borderRadius: 22,
      overflow: 'hidden',
      shadowColor: colors.PRIMARY,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
    },
    body: {
      padding: 28,
      alignItems: 'center',
    },
    decorDots: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 16,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: withOpacity(colors.PRIMARY, 0.35),
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.BLACK,
      textAlign: 'center',
      letterSpacing: -0.2,
      marginBottom: 10,
    },
    message: {
      fontSize: 15,
      color: colors.GRAY[600],
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonArea: {
      borderTopWidth: 1,
      borderTopColor: withOpacity(colors.BLACK, 0.08),
      flexDirection: 'row',
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSeparator: {
      width: 1,
      backgroundColor: withOpacity(colors.BLACK, 0.08),
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    buttonTextCancel: {
      color: colors.GRAY[500],
    },
    buttonTextPrimary: {
      color: colors.PRIMARY,
    },
    buttonTextDestructive: {
      color: colors.ERROR,
    },
    accentStrip: {
      height: 4,
      backgroundColor: colors.PRIMARY,
    },
  }), [colors])

  useEffect(() => {
    scale.setValue(0.85)
    opacity.setValue(0)
    overlayOpacity.setValue(0)
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 280,
          friction: 16,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }, [])

  useEffect(() => {
    if (closing) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false)
      })
    }
  }, [closing])

  const finishClose = useCallback(() => {
    if (resolved.current) return
    resolved.current = true
    const idx = selectedIdx.current
    requestAnimationFrame(() => {
      onResult(idx)
    })
  }, [onResult])

  useEffect(() => {
    if (!modalVisible && closing) {
      finishClose()
    }
  }, [modalVisible, closing, finishClose])

  const handleSelect = (index: number) => {
    if (closing) return
    selectedIdx.current = index
    setClosing(true)
  }

  if (!modalVisible) return null

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType='none'
      onRequestClose={() => handleSelect(-1)}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.body}>
                <View style={styles.decorDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
              </View>

              <View style={styles.buttonArea}>
                {buttons.map((btn, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <View style={styles.buttonSeparator} />}
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleSelect(idx)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          btn.style === 'cancel' && styles.buttonTextCancel,
                          btn.style === 'primary' && styles.buttonTextPrimary,
                          btn.style === 'destructive' && styles.buttonTextDestructive,
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.accentStrip} />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  )
}

export default ConfirmDialog
