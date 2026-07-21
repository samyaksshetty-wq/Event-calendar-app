import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'namma_events_favorites';

let favoriteIds = new Set();
let loaded = false;
let loadPromise = null;
let listeners = [];

async function load() {
  if (loaded) return;
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) favoriteIds = new Set(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => {
        loaded = true;
      });
  }
  await loadPromise;
}

function notify() {
  const snapshot = new Set(favoriteIds);
  listeners.forEach((fn) => fn(snapshot));
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...favoriteIds]));
  } catch {
    // non-fatal - favorites just won't survive an app restart this one time
  }
}

// Subscribes to favorite changes. Calls back immediately with the current
// state (once loaded), then again any time favorites change anywhere in the
// app. Returns an unsubscribe function.
export function subscribeFavorites(callback) {
  listeners.push(callback);
  load().then(() => callback(new Set(favoriteIds)));
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function isFavorite(id) {
  return favoriteIds.has(id);
}

export async function toggleFavorite(id) {
  await load();
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }
  await persist();
  notify();
}

export async function getFavoriteIds() {
  await load();
  return [...favoriteIds];
}
