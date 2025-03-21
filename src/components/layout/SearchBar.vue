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
        <el-button @click="handleSearch" type="primary">
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
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 550px;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-input-group__append) {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}
</style>
