import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '../../contexts/ThemeContext'
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
  const [modalVisible, setModalVisible] = useState(false)
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  const styles = React.useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.OVERLAY,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    content: {
      backgroundColor: colors.SECONDARY,
      borderRadius: 12,
      width: '100%',
      maxWidth: 400,
      overflow: 'hidden',
      shadowColor: colors.PRIMARY,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.BORDER,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.BLACK,
      letterSpacing: -0.3,
    },
    body: {
      padding: 16,
    },
    date: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 16,
      textAlign: 'center',
    },
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.BLACK,
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 12,
    },
    inputText: {
      fontSize: 15,
      color: colors.BLACK,
      flex: 1,
    },
    placeholder: {
      color: colors.GRAY[400],
    },
    count: {
      fontSize: 12,
      color: colors.GRAY[500],
      textAlign: 'center',
      marginBottom: 16,
    },
    dateChangeSection: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.BORDER,
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
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 12,
    },
    dateText: {
      fontSize: 15,
      color: colors.BLACK,
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
    buttons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.GRAY[200],
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 15,
      color: colors.GRAY[700],
      fontWeight: '500',
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    saveText: {
      fontSize: 15,
      color: colors.ON_PRIMARY,
      fontWeight: 'bold',
    },
    accentStrip: {
      height: 4,
      backgroundColor: colors.PRIMARY,
    },
  }), [colors])

  useEffect(() => {
    if (batchEdit.visible && !modalVisible) {
      setModalVisible(true)
      scale.setValue(0.85)
      opacity.setValue(0)
      overlayOpacity.setValue(0)
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            tension: 280,
            friction: 16,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      })
    } else if (!batchEdit.visible && modalVisible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false)
      })
    }
  }, [batchEdit.visible, modalVisible])

  const fieldLabels = {
    groupName: '团体',
    city: '城市',
    venue: '场馆',
  }

  const getCurrentValue = (field: 'groupName' | 'city' | 'venue'): string => {
    return batchEdit[field]
  }

  if (!modalVisible) return null

  const inner = (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>批量编辑</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name='close' size={24} color={colors.BLACK} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>
          {formatDate(batchEdit.date)}
        </Text>

        {(['groupName', 'city', 'venue'] as const).map(field => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{fieldLabels[field]}</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => onShowFieldSelector(field)}
            >
              <Text style={[styles.inputText, batchEdit[field] ? null : styles.placeholder]}>
                {batchEdit[field] || '选填'}
              </Text>
              <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.count}>
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
              style={[styles.dateDisplay, { backgroundColor: colors.SURFACE_HIGHLIGHT }]}
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

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.accentStrip} />
    </View>
  )

  return (
    <>
      <Modal
        visible={modalVisible}
        transparent
        animationType='none'
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
              style={{
                transform: [{ scale }],
                opacity,
                width: '100%',
                maxWidth: 400,
              }}
            >
              <Pressable onPress={() => {}}>
                {inner}
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
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
