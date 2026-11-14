import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import StorefrontLayout from '@/layouts/StorefrontLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

// Pages are lazy-loaded so a visit only downloads the code it needs.
const store = (n) => () => import(`../views/storefront/${n}.vue`);
const auth = (n) => () => import(`../views/auth/${n}.vue`);
const adm = (n) => () => import(`../views/admin/${n}.vue`);

const routes = [
  {
    path: '/',
    component: StorefrontLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: store('HomeView'),
        meta: { title: 'See the World Differently' },
      },
      { path: 'shop', name: 'shop', component: store('CatalogView'), meta: { title: 'Shop' } },
      {
        path: 'product/:slug',
        name: 'product',
        component: store('ProductDetailView'),
        meta: { title: 'Product' },
      },
      { path: 'cart', name: 'cart', component: store('CartView'), meta: { title: 'Your cart' } },
      {
        path: 'checkout',
        name: 'checkout',
        component: store('CheckoutView'),
        meta: { title: 'Checkout', requiresAuth: true },
      },
      {
        path: 'wishlist',
        name: 'wishlist',
        component: store('WishlistView'),
        meta: { title: 'Wishlist', requiresAuth: true },
      },
      {
        path: 'account',
        name: 'account',
        component: store('AccountView'),
        meta: { title: 'My account', requiresAuth: true },
      },
      {
        path: 'account/orders',
        name: 'orders',
        component: store('OrdersView'),
        meta: { title: 'Your orders', requiresAuth: true },
      },
      {
        path: 'login',
        name: 'login',
        component: auth('LoginView'),
        meta: { title: 'Sign in', guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: auth('RegisterView'),
        meta: { title: 'Create account', guestOnly: true },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: auth('ForgotPasswordView'),
        meta: { title: 'Reset password', guestOnly: true },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: auth('ResetPasswordView'),
        meta: { title: 'New password' },
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: auth('VerifyEmailView'),
        meta: { title: 'Verify email' },
      },
      {
        path: 'design-system',
        name: 'design-system',
        component: store('DesignSystemView'),
        meta: { title: 'Design system' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: store('NotFoundView'),
        meta: { title: 'Page not found' },
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: adm('DashboardView'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'products',
        name: 'admin-products',
        component: adm('AdminProductsView'),
        meta: { title: 'Products' },
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: adm('AdminOrdersView'),
        meta: { title: 'Orders' },
      },
      {
        path: 'customers',
        name: 'admin-customers',
        component: adm('AdminCustomersView'),
        meta: { title: 'Customers' },
      },
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: adm('AdminCouponsView'),
        meta: { title: 'Coupons' },
      },
      {
        path: 'inventory',
        name: 'admin-inventory',
        component: adm('AdminInventoryView'),
        meta: { title: 'Inventory' },
      },
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: adm('AdminReviewsView'),
        meta: { title: 'Reviews' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _f, saved) => saved || (to.hash ? { el: to.hash } : { top: 0 }),
});

// Waits for the session check so refreshing a protected page doesn't bounce you to /login.
// The role check here is only for UX: the API enforces roles on every request.
router.beforeEach(async (to) => {
  const a = useAuthStore();
  await a.init();
  if (to.matched.some((r) => r.meta.requiresAuth) && !a.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } };
  if (to.matched.some((r) => r.meta.requiresAdmin) && !a.isAdmin) return { name: 'home' };
  if (to.meta.guestOnly && a.isAuthenticated) return { name: 'home' };
});
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — LUMIÈRE` : 'LUMIÈRE — Premium Eyewear';
});

export default router;
