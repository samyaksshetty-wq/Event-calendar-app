const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/push/register - called by the app once it has permission and a
// device token. Public (no login needed) since it's just registering interest
// in receiving notifications, same as any consumer app.
router.post('/register', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });

  await pool.query(
    'INSERT INTO push_tokens (token) VALUES ($1) ON CONFLICT (token) DO NOTHING',
    [token]
  );
  res.json({ success: true });
});

// POST /api/push/send-today - checks if there are events today, and if so,
// pushes a notification to every registered device. Not meant to be called by
// the app itself - a scheduled job (see .github/workflows/daily-notify.yml)
// triggers this once a day. Protected by a shared secret so it can't be
// abused to spam your users.
router.post('/send-today', async (req, res) => {
  const secret = req.headers['x-notify-secret'];
  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().split('T')[0];
  const { rows: events } = await pool.query('SELECT * FROM events WHERE date = $1', [today]);

  if (events.length === 0) {
    return res.json({ sent: false, reason: 'No events today' });
  }

  const { rows: tokens } = await pool.query('SELECT token FROM push_tokens');
  if (tokens.length === 0) {
    return res.json({ sent: false, reason: 'No registered devices' });
  }

  const title = events.length === 1 ? "Today's Event" : `${events.length} Events Today`;
  const body =
    events.length === 1
      ? events[0].title
      : events
          .slice(0, 3)
          .map((e) => e.title)
          .join(', ') + (events.length > 3 ? '...' : '');

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data: { type: 'today_events' },
  }));

  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  const expoResults = [];
  for (const chunk of chunks) {
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    });
    expoResults.push(await expoRes.json());
  }

  res.json({ sent: true, eventCount: events.length, deviceCount: tokens.length, expoResults });
  res.json({ sent: true, eventCount: events.length, deviceCount: tokens.length });
});

module.exports = router;
