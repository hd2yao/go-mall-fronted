<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Location, List, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 跳转到个人资料页面
const goToProfile = () => {
  router.push('/user/profile')
}

// 跳转到地址管理页面
const goToAddress = () => {
  router.push('/user/address')
}

// 跳转到订单列表页面
const goToOrders = () => {
  router.push('/order/list')
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="user-center-container">
    <h1 class="page-title">个人中心</h1>

    <el-card v-loading="loading" shadow="never" class="user-info-card">
      <template v-if="userStore.userInfo">
        <div class="user-header">
          <el-avatar
            :size="80"
            :src="
              userStore.userInfo.avatar ||
              'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
            "
          ></el-avatar>
          <div class="user-basic-info">
            <h2 class="user-nickname">
              {{ userStore.userInfo.nickname || userStore.userInfo.login_name }}
            </h2>
            <p class="user-slogan">{{ userStore.userInfo.slogan || '这个人很懒，什么都没留下' }}</p>
          </div>
        </div>

        <el-divider />

        <div class="user-menu-grid">
          <div class="menu-item" @click="goToProfile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </div>
          <div class="menu-item" @click="goToAddress">
            <el-icon><Location /></el-icon>
            <span>收货地址</span>
          </div>
          <div class="menu-item" @click="goToOrders">
            <el-icon><List /></el-icon>
            <span>我的订单</span>
          </div>
          <div class="menu-item" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </template>
    </el-card>

    <el-card shadow="never" class="recent-orders-card">
      <template #header>
        <div class="card-header">
          <span>最近订单</span>
          <el-button text @click="goToOrders">查看全部</el-button>
        </div>
      </template>

      <el-empty description="暂无订单数据" v-if="!loading"></el-empty>
    </el-card>
  </div>
</template>

<style scoped>
.user-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.user-basic-info {
  margin-left: 20px;
}

.user-nickname {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #333;
}

.user-slogan {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.user-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.menu-item .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
  color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-orders-card {
  margin-bottom: 30px;
}
</style>
