import React, { useMemo, useState } from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity, Modal, Text, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

export type SearchType = 'idolName' | 'groupName' | 'city' | 'venue'

interface SearchTypeOption {
  type: SearchType
  label: string
  icon: string
}

const SEARCH_TYPES: SearchTypeOption[] = [
  { type: 'idolName', label: '偶像', icon: 'person' },
  { type: 'groupName', label: '团体', icon: 'people' },
  { type: 'city', label: '城市', icon: 'location' },
  { type: 'venue', label: '场馆', icon: 'business' },
]

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  searchType: SearchType
  onSearchTypeChange: (type: SearchType) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  searchType,
  onSearchTypeChange,
}) => {
  const { colors } = useTheme()
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const currentType = SEARCH_TYPES.find(t => t.type === searchType) || SEARCH_TYPES[0]

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 16,
      marginVertical: 8,
      gap: 8,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.PRIMARY + '20',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
    },
    typeButtonText: {
      fontSize: 13,
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.BLACK,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.WHITE,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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
    typeList: {
      padding: 16,
    },
    typeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.GRAY[100],
      gap: 12,
    },
    typeOptionActive: {
      backgroundColor: colors.PRIMARY + '20',
    },
    typeOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.PRIMARY + '30',
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeOptionText: {
      fontSize: 16,
      color: colors.BLACK,
      fontWeight: '500',
    },
    typeOptionTextActive: {
      color: colors.PRIMARY,
    },
    checkIcon: {
      marginLeft: 'auto',
    },
  }), [colors])

  const handleSelectType = (type: SearchType) => {
    onSearchTypeChange(type)
    setShowTypeSelector(false)
    onChangeText('')
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.typeButton}
          onPress={() => setShowTypeSelector(true)}
        >
          <Ionicons name={currentType.icon as any} size={16} color={colors.PRIMARY} />
          <Text style={styles.typeButtonText}>{currentType.label}</Text>
          <Ionicons name='chevron-down' size={14} color={colors.PRIMARY} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `搜索${currentType.label}...`}
          placeholderTextColor={colors.GRAY[400]}
        />
        {value.length > 0 && (
          <Ionicons
            name='close-circle'
            size={20}
            color={colors.GRAY[400]}
            onPress={() => onChangeText('')}
          />
        )}
      </View>

      <Modal
        visible={showTypeSelector}
        transparent
        animationType='slide'
        onRequestClose={() => setShowTypeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择搜索类型</Text>
              <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                <Ionicons name='close' size={24} color={colors.BLACK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.typeList}>
              {SEARCH_TYPES.map(typeOption => (
                <TouchableOpacity
                  key={typeOption.type}
                  style={[
                    styles.typeOption,
                    searchType === typeOption.type && styles.typeOptionActive,
                  ]}
                  onPress={() => handleSelectType(typeOption.type)}
                >
                  <View style={styles.typeOptionIcon}>
                    <Ionicons name={typeOption.icon as any} size={20} color={colors.PRIMARY} />
                  </View>
                  <Text
                    style={[
                      styles.typeOptionText,
                      searchType === typeOption.type && styles.typeOptionTextActive,
                    ]}
                  >
                    {typeOption.label}
                  </Text>
                  {searchType === typeOption.type && (
                    <Ionicons
                      name='checkmark'
                      size={20}
                      color={colors.PRIMARY}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default SearchBar