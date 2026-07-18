// Creates (or updates the password for) the admin account used to log into /admin
// Run with:  npm run create-admin
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool, initDb } = require('../db');

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

async function main() {
  if (!username || !password) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  await initDb();

  const password_hash = bcrypt.hashSync(password, 10);
  const { rows } = await pool.query('SELECT id FROM admins WHERE username = $1', [username]);

  if (rows[0]) {
    await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [password_hash, username]);
    console.log(`Password updated for admin user "${username}".`);
  } else {
    await pool.query('INSERT INTO admins (id, username, password_hash) VALUES ($1, $2, $3)', [
      uuidv4(),
      username,
      password_hash,
    ]);
    console.log(`Admin user "${username}" created.`);
  }

  await pool.end();
}

main();
