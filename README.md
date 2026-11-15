# LUMIÈRE — Premium Eyewear E-Commerce

Vue 3 + Vite + Pinia + Tailwind (client) · Express + Mongoose (server). Built in phases; this is **Phase 1**.

## Run locally
```bash
docker compose up -d                 # MongoDB as a replica set (needed for transactions)
cd server && cp .env.example .env    # then set real JWT secrets (command inside the file)
npm install && npm run dev           # API  → http://localhost:5000/api/health
cd ../client && npm install && npm run dev   # App → http://localhost:5173
```
No Docker? Use a free MongoDB Atlas cluster and put its URI in `server/.env`.

Open http://localhost:5173/design-system — the "API connection" badges should turn green.

## Scripts
`npm run lint` · `npm run format` in either folder; `npm run build` in `client`.

## Conventions
- Server flow: `route → validate → controller → service → model`. Errors are thrown as `ApiError` and formatted in one place.
- API shape: `{ success: true, data, message?, meta? }` or `{ success: false, message, errors? }`.
- Client: pages in `views/`, layouts in `layouts/`, reusable UI in `components/common/`, API calls in `services/`.

## Demo data (`cd server && npm run seed`)
Local only: wipes the database and loads a consistent demo store. The same data is generated every run.
- **Accounts** (password in brackets):superadmin@lumiere.com (`SuperAdmin#Lumiere2026!`, super admin) · admin@lumiere.com (`Admin@Lumiere#4826`, admin) · customers customer@lumiere.com (`Customer$Lumiere731!`). `karim@lumiere.test` is deactivated and `noor@` has an unverified email, to show those states.
- **Catalog:** 24 products, 6 brands, 5 categories, each with 2 generated SVG images (`server/public/products`, regenerate with `node scripts/generate-images.js`). One product is low on stock, one sold out, some on sale.
- **Orders:** about 30 over the last 40 days, in every status (pending to refunded), Cash on Delivery and card, some with coupons, some with prescription lenses. Stock, inventory history, totals and coupon counts all add up.
- **Also:** ~30 reviews (verified and unverified, one hidden spam review), wishlists, saved addresses, 5 coupons (`WELCOME10`, `SUMMER15`, `FLAT20`, plus an expired and a disabled one), newsletter subscribers, restock and damage entries in the inventory log.
Emails (verification, reset, order confirmation) print in the server console unless `SMTP_*` is set.

## Testing
```bash
cd server && npm test     # 54 tests: business rules, validation, security, invoices, demo-data consistency (no database needed)
cd client && npm test     # 11 tests: cart store, shared components
```
API reference: `docs/API.md`. Import `docs/lumiere.postman_collection.json` into Postman (log in once; cookies are kept automatically).
Regenerate both after adding an endpoint: `cd server && node scripts/generate-docs.js`.

## Card payments (Stripe test mode, optional)
1. Create a free Stripe account, switch to **Test mode**, copy the secret key into `server/.env` as `STRIPE_SECRET_KEY`.
2. Install the Stripe CLI and run `stripe listen --forward-to localhost:5000/api/webhooks/stripe`; put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`. Restart the API.
3. Checkout now offers "Credit or debit card". Pay with test card `4242 4242 4242 4242`, any future date, any CVC.
Flow: the order is created first (stock reserved), then Stripe's page takes payment; the webhook marks it paid. Unpaid orders release their stock after 30 minutes. Admin cancel/refund on a paid card order refunds through Stripe. Without the keys, only Cash on Delivery appears.

## Status
Done: auth, homepage, shop (full filters, grid/list), product page (zoom, camera try-on preview, prescription lenses, related, recently viewed, reviews), wishlist, cart, checkout (Cash on Delivery or Stripe), transactional orders and stock, order confirmation + low-stock emails, invoice PDFs, customer account (profile, password, addresses, orders), full admin area (dashboard, orders workflow with refunds, products, customers/roles, coupons, inventory, reviews), audit log.
Not yet built: face-tracked frame overlay for try-on (camera + integration point are in place), prescription image upload, product comparison and personalised recommendations, admin store settings, Cloudinary uploads (products take image URLs), page-level component tests, end-to-end tests against a real database.
Admin area: sign in as admin@lumiere.test, then open /admin.

## Deploying on Vercel (one project, frontend + API on the same domain)
Uses **Vercel Services** (Beta): `vercel.json` at the repo root defines two services, `web` (`client/`, a Vite app) and `api` (`server/`, the Express app, detected from `src/app.js`). `/api/*` goes to the API, everything else to the frontend. One domain means the HttpOnly cookie login works with no CORS setup.

1. **Database:** MongoDB Atlas free cluster. Create a database user, allow network access from `0.0.0.0/0` (Vercel has no fixed IPs; use a strong password), and copy the `mongodb+srv://.../lumiere` connection string.
2. **Demo data (optional, from your laptop):** `cd server && MONGODB_URI="<atlas uri>" npm run seed` (wipes that database; NODE_ENV must not be production). Then change the admin password.
3. **GitHub:** push this folder (the one containing `vercel.json`, `client/` and `server/`).
4. **Vercel:** *Add New > Project*, import the repo, keep the Root Directory as the repo root, and under *Settings > Build and Deployment* set **Framework Preset = Services**.
5. **Environment variables** (Settings > Environment Variables): `NODE_ENV=production`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (two different 48+ byte random strings), `CLIENT_URL` (your deployed URL, e.g. `https://your-app.vercel.app`; set it after the first deploy, then redeploy), and optionally `SMTP_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_EMAIL`.
6. **Deploy**, then open `https://<your-app>.vercel.app/api/health` (should show `"database": "connected"`) and the site.
7. **Stripe (optional):** webhook endpoint `https://<your-app>.vercel.app/api/webhooks/stripe`; test it with Stripe's "Send test event" before relying on it.

Notes: the API connects to MongoDB on the first request after a cold start (about a second slower). Rate limits are counted per running instance. Vercel's free Hobby plan is intended for personal, non-commercial use, so check their terms before running a real store on it.
Troubleshooting: "doesn't build as services" means the Framework Preset isn't Services; a 404 when refreshing `/shop` means the SPA fallback isn't applied (the build also writes `404.html` as a backup); `503 Service temporarily unavailable` means MongoDB can't be reached (check `MONGODB_URI` and the Atlas IP allow-list); if the API isn't detected, add `"entrypoint": "src/app.js"` to the `api` service in `vercel.json`.
Product images are static files in `client/public/products` (regenerate with `cd server && node scripts/generate-images.js`). After upgrading from an older version, re-run `npm run seed` so image URLs point to `/products/...`.

## Other hosts
Any Node host works for the API (`npm start` in `server/`, health check `/api/health`) with a static host for `client/dist`, as long as `/api/*` is proxied to the API on the same domain.
