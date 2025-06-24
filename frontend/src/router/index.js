import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import { loginState } from '../utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/booking'
      /*component: HomePage*/
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue')
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
      path: '/manage',
      name: 'manage',
      component: () => import('../pages/ManagePage.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {


  if (to.matched.length === 0) {
    return next('/')
  }

  if (to.path == '/register' && !to.query.invitation) {
    return next('/')
  }

  let loginInfo = await loginState()
  
  if (!loginInfo.logined && to.path !== '/login' && to.path !== '/register') {
    return next({
      path: '/login',
      query: {
        redirect: to.path
      }
    })
  }

  if (loginInfo.logined && to.path == '/login') {
    return next('/')
  }

  if ((!loginInfo.logined || !loginInfo.payload.is_admin) && to.path == '/manage') {
    return next('/')
  }
  next()
})

export default router
