const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/announcement - the current text for the scrolling strip on the
// Calendar screen, or null if there's nothing to show right now.
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT text FROM announcement WHERE id = 1');
  res.json({ text: rows[0]?.text || null });
}));

module.exports = router;
