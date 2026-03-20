import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/themeColors'

interface OptionsSelectorProps {
  label: string
  value: string
  options: readonly string[]
  placeholder?: string
  onChange: (value: string) => void
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  label,
  value,
  options,
  placeholder = '请选择',
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const handleSelectOption = (option: string) => {
    if (option === '自定义') {
      setCustomInput('')
    } else {
      onChange(option)
      setModalVisible(false)
    }
  }

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onChange(customInput.trim())
      setModalVisible(false)
    }
  }

  const displayValue = value || placeholder

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selector, value ? styles.selectorFilled : null]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, value ? null : styles.placeholder]}>
          {displayValue}
        </Text>
        <Ionicons name='chevron-down' size={18} color={COLORS.GRAY[500]} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name='close' size={24} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    value === option ? styles.optionSelected : null,
                  ]}
                  onPress={() => handleSelectOption(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option ? styles.optionTextSelected : null,
                    ]}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name='checkmark' size={18} color={COLORS.PRIMARY} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {options.includes('自定义') && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder='输入自定义内容'
                  value={customInput}
                  onChangeText={setCustomInput}
                />
                <TouchableOpacity
                  style={[
                    styles.customSubmitButton,
                    customInput.trim() ? null : styles.customSubmitButtonDisabled,
                  ]}
                  onPress={handleCustomSubmit}
                  disabled={!customInput.trim()}
                >
                  <Text style={styles.customSubmitText}>确定</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.GRAY[600],
    marginBottom: 4,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectorFilled: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  placeholder: {
    color: COLORS.GRAY[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
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
  optionsContainer: {
    padding: 16,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY[200],
  },
  optionSelected: {
    backgroundColor: `${COLORS.PRIMARY}15`,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  optionTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  customInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY[200],
    gap: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  customSubmitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  customSubmitButtonDisabled: {
    backgroundColor: COLORS.GRAY[300],
  },
  customSubmitText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
})

export default OptionsSelector