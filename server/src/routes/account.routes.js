import { Router } from 'express';
import * as c from '../controllers/account.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  profileSchema,
  passwordSchema,
  addressSchema,
  reviewSchema,
} from '../validators/account.validator.js';

const router = Router();
router.get('/products/:id/reviews', c.listReviews); // public

router.use(['/wishlist', '/account', '/reviews'], requireAuth); // scoped: must not guard routes mounted after this router
router.get('/wishlist', c.getWishlist);
router.post('/wishlist/:productId', c.addWish);
router.delete('/wishlist/:productId', c.removeWish);
router.patch('/account/profile', validate({ body: profileSchema }), c.updateProfile);
router.post('/account/password', validate({ body: passwordSchema }), c.changePassword);
router.get('/account/addresses', c.listAddresses);
router.post('/account/addresses', validate({ body: addressSchema }), c.createAddress);
router.put('/account/addresses/:id', validate({ body: addressSchema }), c.updateAddress);
router.delete('/account/addresses/:id', c.deleteAddress);
router.post('/products/:id/reviews', requireAuth, validate({ body: reviewSchema }), c.createReview);
router.put('/reviews/:id', validate({ body: reviewSchema }), c.updateReview);
router.delete('/reviews/:id', c.deleteReview);
export default router;
