import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import ShareCard from './ShareCard'
import { captureAndShare } from '../../services/shareService'
import { PolaroidRecord } from '../../types'

interface ShareModalProps {
  visible: boolean
  idolName: string
  avatarUri: string | null
  totalCount: number
  totalRecords: number
  totalPrice: number
  records: PolaroidRecord[]
  onClose: () => void
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  idolName,
  avatarUri,
  totalCount,
  totalRecords,
  totalPrice,
  records,
  onClose,
}) => {
  const { colors } = useTheme()
  const shareCardRef = React.useRef<View>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  const styles = React.useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.OVERLAY,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    content: {
      backgroundColor: colors.SECONDARY,
      borderRadius: 22,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      overflow: 'hidden',
      shadowColor: colors.PRIMARY,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
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
      backgroundColor: colors.GRAY[200],
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContainer: {
      alignItems: 'center',
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.PRIMARY,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      gap: 8,
    },
    shareButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    accentStrip: {
      height: 4,
      backgroundColor: colors.PRIMARY,
      marginHorizontal: -20,
      marginBottom: -20,
      marginTop: 16,
    },
  }), [colors])

  useEffect(() => {
    if (visible && !modalVisible) {
      setModalVisible(true)
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
    } else if (!visible && modalVisible) {
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
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.header}>
                <Text style={styles.title}>分享卡片</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                  <Ionicons name='close' size={18} color={colors.BLACK} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContainer} collapsable={false}>
                <ShareCard
                  ref={shareCardRef}
                  idolName={idolName}
                  avatarUri={avatarUri}
                  totalCount={totalCount}
                  totalRecords={totalRecords}
                  totalPrice={totalPrice}
                  records={records}
                  colors={colors}
                />
              </View>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={async () => {
                  await captureAndShare(shareCardRef)
                }}
              >
                <Ionicons name='share' size={20} color={colors.WHITE} />
                <Text style={styles.shareButtonText}>分享</Text>
              </TouchableOpacity>
            </Pressable>
            <View style={styles.accentStrip} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  )
}

export default ShareModal
