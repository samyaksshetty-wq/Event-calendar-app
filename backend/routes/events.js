const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/events/dates?year=2026&month=7
// Returns per-day event counts (for the dot markers) plus any festivals
// whose date range overlaps this month (for the background-color range
// markers) - a festival that started last month but continues into this
// one still needs to be highlighted here.
router.get('/dates', asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: 'year and month are required' });
  }
  const prefix = `${year}-${String(month).padStart(2, '0')}%`;

  const { rows: countRows } = await pool.query(
    `SELECT date, COUNT(*)::int AS count FROM events
     WHERE date LIKE $1 AND (category IS NULL OR category <> 'Festivals')
     GROUP BY date`,
    [prefix]
  );
  const counts = {};
  countRows.forEach((r) => (counts[r.date] = r.count));

  const monthNum = String(month).padStart(2, '0');
  const monthStart = `${year}-${monthNum}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const monthEnd = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

  const { rows: festivals } = await pool.query(
    `SELECT id, title, date, date_end FROM events
     WHERE category = 'Festivals' AND date <= $2 AND COALESCE(date_end, date) >= $1`,
    [monthStart, monthEnd]
  );

  res.json({ counts, festivals });
}));

// GET /api/events/search?q=music&category=Music
// Either q, category, or both can be provided.
router.get('/search', asyncHandler(async (req, res) => {
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
}));

// GET /api/events/categories
// Distinct categories actually in use, for building filter chips dynamically.
router.get('/categories', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC`
  );
  res.json(rows.map((r) => r.category));
}));

// GET /api/events/upcoming?limit=5
// Used for "recommended" suggestions - the next N events from today onward.
router.get('/upcoming', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `SELECT * FROM events WHERE date >= $1 ORDER BY date ASC, time ASC LIMIT $2`,
    [today, limit]
  );
  res.json(rows);
}));

// GET /api/events?date=2026-07-14
// Matches events on this exact date, plus any multi-day festival whose
// range spans it (even if it started on an earlier date).
router.get('/', asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date is required, e.g. ?date=2026-07-14' });
  }
  const { rows } = await pool.query(
    `SELECT * FROM events
     WHERE date = $1 OR (date_end IS NOT NULL AND $1 BETWEEN date AND date_end)
     ORDER BY time ASC`,
    [date]
  );
  res.json(rows);
}));

// GET /api/events/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json(rows[0]);
}));

module.exports = router;
