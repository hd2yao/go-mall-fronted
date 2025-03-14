<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useCommodityStore } from '@/stores/commodity'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const commodityStore = useCommodityStore()

const searchKeyword = ref('')
const showUserMenu = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const cartCount = computed(() => cartStore.cartCount)

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      await userStore.getUserInfo()
      await cartStore.getCartList()
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  }

  try {
    await commodityStore.getCategoryHierarchy()
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
})

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  router.push({
    name: 'search',
    query: { keyword: searchKeyword.value },
  })
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo" @click="router.push('/')">
        <h1>Go Mall商城</h1>
      </div>

      <div class="search-box">
        <el-input v-model="searchKeyword" placeholder="搜索商品" @keyup.enter="handleSearch">
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="nav-actions">
        <div class="nav-item" @click="router.push('/category')">
          <el-icon><Menu /></el-icon>
          <span>分类</span>
        </div>

        <div class="nav-item" @click="router.push('/cart')">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <el-icon><ShoppingCart /></el-icon>
          </el-badge>
          <span>购物车</span>
        </div>

        <div v-if="isLoggedIn" class="nav-item user-menu" @click="toggleUserMenu">
          <el-avatar :size="30" :src="userInfo?.avatar || ''">
            {{ userInfo?.nickname?.substring(0, 1) || '用' }}
          </el-avatar>
          <span>{{ userInfo?.nickname || '用户' }}</span>

          <div v-show="showUserMenu" class="user-dropdown">
            <div class="dropdown-item" @click="router.push('/user')">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </div>
            <div class="dropdown-item" @click="router.push('/order/list')">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </div>
            <div class="dropdown-item" @click="router.push('/user/address')">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </div>
            <div class="dropdown-item" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>

        <div v-else class="nav-item" @click="router.push('/login')">
          <el-icon><User /></el-icon>
          <span>登录/注册</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #409eff;
}

.search-box {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
  position: relative;
}

.nav-item span {
  margin-top: 5px;
  font-size: 12px;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  margin-top: 10px;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item .el-icon {
  margin-right: 10px;
}
</style>
