import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import PostView from '../views/PostView.vue';
import CreatePostView from '../views/CreatePostView.vue';
import EditPostView from '../views/EditPostView.vue';
import UserDashboardView from '../views/UserDashboardView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/posts/:id', component: PostView },

  {
    path: '/create',
    component: CreatePostView,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    component: EditPostView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: UserDashboardView,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/admin',
    component: AdminDashboardView,
    meta: { requiresAuth: true, role: 'admin' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  const role = String(user?.role || user?.userType || '').toLowerCase();
  const isAdmin = user?.isAdmin === true || role === 'admin';

  if (to.meta.requiresAuth && !token) {
    return '/login';
  }

  if (to.meta.role === 'admin' && !isAdmin) {
    return user ? '/dashboard' : '/login';
  }

  if (to.meta.role === 'user' && isAdmin) {
    return '/admin';
  }

  if ((to.path === '/login' || to.path === '/register') && token && user) {
    return isAdmin ? '/admin' : '/dashboard';
  }

  return true;
});

export default router;