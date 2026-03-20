import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, CARD_SHADOW } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useIdolDetail } from '../hooks/useRecords'
import { formatDate } from '../utils/rankingUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { PolaroidRecord } from '../types'
import { getAvatar, pickAndSetAvatar, removeAvatar } from '../services/avatarService'

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

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { idolName } = route.params
  const { detail, loading, error, ascending, toggleSort, refreshDetail } =
    useIdolDetail(idolName)
  const [refreshing, setRefreshing] = React.useState(false)
  const [photoModalVisible, setPhotoModalVisible] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState<PolaroidRecord | null>(null)
  const [showingBack, setShowingBack] = React.useState(false)
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null)

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
        <TouchableOpacity onPress={toggleSort}>
          <Ionicons
            name={ascending ? 'arrow-up' : 'arrow-down'}
            size={24}
            color={COLORS.WHITE}
          />
        </TouchableOpacity>
      ),
    })
  }, [navigation, ascending])

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
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={showAvatarOptions}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name='person' size={40} color={COLORS.WHITE} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name='camera' size={14} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.idolName}>{detail.idolName}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name='camera' size={20} color={COLORS.PRIMARY} />
              <Text style={styles.statText}>{detail.totalCount} 张</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name='calendar' size={20} color={COLORS.PRIMARY} />
              <Text style={styles.statText}>{detail.totalRecords} 次</Text>
            </View>
            {detail.totalPrice > 0 && (
              <View style={styles.stat}>
                <Ionicons name='wallet' size={20} color={COLORS.PRIMARY} />
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
                  <Ionicons name='calendar' size={16} color={COLORS.PRIMARY} />
                  <Text style={styles.dateText}>{formatDate(group.date)}</Text>
                </View>
                <View style={styles.dateStats}>
                  <Text style={styles.dateStatText}>{group.totalCount} 张</Text>
                  {group.totalPrice > 0 && (
                    <Text style={styles.datePriceText}> · ¥{group.totalPrice}</Text>
                  )}
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
                    <Image source={{ uri: record.photoUri }} style={styles.photoImage} />
                    {record.backPhotoUri && (
                      <View style={styles.backPhotoBadge}>
                        <Ionicons name='document-text' size={10} color={COLORS.WHITE} />
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
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closePhotoModal}>
            <Ionicons name='close' size={28} color={COLORS.WHITE} />
          </TouchableOpacity>

          {selectedRecord && (
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={togglePhoto} activeOpacity={0.9}>
                <Image
                  source={{ uri: showingBack && selectedRecord.backPhotoUri ? selectedRecord.backPhotoUri : selectedRecord.photoUri }}
                  style={styles.modalImage}
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
                      color={COLORS.PRIMARY}
                    />
                    <Text style={styles.toggleButtonText}>
                      {showingBack ? '查看正面' : '查看背签'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  closePhotoModal()
                  navigation.navigate('Edit', { recordId: selectedRecord.id })
                }}
              >
                <Ionicons name='create-outline' size={16} color={COLORS.WHITE} />
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
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
    borderColor: COLORS.WHITE,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  idolName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
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
    color: COLORS.WHITE,
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
    color: COLORS.BLACK,
  },
  sortHint: {
    fontSize: 12,
    color: COLORS.GRAY[500],
  },
  dateGroup: {
    backgroundColor: COLORS.WHITE,
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
    borderBottomColor: COLORS.GRAY[100],
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  dateStats: {
    flexDirection: 'row',
  },
  dateStatText: {
    fontSize: 13,
    color: COLORS.GRAY[600],
  },
  datePriceText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
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
    backgroundColor: COLORS.SUCCESS,
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
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  priceBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priceBadgeText: {
    fontSize: 11,
    color: COLORS.WHITE,
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
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: COLORS.GRAY[100],
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
    color: COLORS.WHITE,
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
    color: COLORS.WHITE,
    marginLeft: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 13,
    color: COLORS.WHITE,
    marginLeft: 6,
  },
})

export default DetailScreen