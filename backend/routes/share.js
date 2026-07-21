const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Update these once you know your final store listing details.
// ANDROID_PACKAGE_NAME should exactly match app.json's android.package.
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE_NAME || 'com.yourname.eventcalendar';
const IOS_APP_STORE_URL = process.env.IOS_APP_STORE_URL || ''; // leave blank until published on iOS

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// GET /e/:id - the link people actually get when someone shares an event.
// Tries to open the app straight to that event; if the app isn't installed,
// sends the person to the Play Store (or App Store, once that exists) instead.
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
  const event = rows[0];

  if (!event) {
    return res.status(404).send('Event not found.');
  }

  const deepLink = `nammaevents://event/${event.id}`;
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  const iosStoreUrl = IOS_APP_STORE_URL || playStoreUrl; // falls back to Play Store until an iOS listing exists

  const title = escapeHtml(event.title);
  const description = escapeHtml(event.description || 'Check out this event on Namma Events');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; text-align: center; padding: 60px 24px; background: #FAF9F6; color: #181B29; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { color: #6B7280; font-size: 14px; }
    a { display: inline-block; margin-top: 20px; background: #0F6D66; color: white; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Opening in the Namma Events app...</p>
  <a href="${playStoreUrl}">Get the app</a>
  <script>
    // Try to open the app directly first
    window.location = ${JSON.stringify(deepLink)};

    // If the app didn't open within ~1.5s (not installed, or the OS didn't
    // intercept it), send the person to the right app store instead.
    setTimeout(function () {
      var ua = navigator.userAgent || '';
      if (/android/i.test(ua)) {
        window.location = ${JSON.stringify(playStoreUrl)};
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        window.location = ${JSON.stringify(iosStoreUrl)};
      }
    }, 1500);
  </script>
</body>
</html>`);
});

module.exports = router;
