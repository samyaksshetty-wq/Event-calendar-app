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
export const API_BASE_URL = 'http://192.168.1.224:4000';

const api = axios.create({ baseURL: API_BASE_URL });

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

export function brochureFullUrl(brochure_url) {
  if (!brochure_url) return null;
  return `${API_BASE_URL}${brochure_url}`;
}

export default api;
