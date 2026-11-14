# LUMIÈRE API

Base URL: `http://localhost:5000/api` · Responses: `{ success, data, message?, meta? }` or `{ success: false, message, errors? }`.
Auth uses HttpOnly cookies set by `/auth/login`; use Postman's cookie jar (automatic) or a browser. Access: **public**, **user** (signed in), **owner** (own resource), **admin** (admin or superadmin).

## System

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/health` | public | API and database status |

## Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create a customer account (role cannot be chosen) and sign in |
| POST | `/auth/login` | public | Sign in; sets HttpOnly accessToken + refreshToken cookies |
| POST | `/auth/refresh` | cookie | Rotate the refresh token and issue a new access token |
| POST | `/auth/logout` | cookie | Revoke the refresh token and clear cookies |
| GET | `/auth/me` | user | Current user |
| POST | `/auth/verify-email` | public | Confirm an email address |
| POST | `/auth/forgot-password` | public | Send a reset link (same response for unknown emails) |
| POST | `/auth/reset-password` | public | Set a new password; signs out all devices |

## Catalog

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/products?q=&category=&brand=&shape=&material=&gender=&color=&minPrice=&maxPrice=&sort=newest&page=1&limit=12` | public | Filtered, sorted, paginated products |
| GET | `/products/:slug` | public | Product details |
| GET | `/categories` | public | All categories |
| GET | `/brands` | public | All brands |
| POST | `/newsletter` | public | Subscribe to the newsletter |
| GET | `/products/:slug/related` | public | Related products (same category, best sellers first) |

## Reviews

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/products/:id/reviews` | public | Visible reviews for a product |
| POST | `/products/:id/reviews` | user | Post a review (verified-purchase badge if a delivered order contains it) |
| PUT | `/reviews/:id` | owner | Edit your review |
| DELETE | `/reviews/:id` | owner/admin | Delete a review |

## Orders

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/orders` | user | Place an order (transaction; server-side prices and stock) |
| GET | `/orders/my-orders` | user | Your orders |
| GET | `/orders/:id` | owner/admin | One order (ownership enforced) |
| POST | `/orders/:id/cancel` | owner/admin | Cancel a pending/confirmed order and restore stock |
| POST | `/coupons/validate` | user | Preview a coupon discount |
| GET | `/orders/:id/invoice` | owner/admin | Invoice as a PDF |

## Account

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/wishlist` | user | Saved products |
| POST | `/wishlist/:productId` | user | Add to wishlist |
| DELETE | `/wishlist/:productId` | user | Remove from wishlist |
| PATCH | `/account/profile` | user | Update profile |
| POST | `/account/password` | user | Change password |
| GET | `/account/addresses` | user | Saved addresses |
| POST | `/account/addresses` | user | Add an address |
| PUT | `/account/addresses/:id` | user | Edit an address |
| DELETE | `/account/addresses/:id` | user | Delete an address |

## Admin

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | admin | Stats, 14-day revenue, recent orders, best sellers |
| GET | `/admin/orders?status=&q=&page=1` | admin | All orders |
| PATCH | `/admin/orders/:id/status` | admin | Move an order along its workflow (illegal moves rejected) |
| GET | `/admin/products?q=&deleted=false&page=1` | admin | Products (or the trash) |
| POST | `/admin/products` | admin | Create a product |
| PUT | `/admin/products/:id` | admin | Edit a product (stock excluded) |
| DELETE | `/admin/products/:id` | admin | Soft-delete (move to trash) |
| POST | `/admin/products/:id/restore` | admin | Restore from trash |
| POST | `/admin/products/:id/stock` | admin | Adjust stock (logged) |
| GET | `/admin/customers?q=&page=1` | admin | Users |
| PATCH | `/admin/customers/:id` | admin/superadmin | Activate/deactivate; role changes need superadmin |
| GET | `/admin/coupons` | admin | Coupons |
| POST | `/admin/coupons` | admin | Create a coupon |
| PATCH | `/admin/coupons/:id` | admin | Edit/toggle a coupon |
| DELETE | `/admin/coupons/:id` | admin | Delete a coupon |
| GET | `/admin/inventory` | admin | Low stock + movement history |
| GET | `/admin/reviews?page=1` | admin | All reviews |
| PATCH | `/admin/reviews/:id` | admin | Hide or show a review |
| DELETE | `/admin/reviews/:id` | admin | Delete a review |

## Payments

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/payments/config` | public | Whether card payments are enabled |
| POST | `/payments/orders/:id/session` | owner | Start a Stripe Checkout session; returns { url } |
| POST | `/webhooks/stripe` | Stripe signature | Stripe webhook (raw body, signature verified): marks orders paid or releases stock when a session expires |
