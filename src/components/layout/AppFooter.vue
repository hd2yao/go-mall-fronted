<template>
  <footer class="app-footer">
    <div class="container-main">
      <div class="footer-content">
        <div class="copyright">
          &copy; {{ currentYear }} Go Mall商城 版权所有
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.app-footer {
  margin-top: 40px;
  padding: 20px 0;
  background-color: #f5f5f5;

  .footer-content {
    text-align: center;
    color: #666;
  }
}
</style>
