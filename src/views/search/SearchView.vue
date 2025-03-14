<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commodityApi } from '@/api'
import type { Commodity, Pagination } from '@/types'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const commodities = ref<Commodity[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total_rows: 0,
})

onMounted(() => {
  // 从URL获取搜索关键词
  const queryKeyword = route.query.keyword as string
  if (queryKeyword) {
    keyword.value = queryKeyword
    search()
  }
})

// 监听关键词变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword && typeof newKeyword === 'string') {
      keyword.value = newKeyword
      pagination.page = 1 // 重置页码
      search()
    }
  },
)

const search = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    const res = await commodityApi.searchCommodity({
      keyword: keyword.value,
      page: pagination.page,
      page_size: pagination.page_size,
    })

    if (
      res.data &&
      typeof res.data === 'object' &&
      'list' in res.data &&
      'pagination' in res.data
    ) {
      const data = res.data as unknown as { list: Commodity[]; pagination: Pagination }
      commodities.value = data.list
      pagination.total_rows = data.pagination.total_rows
    }
  } catch (error) {
    console.error('搜索商品失败:', error)
    ElMessage.error('搜索商品失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1 // 重置页码
  // 更新URL，不刷新页面
  router.push({
    path: '/search',
    query: { keyword: keyword.value },
  })
  search()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  search()
}

const handleCommodityClick = (id: number) => {
  router.push(`/commodity/${id}`)
}
</script>

<template>
  <div class="search-container">
    <div class="search-header">
      <el-input
        v-model="keyword"
        placeholder="请输入商品名称关键词"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <el-card class="search-result-card">
      <template #header>
        <div class="card-header">
          <span>搜索结果: {{ keyword }}</span>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :rows="3" :count="4">
        <template #default>
          <div v-if="commodities.length === 0" class="empty-result">
            <el-empty description="暂无搜索结果"></el-empty>
          </div>

          <div v-else>
            <div class="commodity-list">
              <el-card
                v-for="commodity in commodities"
                :key="commodity.id"
                class="commodity-item"
                shadow="hover"
                @click="handleCommodityClick(commodity.id)"
              >
                <div class="commodity-image">
                  <el-image
                    :src="commodity.cover_img"
                    fit="cover"
                    :preview-src-list="[commodity.cover_img]"
                  ></el-image>
                  <div v-if="commodity.tag" class="commodity-tag">{{ commodity.tag }}</div>
                </div>
                <div class="commodity-info">
                  <div class="commodity-name">{{ commodity.name }}</div>
                  <div class="commodity-intro">{{ commodity.intro }}</div>
                  <div class="commodity-price">
                    <span class="selling-price">¥{{ commodity.selling_price }}</span>
                    <span
                      v-if="commodity.original_price > commodity.selling_price"
                      class="original-price"
                      >¥{{ commodity.original_price }}</span
                    >
                  </div>
                </div>
              </el-card>
            </div>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pagination.page"
                :page-size="pagination.page_size"
                :total="pagination.total_rows"
                layout="prev, pager, next, jumper"
                @current-change="handlePageChange"
              ></el-pagination>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<style scoped>
.search-container {
  padding: 20px;
}

.search-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 500px;
  max-width: 100%;
}

.search-result-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-result {
  padding: 40px 0;
  text-align: center;
}

.commodity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.commodity-item {
  cursor: pointer;
  transition: transform 0.3s;
  height: 100%;
}

.commodity-item:hover {
  transform: translateY(-5px);
}

.commodity-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.commodity-image .el-image {
  width: 100%;
  height: 100%;
}

.commodity-tag {
  position: absolute;
  top: 10px;
  right: 0;
  background-color: #f56c6c;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.commodity-info {
  padding: 10px 0;
}

.commodity-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.commodity-intro {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}

.commodity-price {
  display: flex;
  align-items: center;
}

.selling-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
