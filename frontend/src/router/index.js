import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../pages/SettingPage.vue')
    },
    {
      path: '/booking',
      name: 'booking',
      component: () => import('../pages/BookingPage.vue')
    },
    {
      path: '/storage',
      name: 'storage',
      component: () => import('../pages/HomePage.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/HomePage.vue')
    }
  ]
})

export default router
