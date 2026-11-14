import { Product } from '../models/Product.js';
import { Brand, Category } from '../models/Catalog.js';
import { ApiError } from '../utils/ApiError.js';

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { sold: -1 },
};
const list = (v) => ({ $in: v.split(',') });

/** Filtering, sorting and pagination all happen in MongoDB, so the page never downloads the whole catalog. */
export async function listProducts(q) {
  const filter = { isActive: true, deletedAt: null };
  if (q.q) filter.$text = { $search: q.q };
  if (q.category)
    filter.category = { $in: await Category.find({ slug: q.category }).distinct('_id') };
  if (q.brand) filter.brand = { $in: await Brand.find({ slug: list(q.brand) }).distinct('_id') };
  if (q.shape) filter.frameShape = list(q.shape);
  if (q.material) filter.frameMaterial = list(q.material);
  if (q.gender) filter.gender = list(q.gender);
  if (q.color) filter['colors.name'] = list(q.color);
  if (q.minPrice != null || q.maxPrice != null)
    filter.price = {
      ...(q.minPrice != null && { $gte: q.minPrice }),
      ...(q.maxPrice != null && { $lte: q.maxPrice }),
    };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[q.sort])
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);
  return {
    items,
    meta: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) },
  };
}

/** Same-category products, best sellers first. Powers the "You may also like" row. */
export async function getRelated(slug) {
  const p = await Product.findOne({ slug, isActive: true, deletedAt: null }).select('category');
  if (!p) throw ApiError.notFound('Product not found');
  return Product.find({
    category: p.category,
    _id: { $ne: p._id },
    isActive: true,
    deletedAt: null,
  })
    .sort({ sold: -1 })
    .limit(4)
    .populate('brand', 'name slug')
    .lean();
}

export async function getProductBySlug(slug) {
  const p = await Product.findOne({ slug, isActive: true, deletedAt: null })
    .populate('brand category')
    .lean();
  if (!p) throw ApiError.notFound('Product not found');
  return p;
}
