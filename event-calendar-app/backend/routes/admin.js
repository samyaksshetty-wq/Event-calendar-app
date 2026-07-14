const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'brochures';

// Files are held in memory just long enough to hand off to Supabase Storage -
// nothing is written to this server's own disk anymore.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP or PDF files are allowed for brochures'));
    }
  },
});

async function uploadBrochure(file) {
  if (!file) return null;
  const filename = `${uuidv4()}${path.extname(file.originalname)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, file.buffer, {
    contentType: file.mimetype,
  });
  if (error) throw new Error(`Brochure upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  const admin = rows[0];

  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  res.json({ token, username: admin.username });
});

// Everything below this line requires a valid login token
router.use(requireAuth);

// GET all events (admin dashboard table)
router.get('/events', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events ORDER BY date DESC, time ASC');
  res.json(rows);
});

// CREATE event
router.post('/events', upload.single('brochure'), async (req, res) => {
  try {
    const { title, description, date, time, venue, location, fees, organizer_name, organizer_contact } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const id = uuidv4();
    const brochure_url = await uploadBrochure(req.file);

    const { rows } = await pool.query(
      `INSERT INTO events (id, title, description, date, time, venue, location, fees, organizer_name, organizer_contact, brochure_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, title, description || '', date, time || '', venue || '', location || '', fees || '', organizer_name || '', organizer_contact || '', brochure_url]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create event' });
  }
});

// UPDATE event
router.put('/events/:id', upload.single('brochure'), async (req, res) => {
  try {
    const { rows: existingRows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: 'Event not found' });

    const { title, description, date, time, venue, location, fees, organizer_name, organizer_contact } = req.body;
    const brochure_url = req.file ? await uploadBrochure(req.file) : existing.brochure_url;

    const { rows } = await pool.query(
      `UPDATE events SET title=$1, description=$2, date=$3, time=$4, venue=$5, location=$6, fees=$7,
       organizer_name=$8, organizer_contact=$9, brochure_url=$10 WHERE id=$11 RETURNING *`,
      [
        title || existing.title,
        description ?? existing.description,
        date || existing.date,
        time ?? existing.time,
        venue ?? existing.venue,
        location ?? existing.location,
        fees ?? existing.fees,
        organizer_name ?? existing.organizer_name,
        organizer_contact ?? existing.organizer_contact,
        brochure_url,
        req.params.id,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to update event' });
  }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });

  await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
