import React, { useMemo } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '../contexts/ThemeContext'

import HomeScreen from '../screens/HomeScreen'
import UploadScreen from '../screens/UploadScreen'
import DetailScreen from '../screens/DetailScreen'
import EditScreen from '../screens/EditScreen'
import StatisticsScreen from '../screens/StatisticsScreen'
import CalendarScreen from '../screens/CalendarScreen'
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen'
import YearlyReportEntryScreen from '../screens/YearlyReportEntryScreen'
import IdolReportScreen from '../screens/IdolReportScreen'

export type RootStackParamList = {
  Home: undefined
  Upload: { idolName?: string }
  Detail: { idolName: string }
  Edit: { recordId: string }
  Statistics: undefined
  Calendar: undefined
  ThemeSettings: undefined
  YearlyReport: undefined
  IdolReport: { idolName: string; avatarUri?: string | null }
}

const Stack = createStackNavigator<RootStackParamList>()

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
          headerTintColor: colors.WHITE,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          cardStyleInterpolator: ({ current, layouts }) => ({
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
          }),
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator