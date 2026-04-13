import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface HomeHeaderProps {
  selectionMode: boolean
  selectedCount: number
  onExitSelection: () => void
  onSelectAll: () => void
  onShowExportOptions: () => void
  onShowMoreOptions: () => void
  onNavigateToUpload: () => void
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectionMode,
  selectedCount,
  onExitSelection,
  onSelectAll,
  onShowExportOptions,
  onShowMoreOptions,
  onNavigateToUpload,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 40,
      backgroundColor: colors.PRIMARY,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    selectAllText: {
      fontSize: 14,
      color: colors.WHITE,
      fontWeight: '500',
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    iconButton: {
      padding: 8,
    },
    addButton: {
      padding: 8,
    },
  }), [colors])

  if (selectionMode) {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={onExitSelection} style={styles.iconButton}>
          <Ionicons name='close' size={24} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>已选择 {selectedCount} 个</Text>
        <TouchableOpacity onPress={onSelectAll} style={styles.iconButton}>
          <Text style={styles.selectAllText}>全选</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      <Text style={styles.title}>我的拍立得收藏</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onShowExportOptions}
        >
          <Ionicons name='download-outline' size={24} color={colors.WHITE} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onShowMoreOptions}>
          <Ionicons name='settings-outline' size={24} color={colors.WHITE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onNavigateToUpload}
        >
          <Ionicons name='add' size={24} color={colors.WHITE} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HomeHeader