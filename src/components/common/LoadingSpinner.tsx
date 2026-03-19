import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { COLORS } from '../../constants/themeColors'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
}

/**
 * 加载指示器组件
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.PRIMARY,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default LoadingSpinner
