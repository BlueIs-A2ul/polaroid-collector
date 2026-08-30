import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { withOpacity } from '../../utils/colorUtils'
import AnimatedBottomSheet from '../common/AnimatedBottomSheet'

export interface ActionSheetOption {
  text: string
  icon: string
  onPress: () => void
  destructive?: boolean
}

interface ActionSheetModalProps {
  visible: boolean
  title?: string
  options: ActionSheetOption[]
  cancelText?: string
  onClose: () => void
}

const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  visible,
  title,
  options,
  cancelText = '取消',
  onClose,
}) => {
  const { colors } = useTheme()

  const styles = React.useMemo(() => StyleSheet.create({
    dragHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.GRAY[300],
      alignSelf: 'center',
      marginBottom: 12,
      marginTop: 4,
    },
    title: {
      fontSize: 14,
      color: colors.GRAY[500],
      textAlign: 'center',
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 4,
      backgroundColor: colors.WHITE,
      gap: 12,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: 16,
      color: colors.BLACK,
      fontWeight: '500',
      flex: 1,
    },
    optionTextDestructive: {
      color: colors.ERROR,
    },
    cancelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: colors.WHITE,
    },
    cancelText: {
      fontSize: 16,
      color: colors.GRAY[500],
      fontWeight: '600',
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 34,
    },
  }), [colors])

  return (
    <AnimatedBottomSheet
      visible={visible}
      onClose={onClose}
      showHeader={false}
    >
      <View style={styles.content}>
        <View style={styles.dragHandle} />

        {title ? <Text style={styles.title}>{title}</Text> : null}

        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionRow}
            onPress={() => {
              onClose()
              option.onPress()
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.optionIcon,
                { backgroundColor: option.destructive ? withOpacity(colors.ERROR, 0.08) : colors.SURFACE_HIGHLIGHT },
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={18}
                color={option.destructive ? colors.ERROR : colors.PRIMARY}
              />
            </View>
            <Text
              style={[
                styles.optionText,
                option.destructive && styles.optionTextDestructive,
              ]}
            >
              {option.text}
            </Text>
            <Ionicons name='chevron-forward' size={18} color={colors.GRAY[400]} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.cancelRow}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>{cancelText}</Text>
        </TouchableOpacity>
      </View>
    </AnimatedBottomSheet>
  )
}

export default ActionSheetModal
