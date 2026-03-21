import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { COLORS } from '../constants/themeColors'

import HomeScreen from '../screens/HomeScreen'
import UploadScreen from '../screens/UploadScreen'
import DetailScreen from '../screens/DetailScreen'
import EditScreen from '../screens/EditScreen'
import StatisticsScreen from '../screens/StatisticsScreen'
import CalendarScreen from '../screens/CalendarScreen'

export type RootStackParamList = {
  Home: undefined
  Upload: undefined
  Detail: { idolName: string }
  Edit: { recordId: string }
  Statistics: undefined
  Calendar: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

/**
 * 应用导航配置
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.PRIMARY,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
