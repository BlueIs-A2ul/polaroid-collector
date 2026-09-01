import React, { useMemo } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import type { StackCardStyleInterpolator } from '@react-navigation/stack'
import { useTheme } from '../contexts/ThemeContext'
import type { RootStackParamList } from '../types/navigation'

import HomeScreen from '../screens/HomeScreen'
import UploadScreen from '../screens/UploadScreen'
import DetailScreen from '../screens/DetailScreen'
import EditScreen from '../screens/EditScreen'
import StatisticsScreen from '../screens/StatisticsScreen'
import CalendarScreen from '../screens/CalendarScreen'
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen'
import YearlyReportEntryScreen from '../screens/YearlyReportEntryScreen'
import IdolReportScreen from '../screens/IdolReportScreen'
import OrganizationCenterScreen from '../screens/OrganizationCenterScreen'

const Stack = createStackNavigator<RootStackParamList>()

const slideFadeInterpolator: StackCardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      },
    ],
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  },
})

const AppNavigator = () => {
  const { colors } = useTheme()

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.PRIMARY,
          },
          headerTintColor: colors.ON_PRIMARY,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          cardStyleInterpolator: slideFadeInterpolator,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Upload'
          component={UploadScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Detail'
          component={DetailScreen}
          options={{ title: '偶像详情' }}
        />
        <Stack.Screen
          name='Edit'
          component={EditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Statistics'
          component={StatisticsScreen}
          options={{ title: '统计' }}
        />
        <Stack.Screen
          name='Calendar'
          component={CalendarScreen}
          options={{ title: '日历' }}
        />
        <Stack.Screen
          name='ThemeSettings'
          component={ThemeSettingsScreen}
          options={{ title: '主题设置' }}
        />
        <Stack.Screen
          name='YearlyReport'
          component={YearlyReportEntryScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name='IdolReport'
          component={IdolReportScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name='OrganizationCenter'
          component={OrganizationCenterScreen}
          options={{ title: '整理中心' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
