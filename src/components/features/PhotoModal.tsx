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
import CachedImage from '../common/CachedImage'
import { PolaroidRecord } from '../../types'
import { formatDate } from '../../utils/rankingUtils'

interface PhotoModalProps {
  visible: boolean
  record: PolaroidRecord | null
  showingBack: boolean
  onClose: () => void
  onToggleBack: () => void
  onEdit: () => void
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  visible,
  record,
  showingBack,
  onClose,
  onToggleBack,
  onEdit,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
    modalContent: {
      width: '90%',
      alignItems: 'center',
    },
    modalImageContainer: {
      width: '100%',
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalImage: {
      width: '100%',
      aspectRatio: 1,
      resizeMode: 'contain',
      backgroundColor: colors.GRAY[100],
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.WHITE,
    },
    modalInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      width: '100%',
    },
    modalDate: {
      fontSize: 14,
      color: colors.WHITE,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    toggleButtonText: {
      fontSize: 13,
      color: colors.WHITE,
      marginLeft: 6,
    },
    noteContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 12,
      width: '100%',
    },
    noteText: {
      fontSize: 13,
      color: colors.WHITE,
      marginLeft: 8,
      flex: 1,
    },
    extraInfoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
      width: '100%',
      gap: 8,
    },
    extraInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    extraInfoLabel: {
      fontSize: 12,
      color: colors.GRAY[400],
      marginRight: 4,
    },
    extraInfoValue: {
      fontSize: 12,
      color: colors.WHITE,
      fontWeight: '500',
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.PRIMARY,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      marginTop: 12,
    },
    editButtonText: {
      fontSize: 13,
      color: colors.WHITE,
      marginLeft: 6,
    },
  }), [colors])

  const currentUri = showingBack && record?.backPhotoUri
    ? record.backPhotoUri
    : record?.photoUri

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Ionicons name='close' size={28} color={colors.WHITE} />
        </TouchableOpacity>

        {record && currentUri ? (
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={onToggleBack} activeOpacity={0.9} style={styles.modalImageContainer}>
              <CachedImage
                uri={currentUri}
                style={styles.modalImage}
                resizeMode='contain'
              />
            </TouchableOpacity>

            <View style={styles.modalInfo}>
              <Text style={styles.modalDate}>
                {formatDate(record.photoDate)} · {record.photoCount} 张
                {record.price !== undefined && record.price > 0 && ` · ¥${record.price}`}
              </Text>
              {record.backPhotoUri && (
                <TouchableOpacity style={styles.toggleButton} onPress={onToggleBack}>
                  <Ionicons
                    name={showingBack ? 'image-outline' : 'document-text-outline'}
                    size={16}
                    color={colors.PRIMARY}
                  />
                  <Text style={styles.toggleButtonText}>
                    {showingBack ? '查看正面' : '查看背签'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {record.note && (
              <View style={styles.noteContainer}>
                <Ionicons name='chatbubble-outline' size={14} color={colors.GRAY[400]} />
                <Text style={styles.noteText}>{record.note}</Text>
              </View>
            )}

            {(record.groupName || record.city || record.venue || record.polaroidType || record.memberCount) && (
              <View style={styles.extraInfoContainer}>
                {record.groupName && (
                  <View style={styles.extraInfoItem}>
                    <Text style={styles.extraInfoLabel}>团体</Text>
                    <Text style={styles.extraInfoValue}>{record.groupName}</Text>
                  </View>
                )}
                {record.city && (
                  <View style={styles.extraInfoItem}>
                    <Text style={styles.extraInfoLabel}>城市</Text>
                    <Text style={styles.extraInfoValue}>{record.city}</Text>
                  </View>
                )}
                {record.venue && (
                  <View style={styles.extraInfoItem}>
                    <Text style={styles.extraInfoLabel}>场馆</Text>
                    <Text style={styles.extraInfoValue}>{record.venue}</Text>
                  </View>
                )}
                {record.polaroidType && (
                  <View style={styles.extraInfoItem}>
                    <Text style={styles.extraInfoLabel}>类型</Text>
                    <Text style={styles.extraInfoValue}>{record.polaroidType}</Text>
                  </View>
                )}
                {record.memberCount && (
                  <View style={styles.extraInfoItem}>
                    <Text style={styles.extraInfoLabel}>人数</Text>
                    <Text style={styles.extraInfoValue}>{record.memberCount}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
            >
              <Ionicons name='create-outline' size={16} color={colors.WHITE} />
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
    </Modal>
  )
}

export default PhotoModal