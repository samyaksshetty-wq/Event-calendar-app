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

// GET /api/events/search?q=music&category=Music
// Either q, category, or both can be provided.
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const category = (req.query.category || '').trim();
  if (!q && !category) return res.json([]);

  const conditions = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    conditions.push(
      `(title ILIKE $${params.length} OR description ILIKE $${params.length} OR venue ILIKE $${params.length} OR location ILIKE $${params.length})`
    );
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT * FROM events WHERE ${conditions.join(' AND ')} ORDER BY date ASC`,
    params
  );
  res.json(rows);
});

// GET /api/events/categories
// Distinct categories actually in use, for building filter chips dynamically.
router.get('/categories', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC`
  );
  res.json(rows.map((r) => r.category));
});

// GET /api/events/upcoming?limit=5
// Used for "recommended" suggestions - the next N events from today onward.
router.get('/upcoming', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `SELECT * FROM events WHERE date >= $1 ORDER BY date ASC, time ASC LIMIT $2`,
    [today, limit]
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
