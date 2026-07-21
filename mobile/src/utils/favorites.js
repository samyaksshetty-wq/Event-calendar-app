import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'namma_events_favorites';

export async function getFavoriteIds() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(id) {
  const ids = await getFavoriteIds();
  return ids.includes(id);
}

// Adds or removes an event id from the saved list, returns the new list.
export async function toggleFavorite(id) {
  const ids = await getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch (err) {
    console.log('Failed to save favorites', err.message);
  }
  return next;
}
