import * as products from '../services/product.service.js';
import { Brand, Category } from '../models/Catalog.js';
import { NewsletterSubscriber } from '../models/Misc.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await products.listProducts(req.query);
  sendSuccess(res, items, { meta });
});
export const getProduct = asyncHandler(async (req, res) =>
  sendSuccess(res, await products.getProductBySlug(req.params.slug)),
);
export const listCategories = asyncHandler(async (_req, res) =>
  sendSuccess(res, await Category.find().sort('name').lean()),
);
export const listBrands = asyncHandler(async (_req, res) =>
  sendSuccess(res, await Brand.find().sort('name').lean()),
);
export const subscribe = asyncHandler(async (req, res) => {
  // Upsert: subscribing twice is harmless and reveals nothing about who is already subscribed.
  await NewsletterSubscriber.updateOne(
    { email: req.body.email },
    { $setOnInsert: { email: req.body.email } },
    { upsert: true },
  );
  sendSuccess(res, null, { status: 201, message: 'Thank you for subscribing' });
});
export const getRelated = asyncHandler(async (req, res) =>
  sendSuccess(res, await products.getRelated(req.params.slug)),
);
