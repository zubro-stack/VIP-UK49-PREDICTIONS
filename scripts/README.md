# Migration & cutover

Moves data out of the legacy monolith's `localStorage` and into the new
Postgres-backed app, without touching the legacy file until you've
confirmed the new app works with your real data.

## 1. Export your data from the legacy app

1. Open `remixed-544b6f74.html` in the browser you've been using it in
   (the data lives in that browser's `localStorage`, not in the repo).
2. Open devtools > Console.
3. Paste the full contents of `export-legacy-data.js` and press Enter.
4. A file named `uk49s-legacy-export.json` downloads - it contains your
   draws and posts (derived data like discovered patterns is not
   exported; the new engines recompute that from the draws themselves).

## 2. Stand up the new app

```
docker compose up -d                 # Postgres
cd backend && cp .env.example .env   # fill in real secrets
npm install
npx prisma migrate deploy
node prisma/seed.js                  # creates the engine catalog + an admin user
npm start                            # or: npm run dev
```

```
cd frontend && npm install && npm run dev
```

## 3. Import your export

```
UK49S_EMAIL=<a manager or admin email> \
UK49S_PASSWORD=<their password> \
node scripts/import-legacy-data.js /path/to/uk49s-legacy-export.json
```

This goes through the real API (auth, validation, RBAC) rather than
writing to the database directly - draws already present for the same
date+type are skipped, so it's safe to re-run.

## 4. Validate before cutting over

Run each engine (`POST /api/engines/:code/run` from the UI's "Recalculer"
button) and compare its predictions against what the legacy app currently
shows for the same draws - they should match, since every engine here was
regression-tested against the legacy logic (see `backend/tests/engines`).
Keep both apps running side by side until you're satisfied.

## 5. Retire the legacy file

Once you've confirmed the new app matches, `remixed-544b6f74.html` can be
deleted (or archived) and the old hosting/deployment for it turned off.
This step is intentionally not automated - it's a one-way decision about
your production app that only you should make, once you've verified your
own data against it.
