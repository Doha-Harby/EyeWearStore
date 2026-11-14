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

## Seed data (Phase 2)
`cd server && npm run seed` (local only; wipes users and catalog).
Admin: `admin@lumiere.test` / `Admin#12345` · Customers: `amelia@lumiere.test`, `omar@lumiere.test` / `Customer#123`.
Emails (verification, password reset) print in the server console unless `SMTP_*` is set (Ethereal/Mailtrap).

## Status
Done: setup, schemas + seed, auth, catalog, product detail, cart, checkout (Cash on Delivery), orders with transactional stock, admin dashboard (stats, revenue chart, recent orders, best sellers) and admin order management with a validated status workflow + audit log.
Not yet built: homepage, filter sidebar, wishlist, Stripe, admin product/customer/coupon/inventory screens, profile + addresses, reviews, advanced features, tests, API docs/Postman.
Admin area: sign in as admin@lumiere.test, then open /admin.

## Deploying (free-tier demo)
1. **Database:** MongoDB Atlas M0 cluster → copy the `mongodb+srv://...` URI (database name `lumiere`). Allow network access (Render has no fixed IP on the free plan, so use 0.0.0.0/0 with a strong DB password).
2. **API:** Render *Web Service* · root `server` · build `npm install` · start `npm start` · health check `/api/health`.
   Env: `NODE_ENV=production`, `MONGODB_URI`, `CLIENT_URL` (your site URL), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and real `SMTP_*` for emails.
3. **Site:** Render *Static Site* · root `client` · build `npm install && npm run build` · publish `dist`.
   Rewrite rules, in this order: `/api/*` → `https://YOUR-API.onrender.com/api/*` (Rewrite), then `/*` → `/index.html` (Rewrite).
   The API rewrite keeps browser and API on one origin, which the HttpOnly cookie auth needs.
4. **Seed once, from your laptop:** `MONGODB_URI="<atlas uri>" npm run seed` (NODE_ENV must NOT be production), then change the admin password.
