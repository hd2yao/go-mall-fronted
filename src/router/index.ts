import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/user/LoginView.vue'),
      meta: { title: '登录', guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/user/RegisterView.vue'),
      meta: { title: '注册', guest: true },
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('../views/user/ResetPasswordView.vue'),
      meta: { title: '重置密码', guest: true },
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('../views/category/CategoryView.vue'),
      meta: { title: '商品分类' },
    },
    {
      path: '/category/:id',
      name: 'categoryDetail',
      component: () => import('../views/category/CategoryDetailView.vue'),
      meta: { title: '分类商品' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/search/SearchView.vue'),
      meta: { title: '商品搜索' },
    },
    {
      path: '/commodity/:id',
      name: 'commodityDetail',
      component: () => import('../views/commodity/CommodityDetailView.vue'),
      meta: { title: '商品详情' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/cart/CartView.vue'),
      meta: { title: '购物车', requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/order/CheckoutView.vue'),
      meta: { title: '结算', requiresAuth: true },
    },
    {
      path: '/order/list',
      name: 'orderList',
      component: () => import('../views/order/OrderListView.vue'),
      meta: { title: '我的订单', requiresAuth: true },
    },
    {
      path: '/order/:orderNo',
      name: 'orderDetail',
      component: () => import('../views/order/OrderDetailView.vue'),
      meta: { title: '订单详情', requiresAuth: true },
    },
    {
      path: '/payment/:orderNo',
      name: 'payment',
      component: () => import('../views/order/PaymentView.vue'),
      meta: { title: '订单支付', requiresAuth: true },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/user/UserView.vue'),
      meta: { title: '个人中心', requiresAuth: true },
    },
    {
      path: '/user/profile',
      name: 'userProfile',
      component: () => import('../views/user/ProfileView.vue'),
      meta: { title: '个人资料', requiresAuth: true },
    },
    {
      path: '/user/address',
      name: 'addressList',
      component: () => import('../views/user/address/AddressListView.vue'),
      meta: { title: '收货地址', requiresAuth: true },
    },
    {
      path: '/user/address/add',
      name: 'addressAdd',
      component: () => import('../views/user/address/AddressEditView.vue'),
      meta: { title: '新增地址', requiresAuth: true },
    },
    {
      path: '/user/address/edit/:id',
      name: 'addressEdit',
      component: () => import('../views/user/address/AddressEditView.vue'),
      meta: { title: '编辑地址', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '首页'} - Go Mall商城`

  // 检查是否需要登录权限
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isLoggedIn = !!localStorage.getItem('go_mall_token')

  if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && isLoggedIn) {
    // 已登录用户访问游客页面（如登录、注册），重定向到首页
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
