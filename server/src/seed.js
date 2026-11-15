import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Brand, Category } from './models/Catalog.js';
import { Order } from './models/Order.js';
import {
  Address,
  AuditLog,
  Coupon,
  InventoryTransaction,
  NewsletterSubscriber,
  RefreshToken,
  Review,
  Wishlist,
} from './models/Misc.js';
import { buildSeedData, CATALOG } from './seedData.js';
import { writeProductImages } from './utils/productImages.js';

/** Local development only. Wipes everything, then loads demo data. Run: npm run seed */
if (env.isProd) throw new Error('Refusing to seed in production');

const d = buildSeedData();
await connectDB();
await Promise.all(
  [
    User,
    Product,
    Brand,
    Category,
    Coupon,
    InventoryTransaction,
    Order,
    Review,
    Wishlist,
    Address,
    NewsletterSubscriber,
    RefreshToken,
    AuditLog,
  ].map((m) => m.deleteMany({})),
);

writeProductImages(CATALOG);
await User.create(d.users); // create() (not insertMany) so the password-hashing hook runs
await Promise.all([
  Brand.insertMany(d.brands),
  Category.insertMany(d.categories),
  Coupon.insertMany(d.coupons),
  NewsletterSubscriber.insertMany(d.subscribers),
]);
await Product.insertMany(d.products);
await Promise.all([Address.insertMany(d.addresses), Wishlist.insertMany(d.wishlists)]);
await Order.insertMany(d.orders);
await Promise.all([InventoryTransaction.insertMany(d.inventory), Review.insertMany(d.reviews)]);

const by = (k) => d.orders.reduce((m, o) => ({ ...m, [o[k]]: (m[o[k]] || 0) + 1 }), {});
console.log(
  `Seeded: ${d.users.length} users, ${d.products.length} products, ${d.orders.length} orders ${JSON.stringify(by('status'))}, ${d.reviews.length} reviews, ${d.coupons.length} coupons.`,
);
console.log(
  'Admin: admin@lumiere.test / Admin#12345  ·  Staff: staff@lumiere.test / Staff#12345  ·  Customers: <name>@lumiere.test / Customer#123 (amelia, omar, layla, youssef, sara, daniel, mariam, noor, chloe; karim is deactivated)',
);
await disconnectDB();
