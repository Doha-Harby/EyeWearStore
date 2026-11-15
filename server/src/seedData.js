import mongoose from 'mongoose';
import { slugify } from './utils/slug.js';
import { imageUrls } from './utils/productImages.js';

export const BRANDS = [
  'LUMIÈRE',
  'Maison Vérre',
  'Atelier Nord',
  'Costa Blanca',
  'Kiyo Optical',
  'Hartwell & Co',
];
export const CATEGORIES = [
  'Sunglasses',
  'Eyeglasses',
  'Blue Light Glasses',
  'Reading Glasses',
  'Accessories',
];
export const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Tortoise', hex: '#7b4a2d' },
  { name: 'Gold', hex: '#C6A76B' },
  { name: 'Silver', hex: '#b8b8b8' },
  { name: 'Navy', hex: '#1f2d4d' },
  { name: 'Clear', hex: '#e8e4dc' },
];
const SUFFIX = [' Sunglasses', ' Optical', ' Blue Light', ' Reader', ''];
// [name, category index, shape, material, gender, price]
const ROWS = [
  ['Aurelia', 0, 'aviator', 'Metal', 'unisex', 189],
  ['Riviera', 0, 'wayfarer', 'Acetate', 'men', 165],
  ['Seraphine', 0, 'cat-eye', 'Acetate', 'women', 205],
  ['Meridian', 0, 'round', 'Titanium', 'unisex', 249],
  ['Corsica', 0, 'oval', 'Acetate', 'women', 175],
  ['Montauk', 0, 'square', 'Acetate', 'men', 155],
  ['Belvedere', 0, 'aviator', 'Titanium', 'men', 289],
  ['Solène', 0, 'cat-eye', 'Metal', 'women', 219],
  ['Oxford', 1, 'round', 'Acetate', 'unisex', 195],
  ['Chelsea', 1, 'rectangle', 'Metal', 'men', 185],
  ['Florence', 1, 'oval', 'Acetate', 'women', 179],
  ['Kensington', 1, 'square', 'Titanium', 'men', 275],
  ['Parisienne', 1, 'cat-eye', 'Acetate', 'women', 199],
  ['Bauhaus', 1, 'rectangle', 'Titanium', 'unisex', 259],
  ['Lisbon', 1, 'round', 'Metal', 'unisex', 169],
  ['Atlas', 1, 'wayfarer', 'Acetate', 'men', 189],
  ['Lumen', 2, 'round', 'Acetate', 'unisex', 119],
  ['Pixel', 2, 'rectangle', 'Acetate', 'men', 109],
  ['Halo', 2, 'oval', 'Metal', 'women', 125],
  ['Nocturne', 2, 'square', 'Acetate', 'unisex', 115],
  ['Folio', 3, 'rectangle', 'Acetate', 'unisex', 79],
  ['Marginalia', 3, 'round', 'Metal', 'unisex', 85],
  ['Leather Case', 4, undefined, 'Leather', 'unisex', 49],
  ['Microfibre Cloth Set', 4, undefined, 'Textile', 'unisex', 19],
];
/** Everything about a product that doesn't need a database id. Also feeds the image generator. */
export const CATALOG = ROWS.map(([name, c, shape, material, gender, price], i) => {
  const display = name + SUFFIX[c];
  return {
    name: display,
    slug: slugify(display),
    category: CATEGORIES[c],
    c,
    shape,
    material,
    gender,
    price,
    colors: [COLORS[i % 6], COLORS[(i + 2) % 6]],
    color: COLORS[i % 6].hex,
  };
});

// name, email, city, country, phone
const CUSTOMERS = [
  ['Amelia Hart', 'amelia@lumiere.test', 'Alexandria', 'Egypt', '+20 100 555 0101'],
  ['Omar Said', 'omar@lumiere.test', 'Cairo', 'Egypt', '+20 111 555 0102'],
  ['Layla Kamel', 'layla@lumiere.test', 'Giza', 'Egypt', '+20 122 555 0103'],
  ['Youssef Nabil', 'youssef@lumiere.test', 'Cairo', 'Egypt', '+20 100 555 0104'],
  ['Sara Mansour', 'sara@lumiere.test', 'Dubai', 'United Arab Emirates', '+971 50 555 0105'],
  ['Daniel Moore', 'daniel@lumiere.test', 'London', 'United Kingdom', '+44 7700 900106'],
  ['Mariam Adel', 'mariam@lumiere.test', 'Cairo', 'Egypt', '+20 112 555 0107'],
  ['Karim Fouad', 'karim@lumiere.test', 'Alexandria', 'Egypt', '+20 106 555 0108'],
  ['Noor Haddad', 'noor@lumiere.test', 'Amman', 'Jordan', '+962 79 555 0109'],
  ['Chloé Martin', 'chloe@lumiere.test', 'Paris', 'France', '+33 6 12 34 56 10'],
];
const STREETS = [
  'Corniche Road',
  'Nile Street',
  'Tahrir Square',
  'Zamalek Avenue',
  'Abdel Aziz Street',
  'Garden City Road',
  'Mohandessin Street',
  'Victoria Road',
];
const REVIEW_TEXT = {
  good: [
    [
      'Beautiful frames',
      'Lightweight, well finished and exactly as pictured. I get compliments every week.',
    ],
    ['Worth every penny', 'The acetate feels premium and the fit is spot on.'],
    ['Superb quality', 'Lovely packaging and frames that feel built to last.'],
    ['My new favourite', 'Comfortable all day. I forget I am wearing them.'],
  ],
  ok: [
    ['Good, with small quibbles', 'Lovely design, though the nose pads needed a little adjusting.'],
    ['Nice but pricey', 'Great quality. I just wish a case was included.'],
  ],
  bad: [
    [
      'Not quite for me',
      'The fit was tighter than I expected. Support was helpful with the return.',
    ],
  ],
};
const NEWSLETTER = [
  'hana.mostafa',
  'tarek.ali',
  'nadine.k',
  'omar.samy',
  'lina.w',
  'ahmed.r',
  'dina.sh',
  'mark.t',
  'julia.b',
  'ziad.m',
  'rania.f',
  'sam.d',
].map((n) => `${n}@example.com`);

const DAY = 864e5;
const oid = () => new mongoose.Types.ObjectId();
const round = (n) => Math.round(n * 100) / 100;

/**
 * Builds a complete, internally consistent demo dataset as plain objects (no database needed).
 * It uses a seeded random generator, so every run produces the same data. Stock, inventory history,
 * order totals, coupon usage and ratings all add up, and tests verify that.
 */
export function buildSeedData(now = Date.now()) {
  let seed = 20260101;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const at = (daysAgo, hours = 0) => new Date(now - daysAgo * DAY - hours * 36e5);

  const brands = BRANDS.map((name) => ({ _id: oid(), name, slug: slugify(name) }));
  const categories = CATEGORIES.map((name) => ({ _id: oid(), name, slug: slugify(name) }));

  const admin = {
    _id: oid(),
    name: 'Store Admin',
    email: 'admin@lumiere.test',
    password: 'Admin#12345',
    role: 'superadmin',
    emailVerified: true,
    createdAt: at(90),
  };
  const staff = {
    _id: oid(),
    name: 'Nadia Staff',
    email: 'staff@lumiere.test',
    password: 'Staff#12345',
    role: 'admin',
    emailVerified: true,
    createdAt: at(80),
  };
  const customers = CUSTOMERS.map(([name, email, , , phone]) => ({
    _id: oid(),
    name,
    email,
    phone,
    password: 'Customer#123',
    role: 'customer',
    emailVerified: email !== 'noor@lumiere.test',
    isActive: email !== 'karim@lumiere.test',
    createdAt: at(int(12, 75)),
  }));
  const users = [admin, staff, ...customers];

  const addresses = customers.map((u, k) => ({
    _id: oid(),
    user: u._id,
    label: 'Home',
    fullName: u.name,
    phone: u.phone,
    line1: `${int(1, 120)} ${pick(STREETS)}`,
    city: CUSTOMERS[k][2],
    postalCode: String(int(10000, 99999)),
    country: CUSTOMERS[k][3],
    isDefault: true,
  }));
  const addressOf = new Map(addresses.map((a) => [String(a.user), a]));

  const products = CATALOG.map((c, i) => ({
    _id: oid(),
    name: c.name,
    slug: c.slug,
    sku: `LUM-${String(i + 1).padStart(3, '0')}`,
    description: c.shape
      ? `${c.name}: a considered ${c.shape.replace('-', ' ')} design in ${c.material.toLowerCase()}, finished by hand. ${c.c === 0 ? 'Fitted with UV400 lenses.' : 'Made to be worn every day.'}`
      : `${c.name}: a refined essential to keep your eyewear pristine.`,
    brand: brands[i % brands.length]._id,
    category: categories[c.c]._id,
    price: c.price,
    discountPrice: i % 5 === 0 ? round(c.price * 0.85) : undefined,
    stock: i % 9 === 0 ? 8 : 30 + (i % 7) * 5,
    frameShape: c.shape,
    frameMaterial: c.material,
    gender: c.gender,
    colors: c.colors,
    dimensions: { lens: 50 + (i % 5), bridge: 18, temple: 140 },
    images: imageUrls(c.slug),
    featured: i % 4 === 0,
    sold: (i * 3) % 15,
    createdAt: at(70 - i * 2),
  }));
  const stock = products.map((p) => p.stock);
  const sold = products.map((p) => p.sold);
  const txs = products.map((p) => ({
    _id: oid(),
    product: p._id,
    delta: p.stock,
    reason: 'seed',
    createdAt: at(75),
  }));

  const coupons = [
    {
      _id: oid(),
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrder: 50,
      usedCount: 0,
      isActive: true,
    },
    {
      _id: oid(),
      code: 'SUMMER15',
      type: 'percent',
      value: 15,
      minOrder: 100,
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    },
    {
      _id: oid(),
      code: 'FLAT20',
      type: 'fixed',
      value: 20,
      minOrder: 120,
      usedCount: 0,
      isActive: true,
    },
    {
      _id: oid(),
      code: 'EXPIRED5',
      type: 'percent',
      value: 5,
      minOrder: 0,
      expiresAt: at(10),
      usedCount: 0,
      isActive: true,
    },
    {
      _id: oid(),
      code: 'BLACKFRI25',
      type: 'percent',
      value: 25,
      minOrder: 150,
      usageLimit: 50,
      usedCount: 0,
      isActive: false,
    },
  ];
  const usable = coupons.slice(0, 3);

  // ----- orders: spread over 40 days, status depends on age so the story makes sense -----
  const orders = [];
  for (let n = 0; n < 32; n++) {
    const user = pick(customers);
    const ageDays = Math.floor(Math.pow(rand(), 1.6) * 40);
    const createdAt = at(ageDays, int(0, 20));
    const used = new Set();
    const lines = [];
    const count = int(1, 3);
    for (let k = 0; k < count; k++) {
      const choices = products.map((_, i) => i).filter((i) => stock[i] > 0 && !used.has(i));
      if (!choices.length) break;
      const i = pick(choices);
      const qty = Math.min(int(1, 2), stock[i]);
      used.add(i);
      lines.push({ i, qty });
    }
    if (!lines.length) continue;

    const method = rand() < 0.4 ? 'stripe' : 'cod';
    let status;
    if (ageDays < 1) status = 'pending';
    else if (ageDays < 3) status = pick(['confirmed', 'confirmed', 'processing']);
    else if (ageDays < 8) status = pick(['processing', 'shipped', 'shipped', 'delivered']);
    else
      status = pick(['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'refunded']);
    if (method === 'stripe' && status === 'pending' && ageDays >= 1) status = 'confirmed'; // unpaid card orders expire after 30 minutes
    if (method === 'cod' && status === 'refunded') status = 'delivered';
    let paymentStatus = 'unpaid';
    if (method === 'cod' && status === 'delivered') paymentStatus = 'paid';
    if (method === 'stripe' && !['pending', 'cancelled'].includes(status))
      paymentStatus = status === 'refunded' ? 'refunded' : 'paid';

    const items = lines.map(({ i, qty }) => {
      const p = products[i];
      const item = {
        product: p._id,
        name: p.name,
        sku: p.sku,
        image: p.images[0],
        color: p.colors[0].name,
        price: p.discountPrice ?? p.price,
        qty,
      };
      if (CATALOG[i].c === 1 && rand() < 0.35)
        item.prescription = {
          type: 'single-vision',
          coating: pick(['none', 'anti-reflective', 'blue-light']),
          od: { sph: -int(2, 16) / 4, cyl: pick([0, -0.5, -0.75]), axis: int(0, 180) },
          os: { sph: -int(2, 16) / 4, cyl: 0 },
          pd: int(58, 68),
        };
      return item;
    });
    const subtotal = round(items.reduce((t, l) => t + l.price * l.qty, 0));
    let discount = 0;
    let couponCode;
    const eligible = usable.filter((c) => subtotal >= c.minOrder);
    if (eligible.length && rand() < 0.35) {
      const c = pick(eligible);
      discount = round(
        c.type === 'percent' ? (subtotal * c.value) / 100 : Math.min(c.value, subtotal),
      );
      couponCode = c.code;
      c.usedCount++;
    }
    const shippingMethod = pick(['standard', 'standard', 'express']);
    const shippingCost = subtotal >= 150 ? 0 : shippingMethod === 'express' ? 20 : 8;
    const a = addressOf.get(String(user._id));
    const order = {
      _id: oid(),
      user: user._id,
      items,
      shippingAddress: {
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        city: a.city,
        postalCode: a.postalCode,
        country: a.country,
      },
      shippingMethod,
      paymentMethod: method,
      paymentStatus,
      status,
      subtotal,
      discount,
      shippingCost,
      total: round(subtotal - discount + shippingCost),
      couponCode,
      ...(method === 'stripe' && paymentStatus !== 'unpaid' && { paymentRef: `pi_seed_${n}` }),
      createdAt,
      updatedAt: createdAt,
    };
    orders.push(order);
    for (const { i, qty } of lines) {
      txs.push({
        _id: oid(),
        product: products[i]._id,
        delta: -qty,
        reason: 'order',
        order: order._id,
        createdAt,
      });
      if (status === 'cancelled')
        txs.push({
          _id: oid(),
          product: products[i]._id,
          delta: qty,
          reason: 'cancel',
          order: order._id,
          createdAt: new Date(createdAt.getTime() + DAY),
        });
      else {
        stock[i] -= qty;
        sold[i] += qty;
      }
    }
  }
  orders
    .sort((x, y) => x.createdAt - y.createdAt)
    .forEach((o, k) => (o.orderNumber = `LUM-${10001 + k}`));

  // ----- manual stock movements by staff (restocks, damage, a sold-out product) -----
  const adjust = (i, delta, reason, note, daysAgo) => {
    if (delta === 0 || stock[i] + delta < 0) return;
    stock[i] += delta;
    txs.push({
      _id: oid(),
      product: products[i]._id,
      delta,
      reason,
      admin: staff._id,
      note,
      createdAt: at(daysAgo),
    });
  };
  adjust(1, 12, 'restock', 'Supplier delivery', 6);
  adjust(7, 10, 'restock', 'Supplier delivery', 3);
  adjust(14, -2, 'adjustment', 'Damaged in transit', 2);
  adjust(3, -stock[3], 'adjustment', 'Recount: batch withdrawn', 1); // leaves Meridian sold out
  products.forEach((p, i) => {
    p.stock = stock[i];
    p.sold = sold[i];
  });

  // ----- reviews: verified ones come from delivered orders, plus a few unverified and one hidden spam review -----
  const reviews = [];
  const seen = new Set();
  const bought = new Set();
  const addReview = (user, product, rating, createdAt, verified, extra = {}) => {
    const [title, comment] = pick(
      rating >= 4 ? REVIEW_TEXT.good : rating === 3 ? REVIEW_TEXT.ok : REVIEW_TEXT.bad,
    );
    seen.add(`${user}:${product}`);
    reviews.push({
      _id: oid(),
      user,
      product,
      rating,
      title,
      comment,
      verifiedPurchase: verified,
      isHidden: false,
      createdAt,
      updatedAt: createdAt,
      ...extra,
    });
  };
  const rating = () => {
    const r = rand();
    return r < 0.5 ? 5 : r < 0.8 ? 4 : r < 0.92 ? 3 : r < 0.97 ? 2 : 1;
  };
  for (const o of orders.filter((x) => x.status === 'delivered')) {
    for (const it of o.items) {
      bought.add(`${o.user}:${it.product}`);
      if (rand() < 0.6 && !seen.has(`${o.user}:${it.product}`))
        addReview(
          o.user,
          it.product,
          rating(),
          new Date(Math.min(now, o.createdAt.getTime() + 6 * DAY)),
          true,
        );
    }
  }
  for (let k = 0; k < 14; k++) {
    const u = pick(customers)._id;
    const p = pick(products)._id;
    if (!seen.has(`${u}:${p}`) && !bought.has(`${u}:${p}`))
      addReview(u, p, rating(), at(int(1, 30)), false);
  }
  // One hidden spam review, so the admin's moderation screen has something to show.
  const spamUser = customers[6]._id;
  const spamProduct = products.find(
    (p) => !seen.has(`${spamUser}:${p._id}`) && !bought.has(`${spamUser}:${p._id}`),
  )._id;
  addReview(spamUser, spamProduct, 5, at(2), false, {
    isHidden: true,
    title: 'Great',
    comment: 'Visit my site for cheap glasses!!!',
  });
  for (const p of products) {
    const mine = reviews.filter((r) => String(r.product) === String(p._id) && !r.isHidden);
    p.ratingCount = mine.length;
    p.ratingAvg = mine.length
      ? Math.round((mine.reduce((t, r) => t + r.rating, 0) / mine.length) * 10) / 10
      : 0;
  }

  const wishlists = customers.map((u) => ({
    _id: oid(),
    user: u._id,
    products: Array.from(new Set(Array.from({ length: int(2, 5) }, () => pick(products)._id))),
  }));
  const subscribers = NEWSLETTER.map((email, k) => ({ _id: oid(), email, createdAt: at(k * 3) }));

  return {
    brands,
    categories,
    users,
    addresses,
    products,
    coupons,
    orders,
    inventory: txs,
    reviews,
    wishlists,
    subscribers,
  };
}
