import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MindMapPage from '../views/MindMapPage.vue'
import { useUserStore } from '../store/user'
import { pinia } from '../main'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' }, // Redirect root to login
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
      path: '/mindmap',
      component: MindMapPage,
      meta: { requiresAuth: true },
    },
    // Catch-all route for undefined paths
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

// Navigation guard to protect routes that require authentication
router.beforeEach((to, _, next) => {
  const userStore = useUserStore(pinia)
  if (to.meta.requiresAuth && !userStore.user) {
    next('/login')
  } else {
    next()
  }
})

export default router