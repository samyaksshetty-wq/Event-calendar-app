// Formats a YYYY-MM-DD string as "Monday, July 20, 2026"
export function formatDateWithDay(dateString) {
  if (!dateString) return dateString;
  const d = new Date(dateString + 'T00:00:00');
  if (isNaN(d.getTime())) return dateString; // fall back to raw string if unparsable
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Returns a short relative label like "Today", "Tomorrow", "In 5 days".
// Used on event cards so people get a sense of urgency at a glance.
export function getRelativeDayLabel(dateString) {
  if (!dateString) return '';
  const target = new Date(dateString + 'T00:00:00');
  if (isNaN(target.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return '';
}
