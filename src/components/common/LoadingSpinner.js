import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { COLORS } from '../../constants/themeColors'

/**
 * 加载指示器组件
 */
const LoadingSpinner = ({ size = 'large', color = COLORS.PRIMARY }) => {
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
