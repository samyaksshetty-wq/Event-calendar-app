import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native'; // Added Alert component from react-native
import { registerPushToken } from '../api/api';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX, // Recommended for clear visual alerts in UAE
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert("Permission Error", "Notification permission was denied by the user.");
    return null;
  }

  try {
    // Correctly extract the projectId required for native builds
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    // DEBUG ALERT 1: Show if the project ID exists
    Alert.alert("Debug Step 1", "Project ID Found: " + projectId);

    // Call the function exactly ONCE, passing the required projectId object
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    
    // DEBUG ALERT 2: Show the generated token string
    Alert.alert("Debug Step 2", "Token Generated: " + token);
    
    // Await the API call to ensure it finishes sending to Supabase
    await registerPushToken(token);
    
    // DEBUG ALERT 3: Confirm successful database entry
    Alert.alert("Debug Step 3", "Token successfully sent to backend database!");
    
    return token;
  } catch (err) {
    // DEBUG ALERT 4: Catch the exact native crash error message
    Alert.alert("CRASH ERROR", "Failed at engine step: " + err.message);
    console.log('Failed to get push token:', err.message);
    return null;
  }
}
