const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/ads/:placement -> the currently active ad for that slot, or null.
// "Active" means today falls within the ad's start_date/end_date (inclusive).
// If more than one ad is scheduled for the same dates, the most recently
// created one wins.
router.get('/:placement', async (req, res) => {
  const { placement } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `SELECT * FROM ads
     WHERE placement = $1 AND start_date <= $2 AND end_date >= $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [placement, today]
  );

  res.json(rows[0] || null);
});

module.exports = router;
