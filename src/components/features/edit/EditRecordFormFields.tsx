import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import OptionsSelector from '../../common/OptionsSelector'
import {
  POLAROID_TYPE_OPTIONS,
  MEMBER_COUNT_OPTIONS,
} from '../../../constants/polaroidOptions'
import { ResolvedColors } from '../../../types/theme'
import { createEditScreenStyles } from '../../../screens/editScreenStyles'

type FieldSelectorKey = 'groupName' | 'city' | 'venue'

interface EditRecordFormFieldsProps {
  idolName: string
  photoCount: string
  photoDate: string
  price: string
  note: string
  groupName: string
  city: string
  venue: string
  polaroidType: string
  memberCount: string
  showDatePicker: boolean
  selectedDate: Date
  colors: ResolvedColors
  styles: ReturnType<typeof createEditScreenStyles>
  onIdolNameChange: (value: string) => void
  onPhotoCountChange: (value: string) => void
  onPriceChange: (value: string) => void
  onNoteChange: (value: string) => void
  onPolaroidTypeChange: (value: string) => void
  onMemberCountChange: (value: string) => void
  onShowDatePicker: () => void
  onDateChange: (event: any, selectedDate?: Date) => void
  onOpenFieldSelector: (field: FieldSelectorKey) => void
}

const EditRecordFormFields: React.FC<EditRecordFormFieldsProps> = ({
  idolName,
  photoCount,
  photoDate,
  price,
  note,
  groupName,
  city,
  venue,
  polaroidType,
  memberCount,
  showDatePicker,
  selectedDate,
  colors,
  styles,
  onIdolNameChange,
  onPhotoCountChange,
  onPriceChange,
  onNoteChange,
  onPolaroidTypeChange,
  onMemberCountChange,
  onShowDatePicker,
  onDateChange,
  onOpenFieldSelector,
}) => (
  <>
    <View style={styles.formGroup}>
      <Text style={styles.label}>偶像名称</Text>
      <TextInput
        style={styles.input}
        placeholder='请输入偶像名称'
        value={idolName}
        onChangeText={onIdolNameChange}
      />
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.label}>拍立得数量</Text>
      <TextInput
        style={styles.input}
        placeholder='请输入拍立得数量'
        value={photoCount}
        onChangeText={onPhotoCountChange}
        keyboardType='number-pad'
      />
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.label}>拍摄日期</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={onShowDatePicker}
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
          onChange={onDateChange}
        />
      )}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.label}>花费（选填）</Text>
      <TextInput
        style={styles.input}
        placeholder='请输入花费金额'
        value={price}
        onChangeText={onPriceChange}
        keyboardType='decimal-pad'
      />
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.label}>备注（选填）</Text>
      <TextInput
        style={styles.noteInput}
        placeholder='添加备注信息'
        value={note}
        onChangeText={onNoteChange}
        multiline
        numberOfLines={3}
        textAlignVertical='top'
      />
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.sectionTitle}>扩展信息</Text>
      <View style={styles.extraFieldsContainer}>
        <View style={styles.extraFieldRow}>
          <View style={styles.extraFieldHalf}>
            <Text style={styles.extraFieldLabel}>团体</Text>
            <TouchableOpacity
              style={styles.extraFieldInputWrapper}
              onPress={() => onOpenFieldSelector('groupName')}
            >
              <Text
                style={[
                  styles.extraFieldInputText,
                  groupName ? null : styles.extraFieldPlaceholder,
                ]}
              >
                {groupName || '选填'}
              </Text>
              <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
            </TouchableOpacity>
          </View>
          <View style={styles.extraFieldHalf}>
            <Text style={styles.extraFieldLabel}>城市</Text>
            <TouchableOpacity
              style={styles.extraFieldInputWrapper}
              onPress={() => onOpenFieldSelector('city')}
            >
              <Text
                style={[
                  styles.extraFieldInputText,
                  city ? null : styles.extraFieldPlaceholder,
                ]}
              >
                {city || '选填'}
              </Text>
              <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.extraFieldRow}>
          <View style={styles.extraFieldHalf}>
            <OptionsSelector
              label='类型'
              value={polaroidType}
              options={POLAROID_TYPE_OPTIONS}
              placeholder='选填'
              onChange={onPolaroidTypeChange}
            />
          </View>
          <View style={styles.extraFieldHalf}>
            <OptionsSelector
              label='人数'
              value={memberCount}
              options={MEMBER_COUNT_OPTIONS}
              placeholder='选填'
              onChange={onMemberCountChange}
            />
          </View>
        </View>
        <View style={styles.extraFieldFull}>
          <Text style={styles.extraFieldLabel}>场馆</Text>
          <TouchableOpacity
            style={styles.extraFieldInputWrapper}
            onPress={() => onOpenFieldSelector('venue')}
          >
            <Text
              style={[
                styles.extraFieldInputText,
                venue ? null : styles.extraFieldPlaceholder,
              ]}
            >
              {venue || '选填'}
            </Text>
            <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </>
)

export default EditRecordFormFields
