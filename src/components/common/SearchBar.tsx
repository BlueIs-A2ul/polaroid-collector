import React, { useMemo } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = '搜索偶像...',
}) => {
  const { colors } = useTheme()

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
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.BLACK,
    },
  }), [colors])

  return (
    <View style={styles.container}>
      <Ionicons name='search' size={20} color={colors.GRAY[400]} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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
  )
}

export default SearchBar