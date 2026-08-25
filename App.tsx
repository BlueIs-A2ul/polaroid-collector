import React from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext'
import DialogRoot from './src/components/common/DialogRoot'
import { isColorDark } from './src/utils/colorUtils'

const AppContent: React.FC = () => {
  const { colors, isLoading } = useTheme()

  return (
    <>
      <StatusBar style={isColorDark(colors.PRIMARY) ? 'light' : 'dark'} />
      {isLoading ? (
        <View style={{ flex: 1, backgroundColor: colors.SECONDARY }} />
      ) : (
        <AppNavigator />
      )}
    </>
  )
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <DialogRoot />
      <AppContent />
    </ThemeProvider>
  )
}
