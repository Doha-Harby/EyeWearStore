// Regenerates the product SVGs in server/public/products (no database needed): node scripts/generate-images.js
import { CATALOG } from '../src/seedData.js';
import { writeProductImages } from '../src/utils/productImages.js';

console.log(`Wrote ${writeProductImages(CATALOG)} product images`);
