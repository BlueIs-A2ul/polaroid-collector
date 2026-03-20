import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
  Modal,
  Switch,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { COLORS, CARD_SHADOW } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { pickPhoto, pickMultiplePhotos } from '../services/photoService'
import { createMultipleRecords } from '../services/recordService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdolSelector from '../components/features/IdolSelector'
import { PhotoItem } from '../types'

type UploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Upload'
>
type UploadScreenRouteProp = RouteProp<RootStackParamList, 'Upload'>

interface UploadScreenProps {
  navigation: UploadScreenNavigationProp
  route: UploadScreenRouteProp
}

const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const [idolName, setIdolName] = useState<string>('')
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
  const [pendingSource, setPendingSource] = useState<'camera' | 'library' | 'multiple'>(
    'library',
  )
  const [pendingBackPhotoUri, setPendingBackPhotoUri] = useState<string | null>(null)

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
    setPendingSource(source)
    if (source === 'multiple') {
      handleConfirmCropOptions()
    } else {
      setShowCropOptions(true)
    }
  }

  const handleConfirmCropOptions = async () => {
    setShowCropOptions(false)

    if (pendingSource === 'multiple') {
      const { success, data, error } = await pickMultiplePhotos({
        allowCrop,
        cropWidth,
        cropHeight,
      })

      if (success && data) {
        const newPhotos: PhotoItem[] = data.map(uri => ({ uri, count: 1 }))
        setPhotos([...photos, ...newPhotos])
      } else if (error !== '用户取消选择') {
        Alert.alert('错误', error || '选择照片失败')
      }
    } else {
      const { success, data, error } = await pickPhoto(pendingSource, {
        allowCrop,
        cropWidth,
        cropHeight,
      })

      if (success && data) {
        setPhotos([...photos, { uri: data, count: 1 }])
      } else if (error !== '用户取消选择') {
        Alert.alert('错误', error || '选择照片失败')
      }
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

  const removePhoto = (uri: string) => {
    setPhotos(photos.filter(p => p.uri !== uri))
  }

  const handleAddBackPhoto = async (photoUri: string) => {
    const { success, data, error } = await pickPhoto('library', {
      allowCrop: false,
    })

    if (success && data) {
      setPhotos(photos.map(p => (p.uri === photoUri ? { ...p, backPhotoUri: data } : p)))
    } else if (error !== '用户取消选择') {
      Alert.alert('错误', error || '选择背签照片失败')
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
      Alert.alert('提示', '请输入偶像名称')
      return false
    }

    if (!photoDate) {
      Alert.alert('提示', '请选择拍摄日期')
      return false
    }

    if (photos.length === 0) {
      Alert.alert('提示', '请选择或拍摄照片')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    const recordsData = photos.map(p => ({
      idolName: idolName.trim(),
      photoCount: p.count,
      photoDate,
      photoUri: p.uri,
      backPhotoUri: p.backPhotoUri,
      price: p.price,
      note: p.note,
    }))

    const { success, error: err } = await createMultipleRecords(recordsData)

    setLoading(false)

    if (success) {
      const backPhotoMsg = getBackPhotoCount() > 0 ? `，其中 ${getBackPhotoCount()} 张有背签` : ''
      Alert.alert(
        '成功',
        `已保存 ${photos.length} 条记录，共 ${getTotalCount()} 张拍立得${backPhotoMsg}`,
        [
          { text: '返回首页', onPress: () => navigation.goBack() },
          {
            text: '继续添加',
            onPress: () => {
              setPhotos([])
            },
          },
        ],
      )
    } else {
      Alert.alert('错误', err || '保存失败')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='arrow-back' size={24} color={COLORS.WHITE} />
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
              <Ionicons name='list' size={24} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.selectIdolHintButton}
            onPress={handleOpenIdolSelector}
          >
            <Ionicons
              name='people-circle-outline'
              size={16}
              color={COLORS.PRIMARY}
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
            <Ionicons name='calendar' size={20} color={COLORS.PRIMARY} />
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
              <Ionicons name='camera' size={28} color={COLORS.PRIMARY} />
              <Text style={styles.photoButtonText}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleShowCropOptions('library')}
            >
              <Ionicons name='image' size={28} color={COLORS.PRIMARY} />
              <Text style={styles.photoButtonText}>单张</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleShowCropOptions('multiple')}
            >
              <Ionicons name='images' size={28} color={COLORS.PRIMARY} />
              <Text style={styles.photoButtonText}>多张</Text>
            </TouchableOpacity>
          </View>
        </View>

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
            {photos.map((photo, index) => (
              <View key={photo.uri} style={styles.photoItem}>
                <View style={styles.photoThumbnailContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                  {photo.backPhotoUri && (
                    <View style={styles.backPhotoBadge}>
                      <Ionicons name='document-text' size={12} color={COLORS.WHITE} />
                    </View>
                  )}
                </View>
                <View style={styles.photoInfo}>
                  <View style={styles.photoInfoHeader}>
                    <Text style={styles.photoIndex}>照片 {index + 1}</Text>
                    {photo.backPhotoUri && (
                      <View style={styles.backPhotoTag}>
                        <Ionicons name='document-text' size={12} color={COLORS.SUCCESS} />
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
                  <View style={styles.photoActions}>
                    {photo.backPhotoUri ? (
                      <TouchableOpacity
                        style={styles.removeBackPhotoButton}
                        onPress={() => handleRemoveBackPhoto(photo.uri)}
                      >
                        <Ionicons name='document-text-outline' size={14} color={COLORS.ERROR} />
                        <Text style={styles.removeBackPhotoText}>移除背签</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBackPhotoButton}
                        onPress={() => handleAddBackPhoto(photo.uri)}
                      >
                        <Ionicons name='add-circle-outline' size={14} color={COLORS.PRIMARY} />
                        <Text style={styles.addBackPhotoText}>添加背签</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(photo.uri)}
                >
                  <Ionicons name='close-circle' size={24} color={COLORS.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={COLORS.WHITE} />
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <IdolSelector
        visible={showIdolSelector}
        onClose={() => setShowIdolSelector(false)}
        onSelectIdol={handleSelectIdol}
        currentIdolName={idolName}
      />

      <Modal
        visible={showCropOptions}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowCropOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>裁切选项</Text>
              <TouchableOpacity onPress={() => setShowCropOptions(false)}>
                <Ionicons name='close' size={24} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.cropOption}>
                <Text style={styles.cropLabel}>启用裁切</Text>
                <Switch
                  value={allowCrop}
                  onValueChange={setAllowCrop}
                  trackColor={{
                    false: COLORS.GRAY[300],
                    true: COLORS.PRIMARY,
                  }}
                  thumbColor={COLORS.WHITE}
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
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.PRIMARY,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    ...CARD_SHADOW,
  },
  idolNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idolNameInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    fontSize: 16,
    ...CARD_SHADOW,
  },
  selectIdolButton: {
    backgroundColor: COLORS.WHITE,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.GRAY[200],
    ...CARD_SHADOW,
  },
  selectIdolHintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  selectIdolHintText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.PRIMARY,
  },
  dateInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  dateInputText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    ...CARD_SHADOW,
  },
  photoButtonText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  photoListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoListSummary: {
    flexDirection: 'row',
  },
  totalCount: {
    fontSize: 14,
    color: COLORS.GRAY[600],
  },
  totalPrice: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    ...CARD_SHADOW,
  },
  photoThumbnailContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  backPhotoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 8,
    padding: 2,
  },
  photoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  photoInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoIndex: {
    fontSize: 14,
    color: COLORS.BLACK,
    marginRight: 8,
  },
  backPhotoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.SUCCESS}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  backPhotoTagText: {
    fontSize: 11,
    color: COLORS.SUCCESS,
    marginLeft: 2,
  },
  countInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  countLabel: {
    fontSize: 14,
    color: COLORS.GRAY[600],
    marginRight: 8,
  },
  countInput: {
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 6,
    padding: 6,
    width: 60,
    fontSize: 14,
    textAlign: 'center',
  },
  noteInputContainer: {
    marginBottom: 6,
  },
  noteInput: {
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  photoActions: {
    flexDirection: 'row',
  },
  addBackPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: `${COLORS.PRIMARY}10`,
    borderRadius: 4,
  },
  addBackPhotoText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginLeft: 4,
  },
  removeBackPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: `${COLORS.ERROR}10`,
    borderRadius: 4,
  },
  removeBackPhotoText: {
    fontSize: 12,
    color: COLORS.ERROR,
    marginLeft: 4,
  },
  removePhotoButton: {
    padding: 4,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...CARD_SHADOW,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    ...CARD_SHADOW,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalContent: {
    padding: 16,
  },
  cropOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropLabel: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  cropDimensions: {
    marginBottom: 24,
  },
  dimensionInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dimensionInput: {
    flex: 1,
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    ...CARD_SHADOW,
  },
  dimensionSeparator: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  cropHint: {
    fontSize: 12,
    color: COLORS.GRAY[500],
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
})

export default UploadScreen