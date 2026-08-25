import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface BatchActionBarProps {
  visible: boolean
  onEdit: () => void
  onDelete: () => void
}

const BatchActionBar: React.FC<BatchActionBarProps> = ({
  visible,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    batchActionBar: {
      flexDirection: 'row',
      backgroundColor: colors.PRIMARY,
      padding: 16,
      paddingBottom: 24,
      gap: 16,
    },
    batchActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.PRIMARY,
      borderRadius: 8,
      paddingVertical: 12,
      gap: 8,
    },
    deleteButton: {
      backgroundColor: colors.ERROR,
    },
    batchActionText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.ON_PRIMARY,
    },
  }), [colors])

  if (!visible) return null

  return (
    <View style={styles.batchActionBar}>
      <TouchableOpacity
        style={styles.batchActionButton}
        onPress={onEdit}
      >
        <Ionicons name='create-outline' size={20} color={colors.ON_PRIMARY} />
        <Text style={styles.batchActionText}>修改</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.batchActionButton, styles.deleteButton]}
        onPress={onDelete}
      >
        <Ionicons name='trash-outline' size={20} color={colors.ON_PRIMARY} />
        <Text style={styles.batchActionText}>删除</Text>
      </TouchableOpacity>
    </View>
  )
}

export default BatchActionBar