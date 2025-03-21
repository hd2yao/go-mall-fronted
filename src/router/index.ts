import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAccessToken, clearToken } from '@/utils/token'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/product/list',
    name: 'ProductList',
    component: () => import('@/views/commodity/CommodityPage.vue'),
    meta: { title: '全部商品' }
  },
  {
    path: '/commodity/:id',
    name: 'CommodityDetail',
    component: () => import('@/views/commodity/detail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/reset-password',
    component: () => import('@/views/user/ResetPassword.vue'),
    meta: { title: '重置密码' }
  },
  {
    path: '/user/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/address',
    name: 'Address',
    component: () => import('@/views/user/Address.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // {
  //   path: '/category',
  //   component: () => import('@/views/product/Category.vue'),
  //   meta: { title: '商品分类' }
  // },
  // {
  //   path: '/product/list',
  //   component: () => import('@/views/product/List.vue'),
  //   meta: { title: '商品列表' }
  // },
  // {
  //   path: '/product/:id',
  //   component: () => import('@/views/product/Detail.vue'),
  //   meta: { title: '商品详情' }
  // },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/commodity/SearchResult.vue'),
    meta: { title: '搜索结果' }
  },
  // {
  //   path: '/cart',
  //   component: () => import('@/views/cart/index.vue'),
  //   meta: { title: '购物车', requiresAuth: true }
  // },
  // {
  //   path: '/order/create',
  //   component: () => import('@/views/order/Create.vue'),
  //   meta: { title: '创建订单', requiresAuth: true }
  // },
  // {
  //   path: '/order/list',
  //   component: () => import('@/views/order/List.vue'),
  //   meta: { title: '我的订单', requiresAuth: true }
  // },
  // {
  //   path: '/order/:orderNo',
  //   component: () => import('@/views/order/Detail.vue'),
  //   meta: { title: '订单详情', requiresAuth: true }
  // },
  // {
  //   path: '/user',
  //   component: () => import('@/views/user/Layout.vue'),
  //   meta: { requiresAuth: true },
  //   children: [
  //     {
  //       path: 'profile',
  //       component: () => import('@/views/user/Profile.vue'),
  //       meta: { title: '个人中心' }
  //     },
  //     {
  //       path: 'address',
  //       component: () => import('@/views/user/Address.vue'),
  //       meta: { title: '收货地址' }
  //     }
  //   ]
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 检查是否有token
    if (!getAccessToken()) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // 如果有token但没有用户信息，尝试获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfoAction()
        next()
      } catch (error) {
        // 如果获取用户信息失败，尝试刷新token
        const refreshed = await userStore.refreshUserToken()
        if (refreshed) {
          // 刷新成功，重新获取用户信息
          await userStore.getUserInfoAction()
          next()
        } else {
          // 刷新失败，清除token并跳转到登录页
          clearToken()
          next({ name: 'Login', query: { redirect: to.fullPath } })
        }
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
