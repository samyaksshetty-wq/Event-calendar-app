require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb } = require('./db');
const eventsRouter = require('./routes/events');
const adminRouter = require('./routes/admin');
const pushRouter = require('./routes/push');
const shareRouter = require('./routes/share');
const maintenanceRouter = require('./routes/maintenance');

const app = express();

app.use(cors());
app.use(express.json());

// The admin panel is a plain HTML/JS site at /admin - this is where YOU log in
// and add events. It is not linked from the mobile app anywhere.
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Public privacy policy page, required by the App Store / Play Store listings
app.use('/privacy', express.static(path.join(__dirname, 'public', 'privacy')));

// API routes
app.use('/api/events', eventsRouter);   // public, used by the mobile app
app.use('/api/admin', adminRouter);     // protected, used by the admin panel
app.use('/api/push', pushRouter);       // public register + secret-protected send-today
app.use('/e', shareRouter);             // public share-link landing page (opens app or store)
app.use('/api/maintenance', maintenanceRouter); // secret-protected, used by an external daily cron

app.get('/', (req, res) => {
  res.send('Event Calendar API is running. Admin panel is at /admin');
});

// Catches errors forwarded by asyncHandler-wrapped routes (e.g. a failed DB
// query) so one bad request returns a 500 instead of crashing the server.
app.use((err, req, res, next) => {
  console.error('Unhandled route error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Last-resort safety net for any rejection that slips through outside a
// request (e.g. a fire-and-forget promise) - log it instead of letting
// Node's default behavior terminate the process.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Admin panel at   http://localhost:${PORT}/admin`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database. Check DATABASE_URL in your .env file.');
    console.error(err.message);
    process.exit(1);
  });
