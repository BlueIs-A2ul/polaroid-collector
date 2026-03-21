import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../contexts/ThemeContext'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message: string
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon, title, message }) => {
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
    }), [colors])

    return (
      <View style={styles.container}>
        <Ionicons name={icon} size={64} color={colors.GRAY[400]} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    )
  },
)

export default EmptyState