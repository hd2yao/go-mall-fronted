<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="copyright">
        &copy; {{ currentYear }} Go Mall商城 版权所有
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.footer {
  background-color: #f5f5f5;
  padding: 20px 0;
  text-align: center;
  color: #666;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.copyright {
  margin: 0;
  font-size: 14px;
}
</style>
