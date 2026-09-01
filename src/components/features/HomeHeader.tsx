import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { HEADER_PADDING_TOP } from '../../constants/themes'

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
      paddingTop: HEADER_PADDING_TOP,
      backgroundColor: colors.PRIMARY,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.ON_PRIMARY,
    },
    selectAllText: {
      fontSize: 14,
      color: colors.ON_PRIMARY,
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
        <TouchableOpacity onPress={onExitSelection} style={styles.iconButton} accessibilityLabel='退出选择模式'>
          <Ionicons name='close' size={24} color={colors.ON_PRIMARY} />
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
          accessibilityLabel='导出数据'
        >
          <Ionicons name='download-outline' size={24} color={colors.ON_PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onShowMoreOptions} accessibilityLabel='更多选项'>
          <Ionicons name='settings-outline' size={24} color={colors.ON_PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onNavigateToUpload}
          accessibilityLabel='添加记录'
        >
          <Ionicons name='add' size={24} color={colors.ON_PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HomeHeader