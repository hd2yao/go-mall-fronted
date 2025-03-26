<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { isTokenExpired, isRefreshTokenExpired, clearToken } from '@/utils/token'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const userStore = useUserStore()

onMounted(async () => {
  // 检查token和refresh_token
  // 如果access_token过期且refresh_token也过期，清除用户状态
  if (isTokenExpired() && isRefreshTokenExpired()) {
    userStore.clearUserInfo()
    clearToken()
  } else {
    // 如果至少有一个token有效，尝试初始化用户状态
    await userStore.initUserState()
  }
})
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: 60px; /* header的高度 */
  margin-bottom: 60px; /* footer的高度 */
  min-height: calc(100vh - 120px); /* 减去header和footer的高度 */
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
