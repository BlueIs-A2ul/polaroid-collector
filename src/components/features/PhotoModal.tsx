import React, { useState, useRef, useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import CachedImage from '../common/CachedImage'
import { PolaroidRecord } from '../../types'
import { formatDate } from '../../utils/rankingUtils'
import { withOpacity } from '../../utils/colorUtils'

interface PhotoModalProps {
  visible: boolean
  record: PolaroidRecord | null
  showingBack: boolean
  onClose: () => void
  onToggleBack: () => void
  onEdit: () => void
}

interface PhotoUriItem {
  uri: string
  isBack: boolean
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const PhotoModal: React.FC<PhotoModalProps> = ({
  visible,
  record,
  showingBack,
  onClose,
  onToggleBack,
  onEdit,
}) => {
  const { colors } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const allPhotos = useMemo((): PhotoUriItem[] => {
    if (!record) return []
    const photos: PhotoUriItem[] = [{ uri: record.photoUri, isBack: false }]
    if (record.backPhotoUri) {
      photos.push({ uri: record.backPhotoUri, isBack: true })
    }
    if (record.additionalPhotoUris && record.additionalPhotoUris.length > 0) {
      record.additionalPhotoUris.forEach((uri, i) => {
        photos.push({ uri, isBack: false })
        const backUri = record.additionalBackPhotoUris?.[i]
        if (backUri) {
          photos.push({ uri: backUri, isBack: true })
        }
      })
    }
    return photos
  }, [record])

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  const handleToggle = () => {
    const targetIndex = currentPhotoItem?.isBack ? currentIndex - 1 : currentIndex + 1
    if (targetIndex >= 0 && targetIndex < allPhotos.length) {
      flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
    }
    onToggleBack()
  }

  const styles = useMemo(() => StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: withOpacity(colors.BLACK, 0.92),
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: withOpacity(colors.WHITE, 0.15),
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
    photoItem: {
      width: SCREEN_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalImageContainer: {
      width: '90%',
      aspectRatio: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalImage: {
      width: '100%',
      height: '100%',
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
    pageIndicator: {
      position: 'absolute',
      top: 50,
      left: 20,
      backgroundColor: colors.OVERLAY,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    pageIndicatorText: {
      fontSize: 14,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
    modalInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      width: '90%',
      alignSelf: 'center',
    },
    modalDate: {
      fontSize: 14,
      color: colors.WHITE,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: withOpacity(colors.WHITE, 0.2),
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
      backgroundColor: withOpacity(colors.WHITE, 0.1),
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 12,
      width: '90%',
      alignSelf: 'center',
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
      width: '90%',
      gap: 8,
      alignSelf: 'center',
    },
    extraInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: withOpacity(colors.WHITE, 0.1),
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
      alignSelf: 'center',
    },
    editButtonText: {
      fontSize: 13,
      color: colors.WHITE,
      marginLeft: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors])

  const renderPhotoItem = ({ item }: { item: PhotoUriItem }) => (
    <View style={styles.photoItem}>
      <TouchableOpacity
        style={styles.modalImageContainer}
        onPress={item.isBack ? onToggleBack : undefined}
        activeOpacity={item.isBack ? 0.9 : 1}
      >
        <CachedImage
          uri={item.uri}
          style={styles.modalImage}
          resizeMode='contain'
        />
      </TouchableOpacity>
    </View>
  )

  const currentPhotoItem = allPhotos[currentIndex]

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

        {allPhotos.length > 1 && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {currentIndex + 1}/{allPhotos.length}
            </Text>
          </View>
        )}

        {record && allPhotos.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={allPhotos}
              renderItem={renderPhotoItem}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
                setCurrentIndex(newIndex)
              }}
            />

            <View style={styles.modalInfo}>
              <Text style={styles.modalDate}>
                {formatDate(record.photoDate)} · {record.photoCount} 张
                {record.price !== undefined && record.price > 0 && ` · ¥${record.price}`}
              </Text>
              {currentPhotoItem && currentPhotoItem.isBack ? (
                <TouchableOpacity style={styles.toggleButton} onPress={handleToggle}>
                  <Ionicons
                    name='image-outline'
                    size={16}
                    color={colors.PRIMARY}
                  />
                  <Text style={styles.toggleButtonText}>查看正面</Text>
                </TouchableOpacity>
              ) : allPhotos[currentIndex + 1]?.isBack ? (
                <TouchableOpacity style={styles.toggleButton} onPress={handleToggle}>
                  <Ionicons
                    name='document-text-outline'
                    size={16}
                    color={colors.PRIMARY}
                  />
                  <Text style={styles.toggleButtonText}>查看背签</Text>
                </TouchableOpacity>
              ) : null}
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
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>
    </Modal>
  )
}

export default PhotoModal