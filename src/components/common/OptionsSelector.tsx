import React, { useState, useMemo } from 'react'
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
import { useTheme } from '../../contexts/ThemeContext'

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
  const { colors } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    label: {
      fontSize: 13,
      color: colors.GRAY[600],
      marginBottom: 4,
    },
    selector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.GRAY[100],
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    selectorFilled: {
      backgroundColor: colors.WHITE,
      borderWidth: 1,
      borderColor: colors.PRIMARY,
    },
    selectorText: {
      fontSize: 14,
      color: colors.BLACK,
    },
    placeholder: {
      color: colors.GRAY[400],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.WHITE,
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
      borderBottomColor: colors.GRAY[200],
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
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
      backgroundColor: colors.WHITE,
      borderWidth: 1,
      borderColor: colors.GRAY[200],
    },
    optionSelected: {
      backgroundColor: `${colors.PRIMARY}15`,
    },
    optionText: {
      fontSize: 16,
      color: colors.BLACK,
    },
    optionTextSelected: {
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    customInputContainer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.GRAY[200],
      gap: 12,
    },
    customInput: {
      flex: 1,
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
    customSubmitButton: {
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    customSubmitButtonDisabled: {
      backgroundColor: colors.GRAY[300],
    },
    customSubmitText: {
      color: colors.WHITE,
      fontSize: 14,
      fontWeight: 'bold',
    },
  }), [colors])

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
        <Ionicons name='chevron-down' size={18} color={colors.GRAY[500]} />
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
                <Ionicons name='close' size={24} color={colors.BLACK} />
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
                    <Ionicons name='checkmark' size={18} color={colors.PRIMARY} />
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

export default OptionsSelector