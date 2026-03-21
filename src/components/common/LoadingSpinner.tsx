import React, { useMemo } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTheme } from '../../contexts/ThemeContext'

const LoadingSpinner: React.FC = React.memo(() => {
  const { colors } = useTheme()

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.SECONDARY,
    },
  }), [colors])

  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={colors.PRIMARY} />
    </View>
  )
})

export default LoadingSpinner