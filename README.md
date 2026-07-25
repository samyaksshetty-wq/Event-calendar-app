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

## 1. Set up Supabase (your 24/7 database + brochure storage)

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project.
   Save the database password it asks you to set — you'll need it in a minute.
2. **Get your database connection string:** in the Supabase dashboard, go to
   **Settings → Database → Connection string**, select the **URI** tab, and use the
   **Transaction pooler** version (port `6543`). Copy it.
3. **Get your API keys:** go to **Settings → API**. Copy the **Project URL** and the
   **service_role** key (not the `anon` key — the service role key is the one your
   backend uses; never put it in the mobile app).
4. **Create a storage bucket for brochures:** go to **Storage** in the sidebar →
   **New bucket** → name it exactly `brochures` → toggle it **Public** → Create.
   (Public just means anyone with the file's link can view it — same as any brochure
   image on a website. It does not let anyone upload or delete files; only your
   backend can do that, using the service role key.)

## 2. Configure the backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `JWT_SECRET` — any long random string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your login for `/admin`
- `DATABASE_URL` — the connection string from step 1.2 (replace `your_db_password`
  with the password you set when creating the project)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — from step 1.3

Create your admin login and start the server:
```
npm run create-admin
npm start
```
The first time this runs, it also creates the `events` and `admins` tables in your
Supabase database automatically — nothing to set up manually in the Supabase SQL editor.

Everything now reads/writes to Supabase instead of a local file, so your data and
brochures persist no matter where or how many times you restart the server.

---

## 3. Deploy the backend so it runs 24/7

Supabase hosts your **data**, but your Express server code still needs somewhere to
actually run continuously. [Render](https://render.com) has a straightforward free tier:

1. Push this `backend` folder to a GitHub repo (Render deploys from GitHub).
2. On Render: **New → Web Service** → connect your repo → set the **Root Directory**
   to `backend` → Build command `npm install` → Start command `npm start`.
3. Under **Environment**, add the same variables from your `.env` file
   (`JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy. Render gives you a permanent URL like `https://your-app.onrender.com`.
5. Run `npm run create-admin` once against this live setup — either add a temporary
   one-off command in Render's shell, or just run it from your laptop with `.env`
   pointed at the same Supabase project (it writes to the same database either way).

Note: Render's free tier "sleeps" after 15 minutes of no traffic and takes a few
seconds to wake back up on the next request — fine for a small app, but if that
matters to you, their paid tier ($7/mo) keeps it always-on, or Railway is a similar
alternative.

## 4. Point the mobile app at your live backend

Open `mobile/src/api/api.js` and change `API_BASE_URL` to your Render URL:
```js
export const API_BASE_URL = 'https://your-app.onrender.com';
```
Now the app works from anywhere, on any Wi-Fi or mobile data — no more matching IPs
or keeping your laptop on.

---

## 5. Your day-to-day workflow (once this is all live)

1. An event organizer sends you their event details.
2. You go to `https://your-app.onrender.com/admin`, log in, and fill in the form.
3. It's saved instantly to Supabase — anyone with the app open sees it the next time
   they open that date. You never touch or rebuild the app itself to add events.

---

## 6. Keeping the free tier alive (important)

Supabase pauses free projects after 7 days with no API traffic. This repo includes
`.github/workflows/keep-alive.yml`, which pings your backend every 3 days automatically
so this never happens. To activate it:

1. Push this whole project (including the `.github` folder) to a GitHub repo.
2. In the repo, go to **Settings → Secrets and variables → Actions → New repository secret**.
3. Name it `BACKEND_URL`, value = your Render URL (e.g. `https://your-app.onrender.com`), no trailing slash.
4. That's it — it runs automatically from then on. You can also trigger it manually
   any time from the repo's **Actions** tab to test it.

## Why Supabase + Render (and not something else)

- **Supabase** gives you a real Postgres database and file storage for free, which is
  what an app with growing, searchable, structured data (your events) actually needs.
  The only free-tier catch is the 7-day pause, solved by the keep-alive above.
- **Render** runs your actual Express server. Its free web service sleeps after 15
  minutes idle and takes ~30-60 seconds to wake on the next request — a reasonable
  trade-off for a small local-events app. If that delay ever bothers you, Render's
  Starter plan ($7/mo) removes it with no code changes.
- Don't use Render's own free Postgres database — it auto-deletes after 30 days on
  the free tier. Supabase is the right home for your data either way.

---

## Publishing to the App Store / Play Store

To publish, use Expo's build service (EAS):
```
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```
This produces installable app files you submit to Google Play / Apple App Store
(each requires a developer account — Google is a one-time $25 fee, Apple is $99/year).

## Notes / things you may want to change later
- Right now there's one admin login shared by you. If you ever want multiple people
  managing events, the `admins` table already supports multiple rows — just insert more.
- The calendar only shows a dot on days with events; tapping any day works even with
  no events (it just shows "No events on this day yet").

## Ads (Google AdMob)

The app shows ads via Google AdMob — a banner on the Calendar, Event Details, and
List Your Event screens, plus an interstitial that attempts to show when someone
opens an event's details.

**Test vs. real ads:** `mobile/src/ads/adUnitIds.js` has a `USE_TEST_ADS` flag, set
to `true` by default. While that's on, every ad slot shows Google's official test
ad units — safe to use throughout closed testing, since they never generate real
revenue or count as real impressions. Once you have real ad units from your AdMob
console, fill them into `PRODUCTION_UNITS` in that same file and flip the flag to
`false`.

**A real limitation worth knowing:** unlike a self-managed ad system, AdMob fully
controls its own interstitial ad's timing and close button — there's no way to
enforce a minimum watch time before it can be closed. `useInterstitialAd.js`
requests and shows the ad on a best-effort basis; if no ad is ready yet, it simply
does nothing rather than blocking the screen.

**Native setup (Android):** since this project has been ejected to the bare
workflow (`android/` folder exists locally), the `react-native-google-mobile-ads`
config plugin in `app.json` does **not** auto-apply to your local native project.
The AdMob App ID must be added manually to
`mobile/android/app/src/main/AndroidManifest.xml`, inside the `<application>` tag:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```
(That's Google's test App ID, matching `adUnitIds.js`. Replace with your real
AdMob App ID once you're ready to go live with real ads.)

**iOS** doesn't need this manual step — no local `ios/` folder exists yet, so when
you eventually run `eas build --platform ios`, EAS generates the iOS project fresh
from `app.json`, and the AdMob plugin config applies automatically and correctly.
