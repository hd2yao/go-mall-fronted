<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <div class="app-container">
      <AppHeader />
      <main class="main-content">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </ElConfigProvider>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  color: #333;
  background-color: #f5f5f5;
}

* {
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

a {
  text-decoration: none;
  color: #409eff;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.price::before {
  content: '¥';
  font-size: 0.8em;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin-left: 5px;
  font-size: 0.9em;
}

.original-price::before {
  content: '¥';
  font-size: 0.8em;
}
</style>
