import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import ShareCard from './ShareCard'
import { captureAndShare } from '../../services/shareService'
import { PolaroidRecord } from '../../types'
import { ThemeColors } from '../../types/theme'

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

  const styles = React.useMemo(() => StyleSheet.create({
    shareModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    shareModalContent: {
      backgroundColor: colors.WHITE,
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    },
    shareModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    shareModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    shareCardContainer: {
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
  }), [colors])

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.shareModalOverlay}>
        <View style={styles.shareModalContent}>
          <View style={styles.shareModalHeader}>
            <Text style={styles.shareModalTitle}>分享卡片</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={24} color={colors.BLACK} />
            </TouchableOpacity>
          </View>

          <View style={styles.shareCardContainer} collapsable={false}>
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
        </View>
      </View>
    </Modal>
  )
}

export default ShareModal