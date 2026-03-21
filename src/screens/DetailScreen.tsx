import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { CARD_SHADOW } from '../constants/themes'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useIdolDetail } from '../hooks/useRecords'
import { formatDate } from '../utils/rankingUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import CachedImage from '../components/common/CachedImage'
import { PolaroidRecord } from '../types'
import { getAvatar, pickAndSetAvatar, removeAvatar } from '../services/avatarService'
import { updateRecordData } from '../services/recordService'
import FieldHistorySelector from '../components/features/FieldHistorySelector'
import ShareCard from '../components/features/ShareCard'
import { captureAndShare } from '../services/shareService'

type DetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Detail'
>
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>

interface DetailScreenProps {
  navigation: DetailScreenNavigationProp
  route: DetailScreenRouteProp
}

interface DateGroup {
  date: string
  records: PolaroidRecord[]
  totalCount: number
  totalPrice: number
}

interface BatchEditState {
  visible: boolean
  date: string
  recordIds: string[]
  groupName: string
  city: string
  venue: string
}

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { idolName } = route.params
  const { colors } = useTheme()
  const { detail, loading, error, ascending, toggleSort, refreshDetail } =
    useIdolDetail(idolName)
  const [refreshing, setRefreshing] = React.useState(false)
  const [photoModalVisible, setPhotoModalVisible] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState<PolaroidRecord | null>(null)
  const [showingBack, setShowingBack] = React.useState(false)
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null)
  const [batchEdit, setBatchEdit] = React.useState<BatchEditState>({
    visible: false,
    date: '',
    recordIds: [],
    groupName: '',
    city: '',
    venue: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [showFieldSelector, setShowFieldSelector] = React.useState<'groupName' | 'city' | 'venue' | null>(null)
  const [shareModalVisible, setShareModalVisible] = React.useState(false)
  const shareCardRef = React.useRef<View>(null)

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    header: {
      backgroundColor: colors.PRIMARY,
      padding: 20,
      paddingTop: 40,
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.WHITE,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.WHITE,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.PRIMARY,
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: colors.WHITE,
    },
    idolName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.WHITE,
      marginBottom: 16,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.WHITE,
    },
    recordsContainer: {
      padding: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    sortHint: {
      fontSize: 12,
      color: colors.GRAY[500],
    },
    dateGroup: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      marginBottom: 16,
      ...CARD_SHADOW,
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[100],
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    dateStats: {
      flexDirection: 'row',
    },
    dateStatText: {
      fontSize: 13,
      color: colors.GRAY[600],
    },
    datePriceText: {
      fontSize: 13,
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      gap: 8,
    },
    photoItem: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    photoImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    backPhotoBadge: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: colors.SUCCESS,
      borderRadius: 6,
      padding: 2,
    },
    countBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    countBadgeText: {
      fontSize: 11,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
    priceBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.PRIMARY,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    priceBadgeText: {
      fontSize: 11,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
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
    dateHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    batchEditButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.PRIMARY}15`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    batchEditText: {
      fontSize: 12,
      color: colors.PRIMARY,
      marginLeft: 4,
    },
    batchEditModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    batchEditContent: {
      backgroundColor: colors.WHITE,
      borderRadius: 16,
      width: '90%',
      maxWidth: 400,
      ...CARD_SHADOW,
    },
    batchEditHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    batchEditTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    batchEditBody: {
      padding: 16,
    },
    batchEditDate: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 16,
      textAlign: 'center',
    },
    batchEditField: {
      marginBottom: 16,
    },
    batchEditLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.BLACK,
      marginBottom: 6,
    },
    batchEditInputWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      padding: 12,
    },
    batchEditInputText: {
      fontSize: 15,
      color: colors.BLACK,
      flex: 1,
    },
    batchEditPlaceholder: {
      color: colors.GRAY[400],
    },
    batchEditCount: {
      fontSize: 12,
      color: colors.GRAY[500],
      textAlign: 'center',
      marginBottom: 16,
    },
    batchEditButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    batchEditCancelButton: {
      flex: 1,
      backgroundColor: colors.GRAY[200],
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    batchEditCancelText: {
      fontSize: 15,
      color: colors.GRAY[700],
      fontWeight: '500',
    },
    batchEditSaveButton: {
      flex: 1,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    batchEditSaveText: {
      fontSize: 15,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
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

  const loadAvatar = React.useCallback(async () => {
    const { success, data } = await getAvatar(idolName)
    if (success) {
      setAvatarUri(data)
    }
  }, [idolName])

  useFocusEffect(
    React.useCallback(() => {
      refreshDetail()
      loadAvatar()
    }, [refreshDetail, loadAvatar]),
  )

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refreshDetail(), loadAvatar()])
    setRefreshing(false)
  }, [refreshDetail, loadAvatar])

  const openPhotoModal = (record: PolaroidRecord) => {
    setSelectedRecord(record)
    setShowingBack(false)
    setPhotoModalVisible(true)
  }

  const closePhotoModal = () => {
    setPhotoModalVisible(false)
    setSelectedRecord(null)
    setShowingBack(false)
  }

  const togglePhoto = () => {
    if (selectedRecord?.backPhotoUri) {
      setShowingBack(!showingBack)
    }
  }

  const handleSetAvatar = async (allowCrop: boolean) => {
    const { success, data } = await pickAndSetAvatar(idolName, allowCrop)
    if (success && data) {
      setAvatarUri(data)
    }
  }

  const handleRemoveAvatar = () => {
    Alert.alert('移除头像', '确定要移除当前头像吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '移除',
        style: 'destructive',
        onPress: async () => {
          const { success } = await removeAvatar(idolName)
          if (success) {
            setAvatarUri(null)
          }
        },
      },
    ])
  }

  const showCropOptions = () => {
    Alert.alert('选择头像', '是否裁切为正方形？', [
      { text: '不裁切', onPress: () => handleSetAvatar(false) },
      { text: '裁切为正方形', onPress: () => handleSetAvatar(true) },
      { text: '取消', style: 'cancel' },
    ])
  }

  const showAvatarOptions = () => {
    if (avatarUri) {
      Alert.alert('头像设置', '请选择操作', [
        { text: '更换头像', onPress: showCropOptions },
        { text: '移除头像', onPress: handleRemoveAvatar, style: 'destructive' },
        { text: '取消', style: 'cancel' },
      ])
    } else {
      showCropOptions()
    }
  }

  const openBatchEdit = (group: DateGroup) => {
    const firstRecord = group.records[0]
    setBatchEdit({
      visible: true,
      date: group.date,
      recordIds: group.records.map(r => r.id),
      groupName: firstRecord.groupName || '',
      city: firstRecord.city || '',
      venue: firstRecord.venue || '',
    })
  }

  const closeBatchEdit = () => {
    setBatchEdit({
      visible: false,
      date: '',
      recordIds: [],
      groupName: '',
      city: '',
      venue: '',
    })
  }

  const handleBatchEdit = async () => {
    if (batchEdit.recordIds.length === 0) return

    setSaving(true)
    let successCount = 0
    let failCount = 0

    for (const recordId of batchEdit.recordIds) {
      const { success } = await updateRecordData(recordId, {
        groupName: batchEdit.groupName || undefined,
        city: batchEdit.city || undefined,
        venue: batchEdit.venue || undefined,
      })
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }

    setSaving(false)
    closeBatchEdit()

    if (failCount === 0) {
      Alert.alert('成功', `已更新 ${successCount} 条记录`)
      refreshDetail()
    } else {
      Alert.alert('部分成功', `成功 ${successCount} 条，失败 ${failCount} 条`)
      refreshDetail()
    }
  }

  const groupedRecords = React.useMemo(() => {
    if (!detail?.records) return []

    const groups: Record<string, DateGroup> = {}

    detail.records.forEach(record => {
      if (!groups[record.photoDate]) {
        groups[record.photoDate] = {
          date: record.photoDate,
          records: [],
          totalCount: 0,
          totalPrice: 0,
        }
      }
      groups[record.photoDate].records.push(record)
      groups[record.photoDate].totalCount += record.photoCount
      groups[record.photoDate].totalPrice += record.price || 0
    })

    const sortedGroups = Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    })

    return sortedGroups
  }, [detail?.records, ascending])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={toggleSort}>
            <Ionicons
              name={ascending ? 'arrow-up' : 'arrow-down'}
              size={24}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShareModalVisible(true)}>
            <Ionicons
              name='share-outline'
              size={24}
              color={colors.WHITE}
            />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation, ascending, colors])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !detail) {
    return (
      <EmptyState
        icon='alert-circle-outline'
        title='加载失败'
        message={error || '偶像不存在'}
      />
    )
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.PRIMARY]}
            tintColor={colors.PRIMARY}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={showAvatarOptions}>
            {avatarUri ? (
              <RNImage source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name='person' size={40} color={colors.WHITE} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name='camera' size={14} color={colors.WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.idolName}>{detail.idolName}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name='camera' size={20} color={colors.PRIMARY} />
              <Text style={styles.statText}>{detail.totalCount} 张</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name='calendar' size={20} color={colors.PRIMARY} />
              <Text style={styles.statText}>{detail.totalRecords} 次</Text>
            </View>
            {detail.totalPrice > 0 && (
              <View style={styles.stat}>
                <Ionicons name='wallet' size={20} color={colors.PRIMARY} />
                <Text style={styles.statText}>¥{detail.totalPrice}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.recordsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>记录列表</Text>
            <Text style={styles.sortHint}>{ascending ? '从旧到新' : '从新到旧'}</Text>
          </View>

          {groupedRecords.map(group => (
            <View key={group.date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <View style={styles.dateInfo}>
                  <Ionicons name='calendar' size={16} color={colors.PRIMARY} />
                  <Text style={styles.dateText}>{formatDate(group.date)}</Text>
                </View>
                <View style={styles.dateHeaderRight}>
                  <TouchableOpacity
                    style={styles.batchEditButton}
                    onPress={() => openBatchEdit(group)}
                  >
                    <Ionicons name='create-outline' size={16} color={colors.PRIMARY} />
                    <Text style={styles.batchEditText}>编辑本日</Text>
                  </TouchableOpacity>
                  <View style={styles.dateStats}>
                    <Text style={styles.dateStatText}>{group.totalCount} 张</Text>
                    {group.totalPrice > 0 && (
                      <Text style={styles.datePriceText}> · ¥{group.totalPrice}</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.photoGrid}>
                {group.records.map(record => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.photoItem}
                    onPress={() => openPhotoModal(record)}
                    onLongPress={() => navigation.navigate('Edit', { recordId: record.id })}
                  >
                    <CachedImage uri={record.photoUri} style={styles.photoImage} />
                    {record.backPhotoUri && (
                      <View style={styles.backPhotoBadge}>
                        <Ionicons name='document-text' size={10} color={colors.WHITE} />
                      </View>
                    )}
                    {record.photoCount > 1 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>×{record.photoCount}</Text>
                      </View>
                    )}
                    {record.price !== undefined && record.price > 0 && (
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceBadgeText}>¥{record.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {groupedRecords.length === 0 && (
            <EmptyState
              icon='camera-outline'
              title='暂无记录'
              message='点击右下角的 + 号添加拍立得'
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={closePhotoModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closePhotoModal}>
            <Ionicons name='close' size={28} color={colors.WHITE} />
          </TouchableOpacity>

          {selectedRecord && selectedRecord.photoUri ? (
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={togglePhoto} activeOpacity={0.9} style={styles.modalImageContainer}>
                <CachedImage
                  uri={showingBack && selectedRecord.backPhotoUri ? selectedRecord.backPhotoUri : selectedRecord.photoUri}
                  style={styles.modalImage}
                  resizeMode='contain'
                />
              </TouchableOpacity>

              <View style={styles.modalInfo}>
                <Text style={styles.modalDate}>
                  {formatDate(selectedRecord.photoDate)} · {selectedRecord.photoCount} 张
                  {selectedRecord.price !== undefined && selectedRecord.price > 0 && ` · ¥${selectedRecord.price}`}
                </Text>
                {selectedRecord.backPhotoUri && (
                  <TouchableOpacity style={styles.toggleButton} onPress={togglePhoto}>
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

              {selectedRecord.note && (
                <View style={styles.noteContainer}>
                  <Ionicons name='chatbubble-outline' size={14} color={colors.GRAY[400]} />
                  <Text style={styles.noteText}>{selectedRecord.note}</Text>
                </View>
              )}

              {(selectedRecord.groupName || selectedRecord.city || selectedRecord.venue || selectedRecord.polaroidType || selectedRecord.memberCount) && (
                <View style={styles.extraInfoContainer}>
                  {selectedRecord.groupName && (
                    <View style={styles.extraInfoItem}>
                      <Text style={styles.extraInfoLabel}>团体</Text>
                      <Text style={styles.extraInfoValue}>{selectedRecord.groupName}</Text>
                    </View>
                  )}
                  {selectedRecord.city && (
                    <View style={styles.extraInfoItem}>
                      <Text style={styles.extraInfoLabel}>城市</Text>
                      <Text style={styles.extraInfoValue}>{selectedRecord.city}</Text>
                    </View>
                  )}
                  {selectedRecord.venue && (
                    <View style={styles.extraInfoItem}>
                      <Text style={styles.extraInfoLabel}>场馆</Text>
                      <Text style={styles.extraInfoValue}>{selectedRecord.venue}</Text>
                    </View>
                  )}
                  {selectedRecord.polaroidType && (
                    <View style={styles.extraInfoItem}>
                      <Text style={styles.extraInfoLabel}>类型</Text>
                      <Text style={styles.extraInfoValue}>{selectedRecord.polaroidType}</Text>
                    </View>
                  )}
                  {selectedRecord.memberCount && (
                    <View style={styles.extraInfoItem}>
                      <Text style={styles.extraInfoLabel}>人数</Text>
                      <Text style={styles.extraInfoValue}>{selectedRecord.memberCount}</Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  closePhotoModal()
                  navigation.navigate('Edit', { recordId: selectedRecord.id })
                }}
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

      <Modal
        visible={batchEdit.visible}
        transparent={true}
        animationType='slide'
        onRequestClose={closeBatchEdit}
      >
        <View style={styles.batchEditModal}>
          <View style={styles.batchEditContent}>
            <View style={styles.batchEditHeader}>
              <Text style={styles.batchEditTitle}>批量编辑</Text>
              <TouchableOpacity onPress={closeBatchEdit}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.batchEditBody}>
              <Text style={styles.batchEditDate}>
                {formatDate(batchEdit.date)}
              </Text>

              <View style={styles.batchEditField}>
                <Text style={styles.batchEditLabel}>团体</Text>
                <TouchableOpacity
                  style={styles.batchEditInputWrapper}
                  onPress={() => setShowFieldSelector('groupName')}
                >
                  <Text style={[styles.batchEditInputText, batchEdit.groupName ? null : styles.batchEditPlaceholder]}>
                    {batchEdit.groupName || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>

              <View style={styles.batchEditField}>
                <Text style={styles.batchEditLabel}>城市</Text>
                <TouchableOpacity
                  style={styles.batchEditInputWrapper}
                  onPress={() => setShowFieldSelector('city')}
                >
                  <Text style={[styles.batchEditInputText, batchEdit.city ? null : styles.batchEditPlaceholder]}>
                    {batchEdit.city || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>

              <View style={styles.batchEditField}>
                <Text style={styles.batchEditLabel}>场馆</Text>
                <TouchableOpacity
                  style={styles.batchEditInputWrapper}
                  onPress={() => setShowFieldSelector('venue')}
                >
                  <Text style={[styles.batchEditInputText, batchEdit.venue ? null : styles.batchEditPlaceholder]}>
                    {batchEdit.venue || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.batchEditCount}>
                将同时更新 {batchEdit.recordIds.length} 条记录
              </Text>

              <View style={styles.batchEditButtons}>
                <TouchableOpacity
                  style={styles.batchEditCancelButton}
                  onPress={closeBatchEdit}
                  disabled={saving}
                >
                  <Text style={styles.batchEditCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.batchEditSaveButton}
                  onPress={handleBatchEdit}
                  disabled={saving}
                >
                  <Text style={styles.batchEditSaveText}>
                    {saving ? '保存中...' : '保存'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <FieldHistorySelector
        visible={showFieldSelector !== null}
        field={showFieldSelector || 'groupName'}
        title={showFieldSelector === 'groupName' ? '团体' : showFieldSelector === 'city' ? '城市' : '场馆'}
        currentValue={showFieldSelector === 'groupName' ? batchEdit.groupName : showFieldSelector === 'city' ? batchEdit.city : batchEdit.venue}
        onClose={() => setShowFieldSelector(null)}
        onSelect={(value) => {
          if (showFieldSelector === 'groupName') {
            setBatchEdit(prev => ({ ...prev, groupName: value }))
          } else if (showFieldSelector === 'city') {
            setBatchEdit(prev => ({ ...prev, city: value }))
          } else if (showFieldSelector === 'venue') {
            setBatchEdit(prev => ({ ...prev, venue: value }))
          }
        }}
      />

      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>分享卡片</Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.shareCardContainer} collapsable={false}>
              <ShareCard
                ref={shareCardRef}
                idolName={idolName}
                avatarUri={avatarUri}
                totalCount={detail?.totalCount || 0}
                totalRecords={detail?.totalRecords || 0}
                totalPrice={detail?.totalPrice || 0}
                records={detail?.records || []}
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
    </>
  )
}

export default DetailScreen