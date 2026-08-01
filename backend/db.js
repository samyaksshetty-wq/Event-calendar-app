const { Pool } = require('pg');

// Connects to your Supabase Postgres database using the connection string
// from your .env file (see .env.example for where to find it).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase's connection
});

// pg emits 'error' on an idle client when the connection drops (e.g. the
// pooler recycling it). Without a listener, that error is uncaught and
// crashes the whole process - this just logs it instead.
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      venue TEXT,
      location TEXT,
      fees TEXT,
      organizer_name TEXT,
      organizer_contact TEXT,
      brochure_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);`);

  // Postgres supports adding a column only if it doesn't already exist,
  // so this is safe to run every time the server starts, even on an
  // existing database that predates this feature.
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT;`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);`);

  // Multi-day festivals set this to the last day of the festival; every
  // other event leaves it null and is treated as a single-day event.
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS date_end TEXT;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_tokens (
      token TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Single-row table backing the scrolling announcement strip on the
  // Calendar screen (festival wishes, cancellation notices, etc). Empty/null
  // text means the strip is hidden.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcement (
      id INTEGER PRIMARY KEY DEFAULT 1,
      text TEXT,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`INSERT INTO announcement (id, text) VALUES (1, NULL) ON CONFLICT (id) DO NOTHING;`);
}

module.exports = { pool, initDb };
