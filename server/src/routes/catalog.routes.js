import { Router } from 'express';
import * as c from '../controllers/catalog.controller.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema } from '../validators/product.validator.js';

const router = Router();
router.get('/products', validate({ query: productQuerySchema }), c.listProducts);
router.get('/products/:slug', c.getProduct);
router.get('/categories', c.listCategories);
router.get('/brands', c.listBrands);
export default router;
