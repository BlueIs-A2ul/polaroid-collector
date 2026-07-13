import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import AnimatedBottomSheet from '../components/common/AnimatedBottomSheet'
import { RootStackParamList } from '../navigation/AppNavigator'
import { pickPhoto, pickMultiplePhotos, PhotoWithDate } from '../services/photoService'
import { createRecord, createMultipleRecords } from '../services/recordService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdolSelector from '../components/features/IdolSelector'
import FieldHistorySelector from '../components/features/FieldHistorySelector'
import OptionsSelector from '../components/common/OptionsSelector'
import { POLAROID_TYPE_OPTIONS, MEMBER_COUNT_OPTIONS } from '../constants/polaroidOptions'
import { PhotoItem } from '../types'
import { getIdolGroupBinding } from '../services/idolBindingService'
import { getIdolDefaultPrice, getIdolPriceOptions } from '../services/priceStatsService'
import { Dialog } from '../services/dialogService'
import { createUploadScreenStyles } from './uploadScreenStyles'

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
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showIdolSelector, setShowIdolSelector] = useState<boolean>(false)
  const [showCropOptions, setShowCropOptions] = useState<boolean>(false)
  const [allowCrop, setAllowCrop] = useState<boolean>(false)
  const [cropWidth, setCropWidth] = useState<number>(4)
  const [cropHeight, setCropHeight] = useState<number>(3)
  const [pendingSource, setPendingSource] = useState<'camera' | 'library'>('library')
  const [pendingBackPhotoUri, setPendingBackPhotoUri] = useState<string | null>(null)
  const [showFieldSelector, setShowFieldSelector] = useState<'groupName' | 'city' | 'venue' | null>(null)
  const [globalGroupName, setGlobalGroupName] = useState<string>('')
  const [globalCity, setGlobalCity] = useState<string>('')
  const [globalVenue, setGlobalVenue] = useState<string>('')
  const [defaultGroupName, setDefaultGroupName] = useState<string | null>(null)
  const [defaultPrice, setDefaultPrice] = useState<number | null>(null)
  const [priceOptions, setPriceOptions] = useState<number[]>([])
  const [showPriceSelector, setShowPriceSelector] = useState<string | null>(null)
  const [mergeAsOneRecord, setMergeAsOneRecord] = useState<boolean>(false)

  useEffect(() => {
    if (!idolName.trim()) {
      setDefaultPrice(null)
      setPriceOptions([])
      setDefaultGroupName(null)
      setGlobalGroupName('')
      return
    }
    
    getIdolGroupBinding(idolName).then(({ success, data }) => {
      if (success && data) {
        setDefaultGroupName(data)
        setGlobalGroupName(data)
      }
    })
    getIdolDefaultPrice(idolName).then(({ success, data }) => {
      if (success && data) {
        setDefaultPrice(data)
      }
    })
    getIdolPriceOptions(idolName).then(({ success, data }) => {
      if (success && data) {
        setPriceOptions(data)
      }
    })
  }, [idolName])

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

  const handleShowCropOptions = (source: 'camera' | 'library' | 'multiple') => {
    if (source === 'multiple') {
      handleConfirmCropOptionsForMultiple()
    } else {
      setPendingSource(source)
      setShowCropOptions(true)
    }
  }

  const handleConfirmCropOptionsForMultiple = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { success, data, error } = await pickMultiplePhotos({
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success && data) {
      const newPhotos: PhotoItem[] = data.map(p => ({
        uri: p.uri,
        count: 1,
        price: defaultPrice || undefined,
      }))
      setPhotos(prev => [...prev, ...newPhotos])

      const firstDate = data[0]?.capturedDate
      if (firstDate && photoDate === today) {
        setPhotoDate(firstDate)
      }
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择照片失败', 'error')
    }
  }

  const handleConfirmCropOptions = async () => {
    setShowCropOptions(false)

    const today = new Date().toISOString().split('T')[0]

    const { success, data, error } = await pickPhoto(pendingSource, {
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success && data) {
      setPhotos(prev => [...prev, {
        uri: data.uri,
        count: 1,
        price: defaultPrice || undefined,
      }])

      if (data.capturedDate && photoDate === today) {
        setPhotoDate(data.capturedDate)
      }
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择照片失败', 'error')
    }
  }

  const handleOpenIdolSelector = () => {
    setShowIdolSelector(true)
  }

  const handleSelectIdol = (selectedIdolName: string) => {
    setIdolName(selectedIdolName)
  }

  const updatePhotoCount = (uri: string, count: number) => {
    setPhotos(photos.map(p => (p.uri === uri ? { ...p, count: Math.max(1, count) } : p)))
  }

  const updatePhotoPrice = (uri: string, price: number) => {
    setPhotos(photos.map(p => (p.uri === uri ? { ...p, price: price > 0 ? price : undefined } : p)))
  }

  const updatePhotoNote = (uri: string, note: string) => {
    setPhotos(photos.map(p => (p.uri === uri ? { ...p, note: note.trim() || undefined } : p)))
  }

  const updatePhotoField = (uri: string, field: keyof PhotoItem, value: string | undefined) => {
    setPhotos(photos.map(p => (p.uri === uri ? { ...p, [field]: value || undefined } : p)))
  }

  const removePhoto = (uri: string) => {
    setPhotos(photos.filter(p => p.uri !== uri))
  }

  const handleAddBackPhoto = async (photoUri: string) => {
    const { success, data, error } = await pickPhoto('library', {
      allowCrop: false,
    })

    if (success && data) {
      setPhotos(photos.map(p => (p.uri === photoUri ? { ...p, backPhotoUri: data.uri } : p)))
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择背签照片失败', 'error')
    }
  }

  const handleRemoveBackPhoto = (photoUri: string) => {
    setPhotos(photos.map(p => (p.uri === photoUri ? { ...p, backPhotoUri: undefined } : p)))
  }

  const getTotalCount = (): number => {
    return photos.reduce((sum, p) => sum + p.count, 0)
  }

  const getTotalPrice = (): number => {
    return photos.reduce((sum, p) => sum + (p.price || 0), 0)
  }

  const getBackPhotoCount = (): number => {
    return photos.filter(p => p.backPhotoUri).length
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
          setPhotos([])
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
          setPhotos([])
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
          <Ionicons name='arrow-back' size={24} color={colors.WHITE} />
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>公共信息（应用到所有照片）</Text>
            <View style={styles.globalFieldsRow}>
              <View style={styles.globalFieldHalf}>
                <Text style={styles.extraFieldLabel}>团体</Text>
                <TouchableOpacity
                  style={styles.extraFieldInputWrapper}
                  onPress={() => setShowFieldSelector('groupName')}
                >
                  <Text style={[styles.extraFieldInputText, globalGroupName ? null : styles.extraFieldPlaceholder]}>
                    {globalGroupName || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>
              <View style={styles.globalFieldHalf}>
                <Text style={styles.extraFieldLabel}>城市</Text>
                <TouchableOpacity
                  style={styles.extraFieldInputWrapper}
                  onPress={() => setShowFieldSelector('city')}
                >
                  <Text style={[styles.extraFieldInputText, globalCity ? null : styles.extraFieldPlaceholder]}>
                    {globalCity || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.globalFieldsRow}>
              <View style={styles.globalFieldFull}>
                <Text style={styles.extraFieldLabel}>场馆</Text>
                <TouchableOpacity
                  style={styles.extraFieldInputWrapper}
                  onPress={() => setShowFieldSelector('venue')}
                >
                  <Text style={[styles.extraFieldInputText, globalVenue ? null : styles.extraFieldPlaceholder]}>
                    {globalVenue || '选填'}
                  </Text>
                  <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {photos.length > 0 && (
          <View style={styles.formGroup}>
            <View style={styles.photoListHeader}>
              <Text style={styles.label}>已选照片 ({photos.length})</Text>
              <View style={styles.photoListSummary}>
                <Text style={styles.totalCount}>共 {getTotalCount()} 张</Text>
                {getTotalPrice() > 0 && (
                  <Text style={styles.totalPrice}> · ¥{getTotalPrice()}</Text>
                )}
              </View>
            </View>
            
            {photos.length > 1 && (
              <View style={styles.mergeToggleContainer}>
                <Text style={styles.mergeToggleLabel}>
                  {mergeAsOneRecord ? '合并为 1 条记录（推荐）' : '每条照片作为独立记录'}
                </Text>
                <Switch
                  value={mergeAsOneRecord}
                  onValueChange={setMergeAsOneRecord}
                  trackColor={{
                    false: colors.GRAY[300],
                    true: colors.PRIMARY,
                  }}
                  thumbColor={colors.WHITE}
                />
              </View>
            )}
            
            {photos.map((photo, index) => (
              <View key={photo.uri} style={styles.photoItem}>
                <View style={styles.photoThumbnailContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                  {photo.backPhotoUri && (
                    <View style={styles.backPhotoBadge}>
                      <Ionicons name='document-text' size={12} color={colors.WHITE} />
                    </View>
                  )}
                </View>
                <View style={styles.photoInfo}>
                  <View style={styles.photoInfoHeader}>
                    <Text style={styles.photoIndex}>照片 {index + 1}</Text>
                    {photo.backPhotoUri && (
                      <View style={styles.backPhotoTag}>
                        <Ionicons name='document-text' size={12} color={colors.SUCCESS} />
                        <Text style={styles.backPhotoTagText}>背签</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.countInputContainer}>
                    <Text style={styles.countLabel}>数量:</Text>
                    <TextInput
                      style={styles.countInput}
                      value={String(photo.count)}
                      onChangeText={text => updatePhotoCount(photo.uri, parseInt(text) || 1)}
                      keyboardType='number-pad'
                    />
                  </View>
                  <View style={styles.countInputContainer}>
                    <Text style={styles.countLabel}>价格:</Text>
                    <TextInput
                      style={styles.countInput}
                      value={photo.price ? String(photo.price) : ''}
                      onChangeText={text => updatePhotoPrice(photo.uri, parseFloat(text) || 0)}
                      keyboardType='decimal-pad'
                      placeholder='选填'
                    />
                    {priceOptions.length > 0 && (
                      <TouchableOpacity
                        style={styles.priceSelectButton}
                        onPress={() => setShowPriceSelector(photo.uri)}
                      >
                        <Ionicons name='pricetag' size={16} color={colors.PRIMARY} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.noteInputContainer}>
                    <Text style={styles.countLabel}>备注:</Text>
                    <TextInput
                      style={styles.noteInput}
                      value={photo.note || ''}
                      onChangeText={text => updatePhotoNote(photo.uri, text)}
                      placeholder='选填'
                      multiline
                    />
                  </View>
                  <View style={styles.extraFieldsContainer}>
                    <View style={styles.extraFieldRow}>
                      <View style={styles.extraFieldHalf}>
                        <OptionsSelector
                          label='类型'
                          value={photo.polaroidType || ''}
                          options={POLAROID_TYPE_OPTIONS}
                          placeholder='选填'
                          onChange={value => updatePhotoField(photo.uri, 'polaroidType', value)}
                        />
                      </View>
                      <View style={styles.extraFieldHalf}>
                        <OptionsSelector
                          label='人数'
                          value={photo.memberCount || ''}
                          options={MEMBER_COUNT_OPTIONS}
                          placeholder='选填'
                          onChange={value => updatePhotoField(photo.uri, 'memberCount', value)}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.photoActions}>
                    {photo.backPhotoUri ? (
                      <TouchableOpacity
                        style={styles.removeBackPhotoButton}
                        onPress={() => handleRemoveBackPhoto(photo.uri)}
                      >
                        <Ionicons name='document-text-outline' size={14} color={colors.ERROR} />
                        <Text style={styles.removeBackPhotoText}>移除背签</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBackPhotoButton}
                        onPress={() => handleAddBackPhoto(photo.uri)}
                      >
                        <Ionicons name='add-circle-outline' size={14} color={colors.PRIMARY} />
                        <Text style={styles.addBackPhotoText}>添加背签</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(photo.uri)}
                >
                  <Ionicons name='close-circle' size={24} color={colors.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={colors.WHITE} />
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

      <AnimatedBottomSheet
        visible={showPriceSelector !== null}
        onClose={() => setShowPriceSelector(null)}
        title='选择价格'
      >
        <View style={{ padding: 16 }}>
          {priceOptions.map(price => (
            <TouchableOpacity
              key={price}
              style={styles.priceOption}
              onPress={() => {
                if (showPriceSelector) {
                  updatePhotoPrice(showPriceSelector, price)
                }
                setShowPriceSelector(null)
              }}
            >
              <Text style={styles.priceOptionText}>¥{price}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.priceOption}
            onPress={() => setShowPriceSelector(null)}
          >
            <Text style={[styles.priceOptionText, styles.priceOptionManual]}>手动输入</Text>
          </TouchableOpacity>
        </View>
      </AnimatedBottomSheet>

      <AnimatedBottomSheet
        visible={showCropOptions}
        onClose={() => setShowCropOptions(false)}
        title='裁切选项'
      >
        <View style={{ padding: 16 }}>
          <View style={styles.cropOption}>
            <Text style={styles.cropLabel}>启用裁切</Text>
            <Switch
              value={allowCrop}
              onValueChange={setAllowCrop}
              trackColor={{
                false: colors.GRAY[300],
                true: colors.PRIMARY,
              }}
              thumbColor={colors.WHITE}
            />
          </View>

          {allowCrop && (
            <View style={styles.cropDimensions}>
              <Text style={styles.cropLabel}>裁切尺寸比例</Text>
              <View style={styles.dimensionInputs}>
                <TextInput
                  style={styles.dimensionInput}
                  value={String(cropWidth)}
                  onChangeText={text => setCropWidth(Number(text) || 1)}
                  keyboardType='number-pad'
                  placeholder='宽'
                />
                <Text style={styles.dimensionSeparator}>:</Text>
                <TextInput
                  style={styles.dimensionInput}
                  value={String(cropHeight)}
                  onChangeText={text => setCropHeight(Number(text) || 1)}
                  keyboardType='number-pad'
                  placeholder='高'
                />
              </View>
              <Text style={styles.cropHint}>
                例如：4:3 表示宽度为 4 份，高度为 3 份
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmCropOptions}
          >
            <Text style={styles.confirmButtonText}>确定</Text>
          </TouchableOpacity>
        </View>
      </AnimatedBottomSheet>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default UploadScreen