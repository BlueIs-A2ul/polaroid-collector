import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useIdolDetail } from '../hooks/useRecords'
import EmptyState from '../components/common/EmptyState'
import { DetailSkeleton } from '../components/common/Skeleton'
import DetailHeader from '../components/features/DetailHeader'
import DateGroupCard, { DateGroup } from '../components/features/DateGroupCard'
import PhotoModal from '../components/features/PhotoModal'
import DetailBatchEditModal, { BatchEditState } from '../components/features/DetailBatchEditModal'
import ShareModal from '../components/features/ShareModal'
import { PolaroidRecord } from '../types'
import { getAvatar, pickAndSetAvatar, removeAvatar } from '../services/avatarService'
import { updateRecordData } from '../services/recordService'
import { deleteRecordsByIdolNames } from '../services/storageService'
import { getIdolGroupBinding, setIdolGroupBinding, removeIdolGroupBinding } from '../services/idolBindingService'
import FieldHistorySelector from '../components/features/FieldHistorySelector'

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>

interface DetailScreenProps {
  navigation: DetailScreenNavigationProp
  route: DetailScreenRouteProp
}

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { idolName } = route.params
  const { colors } = useTheme()
  const { detail, loading, error, ascending, toggleSort, refreshDetail } =
    useIdolDetail(idolName)
  const [refreshing, setRefreshing] = React.useState(false)
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null)
  const [photoModalVisible, setPhotoModalVisible] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState<PolaroidRecord | null>(null)
  const [showingBack, setShowingBack] = React.useState(false)
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
  const [boundGroup, setBoundGroup] = React.useState<string | null>(null)
  const [showGroupBindingSelector, setShowGroupBindingSelector] = React.useState(false)

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
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
  }), [colors])

  const loadAvatar = React.useCallback(async () => {
    const { success, data } = await getAvatar(idolName)
    if (success) {
      setAvatarUri(data)
    }
  }, [idolName])

  const loadGroupBinding = React.useCallback(async () => {
    const { success, data } = await getIdolGroupBinding(idolName)
    if (success) {
      setBoundGroup(data)
    }
  }, [idolName])

  useFocusEffect(
    React.useCallback(() => {
      refreshDetail()
      loadAvatar()
      loadGroupBinding()
    }, [refreshDetail, loadAvatar, loadGroupBinding]),
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

  const handleDeleteIdol = () => {
    Alert.alert('删除偶像', `确定要删除 ${idolName} 的所有记录吗？此操作不可撤销。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeAvatar(idolName)
          await removeIdolGroupBinding(idolName)
          const { success } = await deleteRecordsByIdolNames([idolName])
          if (success) {
            navigation.goBack()
          } else {
            Alert.alert('删除失败', '请稍后重试')
          }
        },
      },
    ])
  }

  const handleSetGroupBinding = async (groupName: string) => {
    if (groupName) {
      const { success } = await setIdolGroupBinding(idolName, groupName)
      if (success) {
        setBoundGroup(groupName)
      }
    } else {
      const { success } = await removeIdolGroupBinding(idolName)
      if (success) {
        setBoundGroup(null)
      }
    }
  }

  const showGroupBindingOptions = () => {
    if (boundGroup) {
      Alert.alert('团体绑定', `当前绑定：${boundGroup}`, [
        { text: '修改团体', onPress: () => setShowGroupBindingSelector(true) },
        { text: '取消绑定', onPress: () => handleSetGroupBinding(''), style: 'destructive' },
        { text: '取消', style: 'cancel' },
      ])
    } else {
      setShowGroupBindingSelector(true)
    }
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Upload', { idolName })}>
            <Ionicons
              name='add'
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSort}>
            <Ionicons
              name={ascending ? 'arrow-up' : 'arrow-down'}
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={showGroupBindingOptions}>
            <Ionicons
              name={boundGroup ? 'people' : 'people-outline'}
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('IdolReport', { idolName, avatarUri })}>
            <Ionicons
              name='stats-chart-outline'
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShareModalVisible(true)}>
            <Ionicons
              name='share-outline'
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteIdol}>
            <Ionicons
              name='trash-outline'
              size={22}
              color={colors.WHITE}
            />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation, ascending, colors, idolName, avatarUri, boundGroup, toggleSort])

  if (loading) {
    return <DetailSkeleton />
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
        <DetailHeader
          idolName={detail.idolName}
          avatarUri={avatarUri}
          totalCount={detail.totalCount}
          totalRecords={detail.totalRecords}
          totalPrice={detail.totalPrice}
          onAvatarPress={showAvatarOptions}
        />

        <View style={styles.recordsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>记录列表</Text>
            <Text style={styles.sortHint}>{ascending ? '从旧到新' : '从新到旧'}</Text>
          </View>

          {groupedRecords.map(group => (
            <DateGroupCard
              key={group.date}
              group={group}
              onPhotoPress={openPhotoModal}
              onPhotoLongPress={(recordId) => navigation.navigate('Edit', { recordId })}
              onBatchEdit={openBatchEdit}
            />
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

      <PhotoModal
        visible={photoModalVisible}
        record={selectedRecord}
        showingBack={showingBack}
        onClose={closePhotoModal}
        onToggleBack={togglePhoto}
        onEdit={() => {
          closePhotoModal()
          if (selectedRecord) {
            navigation.navigate('Edit', { recordId: selectedRecord.id })
          }
        }}
      />

      <DetailBatchEditModal
        batchEdit={batchEdit}
        saving={saving}
        onClose={closeBatchEdit}
        onSave={handleBatchEdit}
        onFieldChange={(field, value) => {
          setBatchEdit(prev => ({ ...prev, [field]: value }))
        }}
        onShowFieldSelector={setShowFieldSelector}
        showFieldSelector={showFieldSelector}
        onHideFieldSelector={() => setShowFieldSelector(null)}
      />

      <ShareModal
        visible={shareModalVisible}
        idolName={idolName}
        avatarUri={avatarUri}
        totalCount={detail.totalCount}
        totalRecords={detail.totalRecords}
        totalPrice={detail.totalPrice}
        records={detail.records}
        onClose={() => setShareModalVisible(false)}
      />

      <FieldHistorySelector
        visible={showGroupBindingSelector}
        field='groupName'
        title='绑定团体'
        currentValue={boundGroup || ''}
        onClose={() => setShowGroupBindingSelector(false)}
        onSelect={(value) => {
          handleSetGroupBinding(value)
          setShowGroupBindingSelector(false)
        }}
      />
    </>
  )
}

export default DetailScreen