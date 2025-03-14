import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  // {
  //   path: '/login',
  //   component: () => import('@/views/user/Login.vue'),
  //   meta: { title: '登录' }
  // },
  // {
  //   path: '/register',
  //   component: () => import('@/views/user/Register.vue'),
  //   meta: { title: '注册' }
  // },
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
  // {
  //   path: '/search',
  //   component: () => import('@/views/product/Search.vue'),
  //   meta: { title: '搜索结果' }
  // },
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
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title ? to.meta.title + ' - ' : ''}Go Mall商城`

  // 这里可以添加登录验证等逻辑
  // const userStore = useUserStore()
  // if (to.meta.requiresAuth && !userStore.isLoggedIn) {
  //   next({ path: '/login', query: { redirect: to.fullPath } })
  // } else {
  //   next()
  // }

  next()
})

export default router
