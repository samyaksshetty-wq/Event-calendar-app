import { useCallback, useEffect, useState } from 'react';
import { subscribeFavorites, toggleFavorite, isFavorite } from './favoritesStore';

// Use for a single event's favorite state + a toggle function, e.g. a heart
// icon on a card or the detail screen.
export function useFavorite(eventId) {
  const [favorite, setFavorite] = useState(() => isFavorite(eventId));

  useEffect(() => {
    return subscribeFavorites((ids) => setFavorite(ids.has(eventId)));
  }, [eventId]);

  const toggle = useCallback(() => toggleFavorite(eventId), [eventId]);

  return [favorite, toggle];
}

// Use when you need the full set of favorite IDs, e.g. the Saved Events screen.
export function useFavoriteIds() {
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    return subscribeFavorites(setIds);
  }, []);

  return ids;
}
