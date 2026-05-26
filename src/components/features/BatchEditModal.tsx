import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'
import AnimatedBottomSheet from '../common/AnimatedBottomSheet'
import FieldHistorySelector from './FieldHistorySelector'

interface BatchEditModalProps {
  visible: boolean
  selectedCount: number
  batchEditField: 'groupName' | 'city' | 'venue'
  batchEditValue: string
  onFieldChange: (field: 'groupName' | 'city' | 'venue') => void
  onValueChange: (value: string) => void
  onApply: () => void
  onClose: () => void
}

const BatchEditModal: React.FC<BatchEditModalProps> = ({
  visible,
  selectedCount,
  batchEditField,
  batchEditValue,
  onFieldChange,
  onValueChange,
  onApply,
  onClose,
}) => {
  const { colors } = useTheme()
  const [showFieldHistory, setShowFieldHistory] = React.useState(false)

  const styles = React.useMemo(() => StyleSheet.create({
    hint: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    fieldSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    fieldOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.WHITE,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    fieldOptionActive: {
      backgroundColor: colors.PRIMARY,
      borderColor: colors.PRIMARY,
    },
    fieldOptionText: {
      fontSize: 14,
      color: colors.BLACK,
    },
    fieldOptionTextActive: {
      color: colors.WHITE,
      fontWeight: '500',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.GRAY[300],
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.BLACK,
      backgroundColor: colors.WHITE,
    },
    historyButton: {
      padding: 10,
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    applyButton: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 16,
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
  }), [colors])

  const fieldLabels = {
    groupName: '团体',
    city: '城市',
    venue: '场馆',
  }

  return (
    <>
      <AnimatedBottomSheet
        visible={visible}
        onClose={onClose}
        title='批量修改字段'
      >
        <View style={{ paddingVertical: 16 }}>
          <Text style={styles.hint}>
            将修改 {selectedCount} 个偶像的所有记录
          </Text>
          <View style={styles.fieldSelector}>
            {(['groupName', 'city', 'venue'] as const).map(field => (
              <TouchableOpacity
                key={field}
                style={[
                  styles.fieldOption,
                  batchEditField === field && styles.fieldOptionActive,
                ]}
                onPress={() => onFieldChange(field)}
              >
                <Text
                  style={[
                    styles.fieldOptionText,
                    batchEditField === field && styles.fieldOptionTextActive,
                  ]}
                >
                  {fieldLabels[field]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={batchEditValue}
              onChangeText={onValueChange}
              placeholder='输入新的值...'
              placeholderTextColor={colors.GRAY[400]}
            />
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowFieldHistory(true)}
            >
              <Ionicons name='time-outline' size={20} color={colors.PRIMARY} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onApply}
          >
            <Text style={styles.applyButtonText}>应用修改</Text>
          </TouchableOpacity>
        </View>
      </AnimatedBottomSheet>

      <FieldHistorySelector
        visible={showFieldHistory}
        field={batchEditField}
        title={fieldLabels[batchEditField]}
        currentValue={batchEditValue}
        onSelect={(value) => {
          onValueChange(value)
          setShowFieldHistory(false)
        }}
        onClose={() => setShowFieldHistory(false)}
      />
    </>
  )
}

export default BatchEditModal
