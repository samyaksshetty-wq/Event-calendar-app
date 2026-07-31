const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendPushToAllDevices } = require('../utils/sendPush');

const router = express.Router();

// POST /api/push/register - called by the app once it has permission and a
// device token. Public (no login needed) since it's just registering interest
// in receiving notifications, same as any consumer app.
router.post('/register', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });

  await pool.query(
    'INSERT INTO push_tokens (token) VALUES ($1) ON CONFLICT (token) DO NOTHING',
    [token]
  );
  res.json({ success: true });
}));

// POST /api/push/send-today - checks if there are events today, and if so,
// pushes a notification to every registered device. Not meant to be called by
// the app itself - a scheduled job (see .github/workflows/daily-notify.yml)
// triggers this once a day. Protected by a shared secret so it can't be
// abused to spam your users.
router.post('/send-today', asyncHandler(async (req, res) => {
  const secret = req.headers['x-notify-secret'];
  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().split('T')[0];
  const { rows: events } = await pool.query('SELECT * FROM events WHERE date = $1', [today]);

  if (events.length === 0) {
    return res.json({ sent: false, reason: 'No events today' });
  }

  const title = events.length === 1 ? "Today's Event" : `${events.length} Events Today`;
  const body =
    events.length === 1
      ? events[0].title
      : events
          .slice(0, 3)
          .map((e) => e.title)
          .join(', ') + (events.length > 3 ? '...' : '');

  // A single event today can be tapped straight into; multiple events have
  // no one target, so the app falls back to opening the Calendar with this
  // date already expanded.
  const data =
    events.length === 1
      ? { type: 'today_events', eventId: events[0].id }
      : { type: 'today_events', date: today };

  const result = await sendPushToAllDevices(pool, { title, body, data });
  res.json({ eventCount: events.length, ...result });
}));

module.exports = router;
