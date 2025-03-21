<template>
  <div class="home-page">
    <div class="banner">
      <h1>欢迎访问 Go Mall商城</h1>
      <p>探索我们的产品世界</p>
      <el-button type="primary" size="large" @click="goToProducts">浏览全部商品</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToProducts = () => {
  router.push('/product/list');
};
</script>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  margin-top: 60px;
}

.banner {
  text-align: center;
  padding: 60px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #333;
}

p {
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
}
</style>
