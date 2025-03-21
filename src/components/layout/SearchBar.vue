<template>
  <div class="search-bar">
    <el-input
      v-model="keyword"
      placeholder="搜索商品"
      class="search-input"
      clearable
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push({
      path: '/search',
      query: {
        keyword: keyword.value.trim()
      }
    })
  }
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
}
</style>
