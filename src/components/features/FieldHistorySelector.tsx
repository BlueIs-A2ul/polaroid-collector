import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { getFieldHistory, addFieldHistory, removeFieldHistory } from '../../services/fieldHistoryService'

interface FieldHistorySelectorProps {
  visible: boolean
  field: 'groupName' | 'city' | 'venue'
  title: string
  currentValue: string
  onClose: () => void
  onSelect: (value: string) => void
}

const FieldHistorySelector: React.FC<FieldHistorySelectorProps> = ({
  visible,
  field,
  title,
  currentValue,
  onClose,
  onSelect,
}) => {
  const { colors } = useTheme()
  const [history, setHistory] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [loading, setLoading] = useState(false)

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.WHITE,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[200],
    },
    customInput: {
      flex: 1,
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    submitButton: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: colors.GRAY[300],
    },
    submitButtonText: {
      color: colors.WHITE,
      fontSize: 14,
      fontWeight: 'bold',
    },
    historySection: {
      padding: 16,
    },
    historyTitle: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginBottom: 12,
    },
    historyList: {
      maxHeight: 300,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    historyItemSelected: {
      backgroundColor: `${colors.PRIMARY}15`,
      borderWidth: 1,
      borderColor: colors.PRIMARY,
    },
    historyItemText: {
      fontSize: 16,
      color: colors.BLACK,
      flex: 1,
    },
    historyItemTextSelected: {
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    removeButton: {
      padding: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.GRAY[500],
      marginTop: 12,
    },
    emptyHint: {
      fontSize: 12,
      color: colors.GRAY[400],
      marginTop: 4,
    },
  }), [colors])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    const { success, data } = await getFieldHistory(field)
    if (success && data) {
      setHistory(data)
    }
    setLoading(false)
  }, [field])

  useEffect(() => {
    if (visible) {
      loadHistory()
      setCustomInput('')
    }
  }, [visible, loadHistory])

  const handleSelect = async (value: string) => {
    await addFieldHistory(field, value)
    onSelect(value)
    onClose()
  }

  const handleCustomSubmit = async () => {
    if (customInput.trim()) {
      await handleSelect(customInput.trim())
    }
  }

  const handleRemove = async (value: string) => {
    await removeFieldHistory(field, value)
    setHistory(history.filter(item => item !== value))
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name='time-outline' size={48} color={colors.GRAY[300]} />
      <Text style={styles.emptyText}>暂无历史记录</Text>
      <Text style={styles.emptyHint}>输入后将自动保存</Text>
    </View>
  )

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.historyItem, item === currentValue && styles.historyItemSelected]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.historyItemText, item === currentValue && styles.historyItemTextSelected]}>
        {item}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <Ionicons name='close-circle' size={18} color={colors.GRAY[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={24} color={colors.BLACK} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder={`输入${title}`}
              value={customInput}
              onChangeText={setCustomInput}
            />
            <TouchableOpacity
              style={[styles.submitButton, customInput.trim() ? null : styles.submitButtonDisabled]}
              onPress={handleCustomSubmit}
              disabled={!customInput.trim()}
            >
              <Text style={styles.submitButtonText}>确定</Text>
            </TouchableOpacity>
          </View>

          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>历史记录</Text>
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item}
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {history.length === 0 && !loading && renderEmptyState()}
        </View>
      </View>
    </Modal>
  )
}

export default FieldHistorySelector