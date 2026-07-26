import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Apple requires this exact prompt before any SDK (including AdMob) can use
// the device's ad identifier for personalized ads. Android has no equivalent
// requirement, so this is a no-op there.
//
// If the person declines, AdMob still works - it just falls back to showing
// non-personalized ads instead of failing or crashing.
export async function requestTrackingPermission() {
  if (Platform.OS !== 'ios') return;

  try {
    await requestTrackingPermissionsAsync();
  } catch (err) {
    console.log('Tracking permission request failed', err.message);
  }
}
