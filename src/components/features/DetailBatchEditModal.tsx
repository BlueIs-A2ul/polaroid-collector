import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
import FieldHistorySelector from './FieldHistorySelector'
import { formatDate } from '../../utils/rankingUtils'

interface BatchEditState {
  visible: boolean
  date: string
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
  onShowFieldSelector: (field: 'groupName' | 'city' | 'venue') => void
  showFieldSelector: 'groupName' | 'city' | 'venue' | null
  onHideFieldSelector: () => void
}

const DetailBatchEditModal: React.FC<DetailBatchEditModalProps> = ({
  batchEdit,
  saving,
  onClose,
  onSave,
  onFieldChange,
  onShowFieldSelector,
  showFieldSelector,
  onHideFieldSelector,
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