<template>
  <header class="app-header">
    <div class="container-main">
      <div class="header-content">
        <div class="left-section">
          <el-menu mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/category">商品分类</el-menu-item>
            <el-menu-item index="/product/list">全部商品</el-menu-item>
          </el-menu>
        </div>
        <div class="search-section">
          <SearchBar />
        </div>
        <div class="user-actions">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown>
              <span class="user-info">
                {{ userStore.userInfo?.nickname }}
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <router-link to="/user/profile">个人中心</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <router-link to="/user/address">收货地址管理</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <router-link to="/order/list">我的订单</router-link>
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" @click="router.push('/cart')">
              <el-icon><shopping-cart /></el-icon>
              购物车
            </el-button>
          </template>
          <template v-else>
            <el-button @click="router.push('/login')">登录</el-button>
            <el-button type="primary" @click="router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ArrowDown, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SearchBar from '@/components/layout/SearchBar.vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.handleLogout()
  ElMessage.success('已退出登录')
}
</script>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;

    .left-section {
      display: flex;
      align-items: center;
      width: auto;

      :deep(.el-menu) {
        border-bottom: none;
      }

      :deep(.el-menu-item) {
        font-size: 16px;
        height: 60px;
        line-height: 60px;
      }

      :deep(.el-menu-item.is-active) {
        color: #1890ff;
        border-bottom: 2px solid #1890ff;
      }
    }

    .search-section {
      flex: 1;
      margin: 0 40px;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: #333;
      }
    }
  }
}
</style>
