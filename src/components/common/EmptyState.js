import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/themeColors'

/**
 * 空状态组件
 */
const EmptyState = ({ icon, title, message }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.GRAY[400]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.GRAY[600],
    marginTop: 16,
  },
  message: {
    fontSize: 14,
    color: COLORS.GRAY[500],
    marginTop: 8,
    textAlign: 'center',
  },
})

export default EmptyState
