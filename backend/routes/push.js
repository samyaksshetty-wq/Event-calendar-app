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

// POST /api/push/send-today - checks if there are events happening today
// and/or festivals starting tomorrow, and if so, pushes a notification to
// every registered device. Festivals are announced the day before they
// start (not every day they run) so people can plan ahead, rather than
// finding out only once it's already begun. Not meant to be called by the
// app itself - a scheduled job triggers this once a day. Protected by a
// shared secret so it can't be abused to spam your users.
router.post('/send-today', asyncHandler(async (req, res) => {
  const secret = req.headers['x-notify-secret'];
  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { rows: events } = await pool.query(
    `SELECT * FROM events WHERE date = $1 AND (category IS NULL OR category <> 'Festivals')`,
    [today]
  );
  const { rows: festivals } = await pool.query(
    `SELECT * FROM events WHERE category = 'Festivals' AND date = $1`,
    [tomorrow]
  );

  if (events.length === 0 && festivals.length === 0) {
    return res.json({ sent: false, reason: 'Nothing to announce today' });
  }

  let title;
  if (festivals.length === 0) {
    title = events.length === 1 ? "Today's Event" : `${events.length} Events Today`;
  } else if (events.length === 0) {
    title = festivals.length === 1 ? 'Festival Tomorrow! 🎉' : `${festivals.length} Festivals Tomorrow! 🎉`;
  } else {
    const eventPart = events.length === 1 ? '1 event' : `${events.length} events`;
    const festivalPart = festivals.length === 1 ? 'a festival' : `${festivals.length} festivals`;
    title = `You have ${eventPart} today, and ${festivalPart} tomorrow`;
  }

  const allTitles = [...events.map((e) => e.title), ...festivals.map((f) => f.title)];
  const body = allTitles.length <= 3 ? allTitles.join(', ') : `${allTitles.slice(0, 3).join(', ')}...`;

  // A single item (one event today, or one festival tomorrow) can be tapped
  // straight into; anything more has no one target, so the app falls back
  // to opening the Calendar on whichever date is actually more relevant -
  // today if there are events today, otherwise tomorrow for the festival(s).
  const only = events.length + festivals.length === 1 ? (events[0] || festivals[0]) : null;
  const fallbackDate = events.length > 0 ? today : tomorrow;
  const data = only ? { type: 'today_events', eventId: only.id } : { type: 'today_events', date: fallbackDate };

  const result = await sendPushToAllDevices(pool, { title, body, data });
  res.json({ eventCount: events.length, festivalCount: festivals.length, ...result });
}));

module.exports = router;
