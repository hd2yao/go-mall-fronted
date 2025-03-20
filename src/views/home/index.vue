<template>
  <div class="home-page">
    <div class="home-container">
      <el-row class="container-main">
        <el-col :span="24">
          <div class="welcome-section">
            <h1>欢迎来到Go Mall商城</h1>
            <p>这是一个基于Vue3和Go语言开发的电商平台</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.home-container {
  padding: 20px 0;

  .welcome-section {
    text-align: center;
    padding: 40px 0;

    h1 {
      font-size: 2rem;
      color: var(--el-color-primary);
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .current-page {
      font-size: 1rem;
      color: #999;
      margin-top: 1rem;
    }
  }
}
</style>
