import React from 'react'
import { StatusBar } from 'expo-status-bar'
import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider } from './src/contexts/ThemeContext'
import DialogRoot from './src/components/common/DialogRoot'

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <StatusBar style='auto' />
      <DialogRoot />
      <AppNavigator />
    </ThemeProvider>
  )
}
