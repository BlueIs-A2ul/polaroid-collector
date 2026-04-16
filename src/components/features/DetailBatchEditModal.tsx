import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
import FieldHistorySelector from './FieldHistorySelector'
import { formatDate } from '../../utils/rankingUtils'

interface BatchEditState {
  visible: boolean
  date: string
  newDate: string
  recordIds: string[]
  groupName: string
  city: string
  venue: string
}

interface DetailBatchEditModalProps {
  batchEdit: BatchEditState
  saving: boolean
  onClose: () => void
  onSave: () => void
  onFieldChange: (field: 'groupName' | 'city' | 'venue', value: string) => void
  onDateChange: (date: string) => void
  onShowFieldSelector: (field: 'groupName' | 'city' | 'venue') => void
  showFieldSelector: 'groupName' | 'city' | 'venue' | null
  onHideFieldSelector: () => void
  showDatePicker: boolean
  onShowDatePicker: () => void
  onHideDatePicker: () => void
}

const DetailBatchEditModal: React.FC<DetailBatchEditModalProps> = ({
  batchEdit,
  saving,
  onClose,
  onSave,
  onFieldChange,
  onDateChange,
  onShowFieldSelector,
  showFieldSelector,
  onHideFieldSelector,
  showDatePicker,
  onShowDatePicker,
  onHideDatePicker,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    batchEditModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    batchEditContent: {
      backgroundColor: colors.WHITE,
      borderRadius: 16,
      width: '90%',
      maxWidth: 400,
      ...CARD_SHADOW,
    },
    batchEditHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    batchEditTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    batchEditBody: {
      padding: 16,
    },
    batchEditDate: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 16,
      textAlign: 'center',
    },
    batchEditField: {
      marginBottom: 16,
    },
    batchEditLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.BLACK,
      marginBottom: 6,
    },
    batchEditInputWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      padding: 12,
    },
    batchEditInputText: {
      fontSize: 15,
      color: colors.BLACK,
      flex: 1,
    },
    batchEditPlaceholder: {
      color: colors.GRAY[400],
    },
    batchEditCount: {
      fontSize: 12,
      color: colors.GRAY[500],
      textAlign: 'center',
      marginBottom: 16,
    },
    dateChangeSection: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.GRAY[200],
    },
    dateChangeLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.BLACK,
      marginBottom: 6,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateDisplay: {
      flex: 1,
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      padding: 12,
    },
    dateText: {
      fontSize: 15,
      color: colors.BLACK,
    },
    dateArrow: {
      padding: 8,
    },
    datePickerWrapper: {
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      marginTop: 8,
    },
    dateChangeHint: {
      fontSize: 12,
      color: colors.GRAY[500],
      marginTop: 8,
      textAlign: 'center',
    },
    batchEditButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    batchEditCancelButton: {
      flex: 1,
      backgroundColor: colors.GRAY[200],
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    batchEditCancelText: {
      fontSize: 15,
      color: colors.GRAY[700],
      fontWeight: '500',
    },
    batchEditSaveButton: {
      flex: 1,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    batchEditSaveText: {
      fontSize: 15,
      color: colors.WHITE,
      fontWeight: 'bold',
    },
  }), [colors])

  const fieldLabels = {
    groupName: '团体',
    city: '城市',
    venue: '场馆',
  }

  const getCurrentValue = (field: 'groupName' | 'city' | 'venue'): string => {
    return batchEdit[field]
  }

  return (
    <>
      <Modal
        visible={batchEdit.visible}
        transparent={true}
        animationType='slide'
        onRequestClose={onClose}
      >
        <View style={styles.batchEditModal}>
          <View style={styles.batchEditContent}>
            <View style={styles.batchEditHeader}>
              <Text style={styles.batchEditTitle}>批量编辑</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.batchEditBody}>
              <Text style={styles.batchEditDate}>
                {formatDate(batchEdit.date)}
              </Text>

              {(['groupName', 'city', 'venue'] as const).map(field => (
                <View key={field} style={styles.batchEditField}>
                  <Text style={styles.batchEditLabel}>{fieldLabels[field]}</Text>
                  <TouchableOpacity
                    style={styles.batchEditInputWrapper}
                    onPress={() => onShowFieldSelector(field)}
                  >
                    <Text style={[styles.batchEditInputText, batchEdit[field] ? null : styles.batchEditPlaceholder]}>
                      {batchEdit[field] || '选填'}
                    </Text>
                    <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.batchEditCount}>
                将同时更新 {batchEdit.recordIds.length} 条记录
              </Text>

              <View style={styles.dateChangeSection}>
                <Text style={styles.dateChangeLabel}>修改日期（可选）</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateDisplay}>
                    <Text style={styles.dateText}>{formatDate(batchEdit.date)}</Text>
                  </View>
                  <Ionicons name='arrow-forward' size={20} color={colors.GRAY[400]} />
                  <TouchableOpacity
                    style={[styles.dateDisplay, { backgroundColor: `${colors.PRIMARY}15` }]}
                    onPress={onShowDatePicker}
                  >
                    <Text style={[styles.dateText, { color: colors.PRIMARY }]}>
                      {formatDate(batchEdit.newDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showDatePicker && (
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={new Date(batchEdit.newDate)}
                      mode='date'
                      display='default'
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          onHideDatePicker()
                        }
                        if (selectedDate) {
                          const year = selectedDate.getFullYear()
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                          const day = String(selectedDate.getDate()).padStart(2, '0')
                          onDateChange(`${year}-${month}-${day}`)
                        }
                      }}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={{ alignItems: 'center', padding: 8 }}
                        onPress={onHideDatePicker}
                      >
                        <Text style={{ color: colors.PRIMARY, fontWeight: '500' }}>完成</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {batchEdit.date !== batchEdit.newDate && (
                  <Text style={styles.dateChangeHint}>
                    保存后，这些记录将移动到 {formatDate(batchEdit.newDate)}
                  </Text>
                )}
              </View>

              <View style={styles.batchEditButtons}>
                <TouchableOpacity
                  style={styles.batchEditCancelButton}
                  onPress={onClose}
                  disabled={saving}
                >
                  <Text style={styles.batchEditCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.batchEditSaveButton}
                  onPress={onSave}
                  disabled={saving}
                >
                  <Text style={styles.batchEditSaveText}>
                    {saving ? '保存中...' : '保存'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <FieldHistorySelector
        visible={showFieldSelector !== null}
        field={showFieldSelector || 'groupName'}
        title={showFieldSelector ? fieldLabels[showFieldSelector] : '团体'}
        currentValue={showFieldSelector ? getCurrentValue(showFieldSelector) : ''}
        onClose={onHideFieldSelector}
        onSelect={(value) => {
          if (showFieldSelector) {
            onFieldChange(showFieldSelector, value)
          }
          onHideFieldSelector()
        }}
      />
    </>
  )
}

export default DetailBatchEditModal
export type { BatchEditState }