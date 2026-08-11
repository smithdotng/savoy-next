# Savoy Summerset Menu (Next.js)

Next.js rewrite of the Savoy Summerset restaurant menu app. Installable as a PWA, with a reservation form that emails `reservations@savoysummerset.com`.

## What's here

- `/` - public menu (search, category tabs, thumbnails, reservation form + call button, install prompt)
- `/login`, `/menu` - admin: update prices, add items with a thumbnail, bulk upload via spreadsheet, delete items
- Same MongoDB Atlas database/collection as the original Express app - no data migration needed
- PWA: `app/manifest.js`, `public/sw.js`, icons in `public/images/icons/`

## Setup

```bash
npm install
```

Copy `.env` (already included here with your existing DB/admin values) and fill in the email section:

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Reservation requests won't send until these are set. Any SMTP provider works (Gmail with an App Password, Zoho, Office365, etc.) - host/port/user/password is all `lib/mailer.js` needs.

## Run

```bash
npm run dev     # local development, http://localhost:3000
npm run build   # production build
npm start       # serve the production build on port 3000
```

## Deploying on the existing EC2/PM2 setup

This is a separate app from the old Express one (`../index.js`), so nothing is overwritten. To switch PM2 over to this version:

```bash
cd savoy-nextjs
npm install
npm run build
pm2 delete my-app        # stop the old Express process
pm2 start npm --name my-app -- start
pm2 save
```

Nginx/whatever reverse-proxies to port 3000 doesn't need to change - `npm start` still listens on port 3000.

## Notes

- Admin auth uses a signed, httpOnly session cookie (JWT via `jose`) instead of `express-session`/`passport`. Same username/password check against `.env`.
- File uploads (spreadsheet + thumbnails) are handled by Next.js Route Handlers directly (`request.formData()`) - no `multer`/temp-file cleanup needed for the spreadsheet; thumbnails still land in `public/images/menu/` and are served statically, same as before.
- `middleware.js` protects `/menu` and the admin API routes; unauthenticated requests get redirected to `/login` (pages) or a 401 (API).
