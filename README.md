# Event Calendar App

Two parts:

1. **`mobile/`** — the app your users install. Shows a calendar; tapping a date shows
   the events happening that day (venue, time, brochure).
2. **`backend/`** — one Node.js server that does two jobs:
   - Serves the API the mobile app reads from (`/api/events/...`)
   - Serves a simple **admin panel** at `/admin` — a website only you log into,
     where you add/edit/delete events and upload brochures. Organizers send you
     their details, you type them in here, and they instantly show up in the app.

There is no separate "backend for the app" and "backend for the admin panel" —
it's the same server, just two different sets of routes.

---

## 1. Run the backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` (any long random string) and `ADMIN_USERNAME` /
`ADMIN_PASSWORD` (your login for the admin panel).

Create your admin login (run this once, or again whenever you want to change the password):
```
npm run create-admin
```

Start the server:
```
npm start
```

You should see:
```
Server running at http://localhost:4000
Admin panel at   http://localhost:4000/admin
```

Open `http://localhost:4000/admin` in your browser, log in, and try adding an event.
Uploaded brochures are saved in `backend/uploads/` and served at `backend/uploads/<file>`.

The database is a single file, `backend/events.db` (SQLite) — nothing else to install or configure.

---

## 2. Run the mobile app

```
cd mobile
npm install
```

**Important:** open `mobile/src/api/api.js` and change `API_BASE_URL` to point at your
backend. If you're testing on your phone with the Expo Go app while the backend runs
on your laptop, use your laptop's local network IP (not `localhost`) — e.g.:
```js
export const API_BASE_URL = 'http://192.168.1.5:4000';
```
Find your IP with `ipconfig` (Windows) or `ifconfig` / `ip a` (Mac/Linux). Your phone
and laptop need to be on the same Wi-Fi network.

Then start Expo:
```
npx expo start
```
Scan the QR code with the Expo Go app (install it from the App Store / Play Store) to
open the app on your phone.

---

## 3. Your day-to-day workflow

1. An event organizer sends you their event details.
2. You go to `http://<your-backend-url>/admin`, log in, and fill in the "Add New Event"
   form — title, date, time, venue, description, organizer contact, and upload their
   brochure (image or PDF).
3. It's saved instantly — anyone with the app open will see it the next time they open
   that date on the calendar.

---

## 4. Putting it live (so it works outside your laptop)

Right now this only works while your laptop is on and both devices are on the same
Wi-Fi. To make it real:

**Backend:** deploy the `backend/` folder to a host like Render, Railway, or Fly.io
(all have free tiers). They'll give you a public URL like `https://your-app.onrender.com`.
Set the same environment variables (`JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`)
in their dashboard, and run `npm run create-admin` once via their shell/console.

**Mobile app:** update `API_BASE_URL` in `mobile/src/api/api.js` to your new public
backend URL. Then to publish to the App Store / Play Store, use Expo's build service
(EAS):
```
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```
This produces installable app files you submit to Google Play / Apple App Store
(each requires a developer account — Google is a one-time $25 fee, Apple is $99/year).

---

## Notes / things you may want to change later
- Right now there's one admin login shared by you. If you ever want multiple people
  managing events, the `admins` table already supports multiple rows — just insert more.
- Brochures are stored as files on the server's disk. If you deploy to a host with an
  ephemeral filesystem (some free tiers wipe files on restart), switch to a service
  like Cloudinary or S3 for uploads — ask me and I can wire that in.
- The calendar only shows a dot on days with events; tapping any day works even with
  no events (it just shows "No events on this day yet").
