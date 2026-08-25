import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { RootStackParamList } from '../navigation/AppNavigator'
import { createRecord, createMultipleRecords } from '../services/recordService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdolSelector from '../components/features/IdolSelector'
import FieldHistorySelector from '../components/features/FieldHistorySelector'
import { Dialog } from '../services/dialogService'
import { createUploadScreenStyles } from './uploadScreenStyles'
import UploadPhotoList from '../components/features/upload/UploadPhotoList'
import UploadCommonFields from '../components/features/upload/UploadCommonFields'
import UploadPriceSelectorSheet from '../components/features/upload/UploadPriceSelectorSheet'
import UploadCropOptionsSheet from '../components/features/upload/UploadCropOptionsSheet'
import { useUploadPhotos } from '../hooks/useUploadPhotos'
import { useUploadIdolDefaults } from '../hooks/useUploadIdolDefaults'

type UploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Upload'
>
type UploadScreenRouteProp = RouteProp<RootStackParamList, 'Upload'>

interface UploadScreenProps {
  navigation: UploadScreenNavigationProp
  route: UploadScreenRouteProp
}

const UploadScreen: React.FC<UploadScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const routeIdolName = route.params?.idolName
  const [idolName, setIdolName] = useState<string>(routeIdolName || '')
  const [photoDate, setPhotoDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showIdolSelector, setShowIdolSelector] = useState<boolean>(false)
  const [showFieldSelector, setShowFieldSelector] = useState<'groupName' | 'city' | 'venue' | null>(null)
  const {
    globalGroupName,
    globalCity,
    globalVenue,
    defaultPrice,
    priceOptions,
    setGlobalGroupName,
    setGlobalCity,
    setGlobalVenue,
  } = useUploadIdolDefaults(idolName)
  const {
    photos,
    showCropOptions,
    allowCrop,
    cropWidth,
    cropHeight,
    showPriceSelector,
    mergeAsOneRecord,
    setShowCropOptions,
    setAllowCrop,
    setCropWidth,
    setCropHeight,
    setShowPriceSelector,
    setMergeAsOneRecord,
    handleShowCropOptions,
    handleConfirmCropOptions,
    updatePhotoCount,
    updatePhotoPrice,
    updatePhotoNote,
    updatePhotoField,
    removePhoto,
    handleAddBackPhoto,
    handleRemoveBackPhoto,
    getTotalCount,
    getBackPhotoCount,
    clearPhotos,
  } = useUploadPhotos({
    photoDate,
    defaultPrice,
    setPhotoDate,
  })


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

  const handleOpenIdolSelector = () => {
    setShowIdolSelector(true)
  }

  const handleSelectIdol = (selectedIdolName: string) => {
    setIdolName(selectedIdolName)
  }

  const validateForm = (): boolean => {
    if (!idolName.trim()) {
      Dialog.toast('请输入偶像名称', 'warning')
      return false
    }

    if (!photoDate) {
      Dialog.toast('请选择拍摄日期', 'warning')
      return false
    }

    if (photos.length === 0) {
      Dialog.toast('请选择或拍摄照片', 'warning')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    let success: boolean
    let err: string | null = null

    if (mergeAsOneRecord && photos.length > 1) {
      // 合并为一条记录
      const totalCount = photos.reduce((sum, p) => sum + p.count, 0)
      const totalPrice = photos.reduce((sum, p) => sum + (p.price || 0), 0)
      const backPhotoCount = photos.filter(p => p.backPhotoUri).length
      const notes = photos.map((p, i) => p.note ? `照片${i + 1}: ${p.note}` : '').filter(Boolean).join('\n')
      
      // 使用第一张照片作为主照片
      const mainPhoto = photos[0]
      // 其余照片的 URI 存储在 additionalPhotoUris 中
      const additionalPhotoUris = photos.slice(1).map(p => p.uri)
      const additionalBackPhotoUris = photos.slice(1).filter(p => p.backPhotoUri).map(p => p.backPhotoUri as string)
      
      const recordData = {
        idolName: idolName.trim(),
        photoCount: totalCount,
        photoDate,
        photoUri: mainPhoto.uri,
        backPhotoUri: mainPhoto.backPhotoUri,
        additionalPhotoUris,
        additionalBackPhotoUris: additionalBackPhotoUris.length > 0 ? additionalBackPhotoUris : undefined,
        price: totalPrice > 0 ? totalPrice : undefined,
        note: notes || mainPhoto.note,
        groupName: globalGroupName.trim() || undefined,
        city: globalCity.trim() || undefined,
        venue: globalVenue.trim() || undefined,
        polaroidType: mainPhoto.polaroidType,
        memberCount: mainPhoto.memberCount,
      }

      const result = await createRecord(recordData)
      success = result.success
      err = result.error

      if (success) {
        const backPhotoMsg = backPhotoCount > 0 ? `，其中 ${backPhotoCount} 张有背签` : ''
        const mergeButtonIndex = await Dialog.confirm({
          title: '成功',
          message: `已保存 1 条记录，共 ${totalCount} 张拍立得${backPhotoMsg}（合并模式）`,
          buttons: [
            { text: '返回首页', style: 'primary' },
            { text: '继续添加', style: 'cancel' },
          ],
        })
        if (mergeButtonIndex === 0) {
          navigation.goBack()
        } else {
          clearPhotos()
        }
      }
    } else {
      // 分开多条记录（原有逻辑）
      const recordsData = photos.map(p => ({
        idolName: idolName.trim(),
        photoCount: p.count,
        photoDate,
        photoUri: p.uri,
        backPhotoUri: p.backPhotoUri,
        price: p.price,
        note: p.note,
        groupName: globalGroupName.trim() || undefined,
        city: globalCity.trim() || undefined,
        venue: globalVenue.trim() || undefined,
        polaroidType: p.polaroidType,
        memberCount: p.memberCount,
      }))

      const result = await createMultipleRecords(recordsData)
      success = result.success
      err = result.error

      if (success) {
        const backPhotoMsg = getBackPhotoCount() > 0 ? `，其中 ${getBackPhotoCount()} 张有背签` : ''
        const buttonIndex = await Dialog.confirm({
          title: '成功',
          message: `已保存 ${photos.length} 条记录，共 ${getTotalCount()} 张拍立得${backPhotoMsg}`,
          buttons: [
            { text: '返回首页', style: 'primary' },
            { text: '继续添加', style: 'cancel' },
          ],
        })
        if (buttonIndex === 0) {
          navigation.goBack()
        } else {
          clearPhotos()
        }
      }
    }

    setLoading(false)

    if (!success) {
      Dialog.toast(err || '保存失败', 'error')
    }
  }

  const styles = createUploadScreenStyles(colors)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={colors.ON_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>上传拍立得</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>偶像名称</Text>
          <View style={styles.idolNameContainer}>
            <TextInput
              style={styles.idolNameInput}
              placeholder='请输入偶像名称'
              value={idolName}
              onChangeText={setIdolName}
            />
            <TouchableOpacity
              style={styles.selectIdolButton}
              onPress={handleOpenIdolSelector}
            >
              <Ionicons name='list' size={24} color={colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.selectIdolHintButton}
            onPress={handleOpenIdolSelector}
          >
            <Ionicons
              name='people-circle-outline'
              size={16}
              color={colors.PRIMARY}
            />
            <Text style={styles.selectIdolHintText}>点击选择已有偶像</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>拍摄日期</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={showDatePickerModal}
          >
            <Text style={styles.dateInputText}>
              {photoDate || '请选择日期'}
            </Text>
            <Ionicons name='calendar' size={20} color={colors.PRIMARY} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode='date'
              display='default'
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>照片</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleShowCropOptions('camera')}
            >
              <Ionicons name='camera' size={28} color={colors.PRIMARY} />
              <Text style={styles.photoButtonText}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleShowCropOptions('library')}
            >
              <Ionicons name='image' size={28} color={colors.PRIMARY} />
              <Text style={styles.photoButtonText}>单张</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleShowCropOptions('multiple')}
            >
              <Ionicons name='images' size={28} color={colors.PRIMARY} />
              <Text style={styles.photoButtonText}>多张</Text>
            </TouchableOpacity>
          </View>
        </View>

        {photos.length > 0 && (
          <UploadCommonFields
            globalGroupName={globalGroupName}
            globalCity={globalCity}
            globalVenue={globalVenue}
            colors={colors}
            styles={styles}
            onOpenFieldSelector={setShowFieldSelector}
          />
        )}

        {photos.length > 0 && (
          <UploadPhotoList
            photos={photos}
            mergeAsOneRecord={mergeAsOneRecord}
            priceOptions={priceOptions}
            colors={colors}
            styles={styles}
            onMergeAsOneRecordChange={setMergeAsOneRecord}
            onUpdatePhotoCount={updatePhotoCount}
            onUpdatePhotoPrice={updatePhotoPrice}
            onUpdatePhotoNote={updatePhotoNote}
            onUpdatePhotoField={updatePhotoField}
            onAddBackPhoto={handleAddBackPhoto}
            onRemoveBackPhoto={handleRemoveBackPhoto}
            onRemovePhoto={removePhoto}
            onShowPriceSelector={setShowPriceSelector}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={colors.ON_PRIMARY} />
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <IdolSelector
        visible={showIdolSelector}
        onClose={() => setShowIdolSelector(false)}
        onSelectIdol={handleSelectIdol}
        currentIdolName={idolName}
      />

      <FieldHistorySelector
        visible={showFieldSelector !== null}
        field={showFieldSelector || 'groupName'}
        title={showFieldSelector === 'groupName' ? '团体' : showFieldSelector === 'city' ? '城市' : '场馆'}
        currentValue={showFieldSelector === 'groupName' ? globalGroupName : showFieldSelector === 'city' ? globalCity : globalVenue}
        onClose={() => setShowFieldSelector(null)}
        onSelect={(value) => {
          if (showFieldSelector === 'groupName') setGlobalGroupName(value)
          else if (showFieldSelector === 'city') setGlobalCity(value)
          else if (showFieldSelector === 'venue') setGlobalVenue(value)
        }}
      />

      <UploadPriceSelectorSheet
        visible={showPriceSelector !== null}
        priceOptions={priceOptions}
        styles={styles}
        onClose={() => setShowPriceSelector(null)}
        onSelectPrice={price => {
          if (showPriceSelector) {
            updatePhotoPrice(showPriceSelector, price)
          }
          setShowPriceSelector(null)
        }}
      />

      <UploadCropOptionsSheet
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
  )
}

export default UploadScreen