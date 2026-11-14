import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/layouts/AdminLayout.vue';
import StorefrontLayout from '@/layouts/StorefrontLayout.vue';

/**
 * Pages are lazy-loaded (`() => import(...)`) so the first visit only downloads the code it needs.
 * Layouts are parent routes: the layout stays mounted while child pages swap inside its <RouterView>.
 */
const routes = [
  {
    path: '/',
    component: StorefrontLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/storefront/HomeView.vue'),
        meta: { title: 'See the World Differently' },
      },
      {
        path: 'design-system',
        name: 'design-system',
        component: () => import('@/views/storefront/DesignSystemView.vue'),
        meta: { title: 'Design system' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/storefront/NotFoundView.vue'),
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
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/AdminOrdersView.vue'),
        meta: { title: 'Orders' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, saved) => saved || { top: 0 },
});

// Guards wait for the session check, so a refresh on a protected page doesn't bounce you to /login.
// requiresAuth is ready for account pages (Phase 8); the server still enforces access on every API call.
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.init();
  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } };
  if (to.matched.some((r) => r.meta.requiresAdmin) && !auth.isAdmin) return { name: 'home' }; // UX only: the API enforces roles
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'home' };
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — LUMIÈRE` : 'LUMIÈRE — Premium Eyewear';
});

export default router;
