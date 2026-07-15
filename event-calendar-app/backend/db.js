const { Pool } = require('pg');

// Connects to your Supabase Postgres database using the connection string
// from your .env file (see .env.example for where to find it).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase's connection
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      placement TEXT NOT NULL,     -- calendar_banner | event_detail_banner | contact_banner | event_detail_interstitial
      media_type TEXT NOT NULL,    -- 'image' or 'video'
      media_url TEXT NOT NULL,
      start_date TEXT NOT NULL,    -- YYYY-MM-DD, inclusive
      end_date TEXT NOT NULL,      -- YYYY-MM-DD, inclusive
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement);`);
}

module.exports = { pool, initDb };
