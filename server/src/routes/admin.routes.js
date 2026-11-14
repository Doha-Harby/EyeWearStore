import {
  listQuery,
  customerPatch,
  couponInput,
  couponPatch,
  hideSchema,
} from '../validators/admin.validator.js';
import { deleteReview } from '../controllers/account.controller.js';
import { Router } from 'express';
import * as c from '../controllers/admin.controller.js';
import { requireAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminOrdersQuery,
  statusSchema,
  productInput,
  stockSchema,
  adminProductsQuery,
} from '../validators/admin.validator.js';

const router = Router();
// ONE guard protects every admin route: sign-in required, then role checked against the database.
router.use(requireAuth, authorize('admin', 'superadmin'));
router.get('/dashboard', c.dashboard);
router.get('/orders', validate({ query: adminOrdersQuery }), c.listOrders);
router.patch('/orders/:id/status', validate({ body: statusSchema }), c.updateStatus);
router.get('/products', validate({ query: adminProductsQuery }), c.listProducts);
router.post('/products', validate({ body: productInput }), c.createProduct);
// Stock is edited through its own endpoint (so it is always logged), never through the product form.
router.put(
  '/products/:id',
  validate({ body: productInput.omit({ stock: true }) }),
  c.updateProduct,
);
router.delete('/products/:id', c.deleteProduct); // soft delete
router.post('/products/:id/restore', c.restoreProduct);
router.post('/products/:id/stock', validate({ body: stockSchema }), c.adjustStock);

router.get('/customers', validate({ query: listQuery }), c.listCustomers);
router.patch('/customers/:id', validate({ body: customerPatch }), c.updateCustomer);
router.get('/coupons', c.listCoupons);
router.post('/coupons', validate({ body: couponInput }), c.createCoupon);
router.patch('/coupons/:id', validate({ body: couponPatch }), c.updateCoupon);
router.delete('/coupons/:id', c.deleteCoupon);
router.get('/inventory', c.inventory);
router.get('/reviews', validate({ query: listQuery }), c.listReviews);
router.patch('/reviews/:id', validate({ body: hideSchema }), c.hideReview);
router.delete('/reviews/:id', deleteReview); // service lets staff delete any review

export default router;
