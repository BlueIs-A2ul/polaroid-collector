import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message: string
  actionText?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon, title, message, actionText, onAction }) => {
    const { colors } = useTheme()

    const styles = useMemo(() => StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        backgroundColor: colors.SECONDARY,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginTop: 16,
        marginBottom: 8,
      },
      message: {
        fontSize: 14,
        color: colors.GRAY[600],
        textAlign: 'center',
      },
      actionButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.PRIMARY,
      },
      actionText: {
        color: colors.ON_PRIMARY,
        fontSize: 15,
        fontWeight: '600',
      },
    }), [colors])

    return (
      <View style={styles.container}>
        <Ionicons name={icon} size={64} color={colors.GRAY[400]} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionText && onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAction}
            accessibilityRole='button'
          >
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  },
)

export default EmptyState