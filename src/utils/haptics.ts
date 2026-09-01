import * as Haptics from 'expo-haptics'

export const hapticSelect = () => {
  Haptics.selectionAsync().catch(() => {})
}

export const hapticSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}

export const hapticWarning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
}

export const hapticError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
}
