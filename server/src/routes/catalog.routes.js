import { Router } from 'express';
import * as c from '../controllers/catalog.controller.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema, newsletterSchema } from '../validators/product.validator.js';

const router = Router();
router.get('/products', validate({ query: productQuerySchema }), c.listProducts);
router.get('/products/:slug/related', c.getRelated);
router.get('/products/:slug', c.getProduct);
router.get('/categories', c.listCategories);
router.get('/brands', c.listBrands);
router.post('/newsletter', validate({ body: newsletterSchema }), c.subscribe);
export default router;
