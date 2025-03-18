<template>
  <header class="app-header">
    <div class="container-main">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">Go Mall商城</router-link>
        </div>
        <div class="nav-menu">
          <el-menu mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/category">商品分类</el-menu-item>
            <el-menu-item index="/product/list">全部商品</el-menu-item>
          </el-menu>
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

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.handleLogout()
  ElMessage.success('已退出登录')
}
</script>

<style scoped lang="scss">
.app-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;

    .logo {
      font-size: 1.5rem;
      font-weight: bold;

      a {
        color: var(--el-color-primary);
        text-decoration: none;
      }
    }

    .nav-menu {
      flex: 1;
      margin: 0 20px;
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
