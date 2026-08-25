import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native'
import AnimatedBottomSheet from '../../common/AnimatedBottomSheet'
import { ResolvedColors } from '../../../types/theme'
import { createEditScreenStyles } from '../../../screens/editScreenStyles'

interface EditCropOptionsSheetProps {
  visible: boolean
  allowCrop: boolean
  cropWidth: number
  cropHeight: number
  colors: ResolvedColors
  styles: ReturnType<typeof createEditScreenStyles>
  onClose: () => void
  onAllowCropChange: (value: boolean) => void
  onCropWidthChange: (value: number) => void
  onCropHeightChange: (value: number) => void
  onConfirm: () => void
}

const EditCropOptionsSheet: React.FC<EditCropOptionsSheetProps> = ({
  visible,
  allowCrop,
  cropWidth,
  cropHeight,
  colors,
  styles,
  onClose,
  onAllowCropChange,
  onCropWidthChange,
  onCropHeightChange,
  onConfirm,
}) => (
  <AnimatedBottomSheet
    visible={visible}
    onClose={onClose}
    title='裁切选项'
  >
    <View style={{ padding: 16 }}>
      <View style={styles.cropOption}>
        <Text style={styles.cropLabel}>启用裁切</Text>
        <Switch
          value={allowCrop}
          onValueChange={onAllowCropChange}
          trackColor={{
            false: colors.GRAY[300],
            true: colors.PRIMARY,
          }}
          thumbColor={colors.ON_PRIMARY}
        />
      </View>

      {allowCrop && (
        <View style={styles.cropDimensions}>
          <Text style={styles.cropLabel}>裁切尺寸比例</Text>
          <View style={styles.dimensionInputs}>
            <TextInput
              style={styles.dimensionInput}
              value={String(cropWidth)}
              onChangeText={text => onCropWidthChange(Number(text) || 1)}
              keyboardType='number-pad'
              placeholder='宽'
            />
            <Text style={styles.dimensionSeparator}>:</Text>
            <TextInput
              style={styles.dimensionInput}
              value={String(cropHeight)}
              onChangeText={text => onCropHeightChange(Number(text) || 1)}
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
        onPress={onConfirm}
      >
        <Text style={styles.confirmButtonText}>确定</Text>
      </TouchableOpacity>
    </View>
  </AnimatedBottomSheet>
)

export default EditCropOptionsSheet
