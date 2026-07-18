const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/events/dates?year=2026&month=7
router.get('/dates', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: 'year and month are required' });
  }
  const prefix = `${year}-${String(month).padStart(2, '0')}%`;

  const { rows } = await pool.query(
    `SELECT date, COUNT(*)::int AS count FROM events WHERE date LIKE $1 GROUP BY date`,
    [prefix]
  );

  const result = {};
  rows.forEach((r) => (result[r.date] = r.count));
  res.json(result);
});

// GET /api/events/search?q=music
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const like = `%${q}%`;
  const { rows } = await pool.query(
    `SELECT * FROM events
     WHERE title ILIKE $1 OR description ILIKE $1 OR venue ILIKE $1 OR location ILIKE $1
     ORDER BY date ASC`,
    [like]
  );
  res.json(rows);
});

// GET /api/events?date=2026-07-14
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date is required, e.g. ?date=2026-07-14' });
  }
  const { rows } = await pool.query('SELECT * FROM events WHERE date = $1 ORDER BY time ASC', [date]);
  res.json(rows);
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json(rows[0]);
});

module.exports = router;
