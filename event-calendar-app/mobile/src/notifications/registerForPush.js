import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from '../api/api';

// Controls how a notification behaves if it arrives while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Asks for notification permission (if not already granted or denied) and, if
// granted, registers this device's push token with the backend. Safe to call
// on every app launch - it's a no-op if permission was already decided.
export async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    registerPushToken(token);
    return token;
  } catch (err) {
    console.log('Failed to get push token', err.message);
    return null;
  }
}
