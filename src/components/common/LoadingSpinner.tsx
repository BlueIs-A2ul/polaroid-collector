import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../../constants/themeColors'

/**
 * 加载中旋转器组件
 */
const LoadingSpinner: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={COLORS.PRIMARY} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
  },
})

export default LoadingSpinner
