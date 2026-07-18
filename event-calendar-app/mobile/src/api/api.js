import axios from 'axios';

// IMPORTANT: change this to wherever your backend is running.
//
// - Testing on your phone via Expo Go, backend running on your laptop:
//     use your laptop's local network IP, e.g. "http://192.168.1.5:4000"
//     (find it with `ipconfig` on Windows or `ifconfig`/`ip a` on Mac/Linux -
//     do NOT use "localhost", the phone can't reach your laptop's localhost)
//
// - Backend deployed online (Render, Railway, etc):
//     use that public URL, e.g. "https://your-app.onrender.com"
export const API_BASE_URL = 'https://event-calendar-app-597h.onrender.com';

const api = axios.create({ baseURL: 'https://event-calendar-app-597h.onrender.com' });

// Returns date -> event count for a given month, for calendar dots
export function getEventDatesForMonth(year, month) {
  return api.get('/api/events/dates', { params: { year, month } }).then((r) => r.data);
}

// Returns all events on a specific day (YYYY-MM-DD)
export function getEventsForDate(date) {
  return api.get('/api/events', { params: { date } }).then((r) => r.data);
}

// Returns full detail for one event
export function getEventById(id) {
  return api.get(`/api/events/${id}`).then((r) => r.data);
}

// Returns events matching a search term (title, description, or venue)
export function searchEvents(query) {
  return api.get('/api/events/search', { params: { q: query } }).then((r) => r.data);
}

// Returns the next few upcoming events, used for search-screen suggestions
export function getUpcomingEvents(limit = 5) {
  return api.get('/api/events/upcoming', { params: { limit } }).then((r) => r.data);
}

// Returns the currently active ad for a placement, or null if none is scheduled.
// Fails silently (returns null) so an ad-fetch problem never breaks the app.
// Registers this device's push token with the backend so it can receive
// "events today" notifications. Fails silently - notifications are a nice
// extra, never something that should block or crash the app.
export function registerPushToken(token) {
  return api.post('/api/push/register', { token }).catch(() => {});
}

export function getActiveAd(placement) {
  return api
    .get(`/api/ads/${placement}`)
    .then((r) => r.data)
    .catch(() => null);
}

export function brochureFullUrl(brochure_url) {
  if (!brochure_url) return null;
  // Brochure URLs now come straight from Supabase Storage and are already
  // complete (https://...), so they shouldn't be combined with API_BASE_URL.
  // This check only exists to stay compatible with any old local paths.
  if (brochure_url.startsWith('http://') || brochure_url.startsWith('https://')) {
    return brochure_url;
  }
  return `${API_BASE_URL}${brochure_url}`;
}

export default api;
