import React, { useState, useEffect } from 'react'
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
import { pickPhoto } from '../services/photoService'
import { getRecordById } from '../services/storageService'
import { updateRecordData, deleteRecordData } from '../services/recordService'
import LoadingSpinner from '../components/common/LoadingSpinner'

type EditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Edit'>
type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>

interface EditScreenProps {
  navigation: EditScreenNavigationProp
  route: EditScreenRouteProp
}

const EditScreen: React.FC<EditScreenProps> = ({ route, navigation }) => {
  const { recordId } = route.params
  const [idolName, setIdolName] = useState<string>('')
  const [photoCount, setPhotoCount] = useState<string>('')
  const [photoDate, setPhotoDate] = useState<string>('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null)
  const [price, setPrice] = useState<string>('')
  const [originalPhotoUri, setOriginalPhotoUri] = useState<string | null>(null)
  const [originalBackPhotoUri, setOriginalBackPhotoUri] = useState<string | null>(null)
  const [originalIdolName, setOriginalIdolName] = useState<string>('')
  const [originalPhotoCount, setOriginalPhotoCount] = useState<string>('')
  const [originalPhotoDate, setOriginalPhotoDate] = useState<string>('')
  const [originalPrice, setOriginalPrice] = useState<string>('')
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
        setPhotoUri(data)
      } else {
        setBackPhotoUri(data)
      }
    } else if (error !== '用户取消选择') {
      Alert.alert('错误', error || '选择照片失败')
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
      setOriginalPhotoUri(data.photoUri)
      setOriginalBackPhotoUri(data.backPhotoUri || null)
      setOriginalIdolName(data.idolName)
      setOriginalPhotoCount(data.photoCount.toString())
      setOriginalPhotoDate(data.photoDate)
      setOriginalPrice(data.price ? String(data.price) : '')
      setLoading(false)
    } else {
      setLoading(false)
      Alert.alert('错误', error || '加载记录失败', [
        { text: '确定', onPress: () => navigation.goBack() },
      ])
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
      setBackPhotoUri(data)
    } else if (error !== '用户取消选择') {
      Alert.alert('错误', error || '选择背签照片失败')
    }
  }

  const handleRemoveBackPhoto = () => {
    Alert.alert('删除背签', '确定要删除背签照片吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => setBackPhotoUri(null),
      },
    ])
  }

  const validateForm = (): boolean => {
    if (!idolName.trim()) {
      Alert.alert('提示', '请输入偶像名称')
      return false
    }

    if (!photoCount || parseInt(photoCount) <= 0) {
      Alert.alert('提示', '请输入有效的拍立得数量')
      return false
    }

    if (!photoDate) {
      Alert.alert('提示', '请选择拍摄日期')
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

    const { success, error: err } = await updateRecordData(recordId, updateData)

    setSaving(false)

    if (success) {
      Alert.alert('成功', '记录已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ])
    } else {
      Alert.alert('错误', err || '更新失败')
    }
  }

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这条记录吗？此操作无法撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setSaving(true)
          const { success, error: err } = await deleteRecordData(recordId)
          setSaving(false)

          if (success) {
            Alert.alert('成功', '记录已删除', [
              { text: '确定', onPress: () => navigation.goBack() },
            ])
          } else {
            Alert.alert('错误', err || '删除失败')
          }
        },
      },
    ])
  }

  const handleCancel = () => {
    const hasChanges =
      idolName !== originalIdolName ||
      photoCount !== originalPhotoCount ||
      photoDate !== originalPhotoDate ||
      photoUri !== originalPhotoUri ||
      backPhotoUri !== originalBackPhotoUri ||
      price !== originalPrice

    if (hasChanges) {
      Alert.alert('放弃修改', '确定要放弃所有修改吗？', [
        { text: '继续编辑', style: 'cancel' },
        {
          text: '放弃',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ])
    } else {
      navigation.goBack()
    }
  }

  const handleRemovePhoto = () => {
    Alert.alert('删除照片', '确定要删除当前照片吗？删除后需要重新选择。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => setPhotoUri(null),
      },
    ])
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (saving) {
    return <LoadingSpinner />
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name='arrow-back' size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>编辑拍立得</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name='trash' size={24} color={COLORS.ERROR} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>偶像名称</Text>
          <TextInput
            style={styles.input}
            placeholder='请输入偶像名称'
            value={idolName}
            onChangeText={setIdolName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>拍立得数量</Text>
          <TextInput
            style={styles.input}
            placeholder='请输入拍立得数量'
            value={photoCount}
            onChangeText={setPhotoCount}
            keyboardType='number-pad'
          />
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
          <Text style={styles.label}>花费（选填）</Text>
          <TextInput
            style={styles.input}
            placeholder='请输入花费金额'
            value={price}
            onChangeText={setPrice}
            keyboardType='decimal-pad'
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>正面照片</Text>
          {photoUri ? (
            <>
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                >
                  <Ionicons
                    name='close-circle'
                    size={24}
                    color={COLORS.ERROR}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => handlePickPhoto('camera', 'front')}
                >
                  <Ionicons name='camera' size={28} color={COLORS.PRIMARY} />
                  <Text style={styles.photoButtonText}>拍照</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => handlePickPhoto('library', 'front')}
                >
                  <Ionicons name='images' size={28} color={COLORS.PRIMARY} />
                  <Text style={styles.photoButtonText}>相册</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handlePickPhoto('camera', 'front')}
              >
                <Ionicons name='camera' size={28} color={COLORS.PRIMARY} />
                <Text style={styles.photoButtonText}>拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handlePickPhoto('library', 'front')}
              >
                <Ionicons name='images' size={28} color={COLORS.PRIMARY} />
                <Text style={styles.photoButtonText}>相册</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.backPhotoHeader}>
            <Text style={styles.label}>背签照片</Text>
            {backPhotoUri && (
              <View style={styles.hasBackTag}>
                <Ionicons name='checkmark-circle' size={14} color={COLORS.SUCCESS} />
                <Text style={styles.hasBackText}>已添加</Text>
              </View>
            )}
          </View>
          {backPhotoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: backPhotoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={handleRemoveBackPhoto}
              >
                <Ionicons
                  name='close-circle'
                  size={24}
                  color={COLORS.ERROR}
                />
              </TouchableOpacity>
              <View style={styles.backPhotoLabel}>
                <Ionicons name='document-text' size={14} color={COLORS.WHITE} />
                <Text style={styles.backPhotoLabelText}>背签</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.backPhotoButtons}>
            {backPhotoUri ? (
              <TouchableOpacity
                style={styles.changeBackPhotoButton}
                onPress={handlePickBackPhoto}
              >
                <Ionicons name='sync' size={18} color={COLORS.PRIMARY} />
                <Text style={styles.changeBackPhotoText}>更换背签</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addBackPhotoButton}
                onPress={handlePickBackPhoto}
              >
                <Ionicons name='add-circle-outline' size={18} color={COLORS.PRIMARY} />
                <Text style={styles.addBackPhotoText}>添加背签照片</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={COLORS.WHITE} />
          <Text style={styles.saveButtonText}>保存修改</Text>
        </TouchableOpacity>
      </View>

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
  deleteButton: {
    padding: 8,
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
  backPhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hasBackTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: `${COLORS.SUCCESS}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hasBackText: {
    fontSize: 12,
    color: COLORS.SUCCESS,
    marginLeft: 4,
  },
  photoPreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 4,
  },
  backPhotoLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  backPhotoLabelText: {
    fontSize: 12,
    color: COLORS.WHITE,
    marginLeft: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    ...CARD_SHADOW,
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  backPhotoButtons: {
    alignItems: 'center',
  },
  addBackPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.PRIMARY}10`,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
  },
  addBackPhotoText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: 8,
  },
  changeBackPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...CARD_SHADOW,
  },
  changeBackPhotoText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: 8,
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

export default EditScreen