const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { pool } = require('../db');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'brochures';

// POST /api/maintenance/cleanup-past-events - deletes every event whose date
// has already passed (in UAE time), along with its brochure file in Supabase
// Storage, so past events don't sit around taking up database/storage space.
// Not meant to be called by the app - an external cron job triggers this once
// a day at noon UAE time, protected by the same shared secret as the daily
// notification job.
router.post('/cleanup-past-events', asyncHandler(async (req, res) => {
  const secret = req.headers['x-notify-secret'];
  if (!secret || secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // UAE is UTC+4 year-round (no daylight saving), so this is just a fixed offset.
  const uaeNow = new Date(Date.now() + 4 * 60 * 60 * 1000);
  const todayUAE = uaeNow.toISOString().split('T')[0];

  const { rows: pastEvents } = await pool.query(
    'SELECT id, brochure_url FROM events WHERE date < $1',
    [todayUAE]
  );

  if (pastEvents.length === 0) {
    return res.json({ deleted: 0 });
  }

  const filenames = pastEvents
    .filter((e) => e.brochure_url)
    .map((e) => e.brochure_url.split('/').pop());

  if (filenames.length > 0) {
    const { error } = await supabase.storage.from(BUCKET).remove(filenames);
    if (error) console.error('Failed to remove brochure(s) from storage:', error.message);
  }

  await pool.query('DELETE FROM events WHERE date < $1', [todayUAE]);

  res.json({ deleted: pastEvents.length, eventIds: pastEvents.map((e) => e.id) });
}));

module.exports = router;
