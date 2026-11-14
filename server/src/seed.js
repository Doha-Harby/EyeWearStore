import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Brand, Category } from './models/Catalog.js';
import { Coupon, InventoryTransaction } from './models/Misc.js';

/** Local development only. Wipes catalog + users, then recreates demo data. Run: npm run seed */
if (env.isProd) throw new Error('Refusing to seed in production');
const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Tortoise', hex: '#7b4a2d' },
  { name: 'Gold', hex: '#C6A76B' },
  { name: 'Silver', hex: '#b8b8b8' },
  { name: 'Navy', hex: '#1f2d4d' },
  { name: 'Clear', hex: '#e8e4dc' },
];
const BRANDS = [
  'LUMIÈRE',
  'Maison Vérre',
  'Atelier Nord',
  'Costa Blanca',
  'Kiyo Optical',
  'Hartwell & Co',
];
const CATEGORIES = [
  'Sunglasses',
  'Eyeglasses',
  'Blue Light Glasses',
  'Reading Glasses',
  'Accessories',
];
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

await connectDB();
await Promise.all(
  [User, Product, Brand, Category, Coupon, InventoryTransaction].map((m) => m.deleteMany({})),
);

await User.create([
  {
    name: 'Store Admin',
    email: 'admin@lumiere.test',
    password: 'Admin#12345',
    role: 'superadmin',
    emailVerified: true,
  },
  {
    name: 'Amelia Hart',
    email: 'amelia@lumiere.test',
    password: 'Customer#123',
    emailVerified: true,
  },
  { name: 'Omar Said', email: 'omar@lumiere.test', password: 'Customer#123', emailVerified: true },
]);
const brands = await Brand.create(BRANDS.map((name) => ({ name, slug: slug(name) })));
const cats = await Category.create(CATEGORIES.map((name) => ({ name, slug: slug(name) })));

const products = await Product.create(
  ROWS.map(([name, c, shape, material, gender, price], i) => ({
    name: `${name} ${CATEGORIES[c].split(' ')[0].replace(/s$/, '')}`,
    slug: slug(`${name}-${CATEGORIES[c]}`),
    sku: `LUM-${String(i + 1).padStart(3, '0')}`,
    description: `${name}: a considered ${shape ?? 'accessory'} design in ${material.toLowerCase()}, finished by hand.`,
    brand: brands[i % brands.length]._id,
    category: cats[c]._id,
    price,
    discountPrice: i % 5 === 0 ? Math.round(price * 0.85) : undefined,
    stock: i % 9 === 0 ? 3 : 12 + i,
    frameShape: shape,
    frameMaterial: material,
    gender,
    colors: [COLORS[i % 6], COLORS[(i + 2) % 6]],
    dimensions: { lens: 50 + (i % 5), bridge: 18, temple: 140 },
    images: [], // add image URLs here; the UI shows an elegant SVG fallback when empty
    featured: i % 4 === 0,
    sold: (i * 7) % 40,
  })),
);
await InventoryTransaction.insertMany(
  products.map((p) => ({ product: p._id, delta: p.stock, reason: 'seed' })),
);
await Coupon.create({ code: 'WELCOME10', type: 'percent', value: 10, minOrder: 50 });

console.log(`Seeded ${products.length} products. Admin: admin@lumiere.test / Admin#12345`);
await disconnectDB();
