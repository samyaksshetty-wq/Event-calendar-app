import * as Notifications from 'expo-notifications';
import { navigationRef } from '../navigation/AppNavigator';

const MAX_RETRIES = 20; // ~6s, covers the splash screen delay before AppNavigator mounts

function navigateFromResponse(response, attempt = 0) {
  const eventId = response?.notification?.request?.content?.data?.eventId;
  if (!eventId) return; // e.g. the "today's events" digest has no single target

  if (navigationRef.isReady()) {
    navigationRef.navigate('EventDetail', { id: eventId });
  } else if (attempt < MAX_RETRIES) {
    // The navigator may not be mounted yet (still on the splash screen) -
    // try again shortly once it is.
    setTimeout(() => navigateFromResponse(response, attempt + 1), 300);
  }
}

// Makes tapping a push notification actually take you to the event it's
// about, instead of just opening the app to the default Calendar screen.
export function setupNotificationTapHandling() {
  // App was already running (foreground/background) and the user tapped it.
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    navigateFromResponse(response);
  });

  // App was killed and this notification tap is what launched it.
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) navigateFromResponse(response);
  });

  return () => subscription.remove();
}
