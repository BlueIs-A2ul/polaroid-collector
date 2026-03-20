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
import { pickPhoto } from '../services/photoService'
import { createRecord } from '../services/recordService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdolSelector from '../components/features/IdolSelector'

type UploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Upload'
>
type UploadScreenRouteProp = RouteProp<RootStackParamList, 'Upload'>

interface UploadScreenProps {
  navigation: UploadScreenNavigationProp
  route: UploadScreenRouteProp
}

/**
 * 上传页面
 * 用于上传新的拍立得记录
 */
const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const [idolName, setIdolName] = useState<string>('')
  const [photoCount, setPhotoCount] = useState<string>('')
  const [photoDate, setPhotoDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showIdolSelector, setShowIdolSelector] = useState<boolean>(false)
  const [showCropOptions, setShowCropOptions] = useState<boolean>(false)
  const [allowCrop, setAllowCrop] = useState<boolean>(false)
  const [cropWidth, setCropWidth] = useState<number>(4)
  const [cropHeight, setCropHeight] = useState<number>(3)
  const [pendingSource, setPendingSource] = useState<'camera' | 'library'>(
    'library',
  )

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 解析日期字符串为 Date 对象
   */
  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  /**
   * 处理日期选择
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setSelectedDate(selectedDate)
      setPhotoDate(formatDateToString(selectedDate))
    }
  }

  /**
   * 显示日期选择器
   */
  const showDatePickerModal = () => {
    setSelectedDate(parseDateFromString(photoDate))
    setShowDatePicker(true)
  }

  /**
   * 显示裁切选项
   */
  const handleShowCropOptions = (source: 'camera' | 'library') => {
    setPendingSource(source)
    setShowCropOptions(true)
  }

  /**
   * 确认裁切选项并选择照片
   */
  const handleConfirmCropOptions = async () => {
    setShowCropOptions(false)
    const { success, data, error } = await pickPhoto(pendingSource, {
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success) {
      setPhotoUri(data)
    } else {
      Alert.alert('错误', error || '选择照片失败')
    }
  }

  /**
   * 选择照片（显示裁切选项）
   */
  const handlePickPhoto = (source: 'camera' | 'library') => {
    handleShowCropOptions(source)
  }

  /**
   * 打开偶像选择器
   */
  const handleOpenIdolSelector = () => {
    setShowIdolSelector(true)
  }

  /**
   * 选择偶像
   */
  const handleSelectIdol = (selectedIdolName: string) => {
    setIdolName(selectedIdolName)
  }

  /**
   * 验证表单
   */
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

    if (!photoUri) {
      Alert.alert('提示', '请选择或拍摄照片')
      return false
    }

    return true
  }

  /**
   * 保存记录
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    const { success, error: err } = await createRecord({
      idolName: idolName.trim(),
      photoCount: parseInt(photoCount),
      photoDate,
      photoUri: photoUri!,
    })

    setLoading(false)

    if (success) {
      Alert.alert('成功', '拍立得记录已保存', [
        { text: '确定', onPress: () => navigation.goBack() },
      ])
    } else {
      Alert.alert('错误', err || '保存失败')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <ScrollView style={styles.container}>
      {/* 头部 */}
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

      {/* 表单 */}
      <View style={styles.form}>
        {/* 偶像名称 */}
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

        {/* 拍立得数量 */}
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

        {/* 拍摄日期 */}
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

        {/* 照片选择 */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>照片</Text>
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name='close-circle' size={24} color={COLORS.ERROR} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handlePickPhoto('camera')}
              >
                <Ionicons name='camera' size={32} color={COLORS.PRIMARY} />
                <Text style={styles.photoButtonText}>拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => handlePickPhoto('library')}
              >
                <Ionicons name='images' size={32} color={COLORS.PRIMARY} />
                <Text style={styles.photoButtonText}>相册</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 保存按钮 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name='checkmark' size={24} color={COLORS.WHITE} />
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* 偶像选择器 */}
      <IdolSelector
        visible={showIdolSelector}
        onClose={() => setShowIdolSelector(false)}
        onSelectIdol={handleSelectIdol}
        currentIdolName={idolName}
      />

      {/* 裁切选项弹窗 */}
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
              {/* 是否裁切 */}
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

              {/* 裁切尺寸 */}
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

              {/* 确认按钮 */}
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
    justifyContent: 'space-around',
  },
  photoButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
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
  photoPreviewContainer: {
    position: 'relative',
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
