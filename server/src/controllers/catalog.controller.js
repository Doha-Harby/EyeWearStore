import * as products from '../services/product.service.js';
import { Brand, Category } from '../models/Catalog.js';
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
