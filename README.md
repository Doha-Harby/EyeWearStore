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
- **Accounts** (password in brackets): admin@lumiere.test (`Admin#12345`, super admin) · staff@lumiere.test (`Staff#12345`, admin) · customers `amelia`, `omar`, `layla`, `youssef`, `sara`, `daniel`, `mariam`, `noor`, `chloe` @lumiere.test (`Customer#123`). `karim@lumiere.test` is deactivated and `noor@` has an unverified email, to show those states.
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

## Deploying (free-tier demo)
1. **Database:** MongoDB Atlas M0 cluster → copy the `mongodb+srv://...` URI (database name `lumiere`). Allow network access (Render has no fixed IP on the free plan, so use 0.0.0.0/0 with a strong DB password).
2. **API:** Render *Web Service* · root `server` · build `npm install` · start `npm start` · health check `/api/health`.
   Env: `NODE_ENV=production`, `MONGODB_URI`, `CLIENT_URL` (your site URL), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and real `SMTP_*` for emails.
3. **Site:** Render *Static Site* · root `client` · build `npm install && npm run build` · publish `dist`.
   Rewrite rules, in this order: `/api/*` → `https://YOUR-API.onrender.com/api/*` (Rewrite), then `/*` → `/index.html` (Rewrite).
   The API rewrite keeps browser and API on one origin, which the HttpOnly cookie auth needs.
4. **Seed once, from your laptop:** `MONGODB_URI="<atlas uri>" npm run seed` (NODE_ENV must NOT be production), then change the admin password.
