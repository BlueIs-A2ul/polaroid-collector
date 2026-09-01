import React, { useState, useEffect, Fragment } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { Dialog } from '../services/dialogService'
import type { RootStackParamList } from '../types/navigation'
import { pickPhoto } from '../services/photoService'
import { getRecordById } from '../services/recordQueryService'
import { updateRecordData, deleteRecordData } from '../services/recordCommandService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import FieldHistorySelector from '../components/features/FieldHistorySelector'
import { createEditScreenStyles } from './editScreenStyles'
import EditCropOptionsSheet from '../components/features/edit/EditCropOptionsSheet'
import EditPhotoSection from '../components/features/edit/EditPhotoSection'
import EditRecordFormFields from '../components/features/edit/EditRecordFormFields'

type EditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Edit'>
type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>

interface EditScreenProps {
  navigation: EditScreenNavigationProp
  route: EditScreenRouteProp
}

const EditScreen: React.FC<EditScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme()
  const { recordId } = route.params
  const [idolName, setIdolName] = useState<string>('')
  const [photoCount, setPhotoCount] = useState<string>('')
  const [photoDate, setPhotoDate] = useState<string>('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null)
  const [price, setPrice] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [groupName, setGroupName] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [venue, setVenue] = useState<string>('')
  const [polaroidType, setPolaroidType] = useState<string>('')
  const [memberCount, setMemberCount] = useState<string>('')
  const [originalPhotoUri, setOriginalPhotoUri] = useState<string | null>(null)
  const [originalBackPhotoUri, setOriginalBackPhotoUri] = useState<string | null>(null)
  const [originalIdolName, setOriginalIdolName] = useState<string>('')
  const [originalPhotoCount, setOriginalPhotoCount] = useState<string>('')
  const [originalPhotoDate, setOriginalPhotoDate] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [originalNote, setOriginalNote] = useState<string>('')
  const [originalGroupName, setOriginalGroupName] = useState<string>('')
  const [originalCity, setOriginalCity] = useState<string>('')
  const [originalVenue, setOriginalVenue] = useState<string>('')
  const [originalPolaroidType, setOriginalPolaroidType] = useState<string>('')
  const [originalMemberCount, setOriginalMemberCount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCropOptions, setShowCropOptions] = useState<boolean>(false)
  const [allowCrop, setAllowCrop] = useState<boolean>(false)
  const [cropWidth, setCropWidth] = useState<number>(4)
  const [cropHeight, setCropHeight] = useState<number>(3)
  const [pendingSource, setPendingSource] = useState<'camera' | 'library'>(
    'library',
  )
  const [pendingPhotoType, setPendingPhotoType] = useState<'front' | 'back'>('front')
  const [showFieldSelector, setShowFieldSelector] = useState<'groupName' | 'city' | 'venue' | null>(null)

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setSelectedDate(selectedDate)
      setPhotoDate(formatDateToString(selectedDate))
    }
  }

  const showDatePickerModal = () => {
    setSelectedDate(parseDateFromString(photoDate))
    setShowDatePicker(true)
  }

  const handleShowCropOptions = (source: 'camera' | 'library', photoType: 'front' | 'back') => {
    setPendingSource(source)
    setPendingPhotoType(photoType)
    setShowCropOptions(true)
  }

  const handleConfirmCropOptions = async () => {
    setShowCropOptions(false)
    const { success, data, error } = await pickPhoto(pendingSource, {
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success && data) {
      if (pendingPhotoType === 'front') {
        setPhotoUri(data.uri)
      } else {
        setBackPhotoUri(data.uri)
      }
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择照片失败', 'error')
    }
  }

  useEffect(() => {
    loadRecord()
  }, [recordId])

  const loadRecord = async () => {
    const { success, data, error } = await getRecordById(recordId)

    if (success && data) {
      setIdolName(data.idolName)
      setPhotoCount(data.photoCount.toString())
      setPhotoDate(data.photoDate)
      setPhotoUri(data.photoUri)
      setBackPhotoUri(data.backPhotoUri || null)
      setPrice(data.price ? String(data.price) : '')
      setNote(data.note || '')
      setGroupName(data.groupName || '')
      setCity(data.city || '')
      setVenue(data.venue || '')
      setPolaroidType(data.polaroidType || '')
      setMemberCount(data.memberCount || '')
      setOriginalPhotoUri(data.photoUri)
      setOriginalBackPhotoUri(data.backPhotoUri || null)
      setOriginalIdolName(data.idolName)
      setOriginalPhotoCount(data.photoCount.toString())
      setOriginalPhotoDate(data.photoDate)
      setOriginalPrice(data.price ? String(data.price) : '')
      setOriginalNote(data.note || '')
      setOriginalGroupName(data.groupName || '')
      setOriginalCity(data.city || '')
      setOriginalVenue(data.venue || '')
      setOriginalPolaroidType(data.polaroidType || '')
      setOriginalMemberCount(data.memberCount || '')
      setLoading(false)
    } else {
      setLoading(false)
      Dialog.toast(error || '加载记录失败', 'error')
      navigation.goBack()
    }
  }

  const handlePickPhoto = (source: 'camera' | 'library', photoType: 'front' | 'back') => {
    handleShowCropOptions(source, photoType)
  }

  const handlePickBackPhoto = async () => {
    const { success, data, error } = await pickPhoto('library', {
      allowCrop: false,
    })

    if (success && data) {
      setBackPhotoUri(data.uri)
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择背签照片失败', 'error')
    }
  }

  const handleRemoveBackPhoto = async () => {
    const result = await Dialog.confirm({
      title: '删除背签',
      message: '确定要删除背签照片吗？',
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive' },
      ],
    })
    if (result === 1) {
      setBackPhotoUri(null)
    }
  }

  const validateForm = (): boolean => {
    if (!idolName.trim()) {
      Dialog.toast('请输入偶像名称', 'warning')
      return false
    }

    if (!photoCount || parseInt(photoCount) <= 0) {
      Dialog.toast('请输入有效的拍立得数量', 'warning')
      return false
    }

    if (!photoDate) {
      Dialog.toast('请选择拍摄日期', 'warning')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)

    const updateData: {
      idolName: string
      photoCount: number
      photoDate: string
      photoUri: string
      backPhotoUri?: string
      price?: number
      note?: string
      groupName?: string
      city?: string
      venue?: string
      polaroidType?: string
      memberCount?: string
    } = {
      idolName: idolName.trim(),
      photoCount: parseInt(photoCount),
      photoDate,
      photoUri: photoUri!,
    }

    if (backPhotoUri) {
      updateData.backPhotoUri = backPhotoUri
    } else if (originalBackPhotoUri) {
      updateData.backPhotoUri = ''
    }

    if (price) {
      updateData.price = parseFloat(price)
    } else if (originalPrice) {
      updateData.price = 0
    }

    if (note.trim()) {
      updateData.note = note.trim()
    } else if (originalNote) {
      updateData.note = ''
    }

    if (groupName.trim()) {
      updateData.groupName = groupName.trim()
    } else if (originalGroupName) {
      updateData.groupName = ''
    }

    if (city.trim()) {
      updateData.city = city.trim()
    } else if (originalCity) {
      updateData.city = ''
    }

    if (venue.trim()) {
      updateData.venue = venue.trim()
    } else if (originalVenue) {
      updateData.venue = ''
    }

    if (polaroidType) {
      updateData.polaroidType = polaroidType
    } else if (originalPolaroidType) {
      updateData.polaroidType = ''
    }

    if (memberCount) {
      updateData.memberCount = memberCount
    } else if (originalMemberCount) {
      updateData.memberCount = ''
    }

    const { success, error: err } = await updateRecordData(recordId, updateData)

    setSaving(false)

    if (success) {
      Dialog.toast('记录已更新', 'success')
      navigation.goBack()
    } else {
      Dialog.toast(err || '更新失败', 'error')
    }
  }

  const handleDelete = async () => {
    const result = await Dialog.confirm({
      title: '确认删除',
      message: '确定要删除这条记录吗？此操作无法撤销。',
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive' },
      ],
    })
    if (result === 1) {
      setSaving(true)
      const { success, error: err } = await deleteRecordData(recordId)
      setSaving(false)

      if (success) {
        Dialog.toast('记录已删除', 'success')
        navigation.goBack()
      } else {
        Dialog.toast(err || '删除失败', 'error')
      }
    }
  }

  const handleCancel = async () => {
    const hasChanges =
      idolName !== originalIdolName ||
      photoCount !== originalPhotoCount ||
      photoDate !== originalPhotoDate ||
      photoUri !== originalPhotoUri ||
      backPhotoUri !== originalBackPhotoUri ||
      price !== originalPrice ||
      note !== originalNote ||
      groupName !== originalGroupName ||
      city !== originalCity ||
      venue !== originalVenue ||
      polaroidType !== originalPolaroidType ||
      memberCount !== originalMemberCount

    if (hasChanges) {
      const result = await Dialog.confirm({
        title: '放弃修改',
        message: '确定要放弃所有修改吗？',
        buttons: [
          { text: '继续编辑', style: 'cancel' },
          { text: '放弃', style: 'destructive' },
        ],
      })
      if (result === 1) {
        navigation.goBack()
      }
    } else {
      navigation.goBack()
    }
  }

  const handleRemovePhoto = async () => {
    const result = await Dialog.confirm({
      title: '删除照片',
      message: '确定要删除当前照片吗？删除后需要重新选择。',
      buttons: [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive' },
      ],
    })
    if (result === 1) {
      setPhotoUri(null)
    }
  }

  const styles = createEditScreenStyles(colors)

  if (loading) {
    return <LoadingSpinner />
  }

  if (saving) {
    return <LoadingSpinner />
  }

  return (
    <Fragment>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel} accessibilityLabel='返回'>
            <Ionicons name='arrow-back' size={24} color={colors.ON_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>编辑拍立得</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityLabel='删除记录'>
            <Ionicons name='trash' size={24} color={colors.ERROR} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <EditRecordFormFields
            idolName={idolName}
            photoCount={photoCount}
            photoDate={photoDate}
            price={price}
            note={note}
            groupName={groupName}
            city={city}
            venue={venue}
            polaroidType={polaroidType}
            memberCount={memberCount}
            showDatePicker={showDatePicker}
            selectedDate={selectedDate}
            colors={colors}
            styles={styles}
            onIdolNameChange={setIdolName}
            onPhotoCountChange={setPhotoCount}
            onPriceChange={setPrice}
            onNoteChange={setNote}
            onPolaroidTypeChange={setPolaroidType}
            onMemberCountChange={setMemberCount}
            onShowDatePicker={showDatePickerModal}
            onDateChange={handleDateChange}
            onOpenFieldSelector={setShowFieldSelector}
          />

        <EditPhotoSection
          photoUri={photoUri}
          backPhotoUri={backPhotoUri}
          colors={colors}
          styles={styles}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={handleRemovePhoto}
          onPickBackPhoto={handlePickBackPhoto}
          onRemoveBackPhoto={handleRemoveBackPhoto}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={colors.ON_PRIMARY} />
          <Text style={styles.saveButtonText}>保存修改</Text>
        </TouchableOpacity>
      </View>

      <EditCropOptionsSheet
        visible={showCropOptions}
        allowCrop={allowCrop}
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        colors={colors}
        styles={styles}
        onClose={() => setShowCropOptions(false)}
        onAllowCropChange={setAllowCrop}
        onCropWidthChange={setCropWidth}
        onCropHeightChange={setCropHeight}
        onConfirm={handleConfirmCropOptions}
      />
    </ScrollView>
    </KeyboardAvoidingView>

    <FieldHistorySelector
      visible={showFieldSelector !== null}
      field={showFieldSelector || 'groupName'}
      title={showFieldSelector === 'groupName' ? '团体' : showFieldSelector === 'city' ? '城市' : '场馆'}
      currentValue={showFieldSelector === 'groupName' ? groupName : showFieldSelector === 'city' ? city : venue}
      onClose={() => setShowFieldSelector(null)}
      onSelect={(value) => {
        if (showFieldSelector === 'groupName') setGroupName(value)
        else if (showFieldSelector === 'city') setCity(value)
        else if (showFieldSelector === 'venue') setVenue(value)
      }}
    />
  </Fragment>
  )
}

export default EditScreen