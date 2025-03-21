<template>
  <div class="search-result">
    <div class="search-header">
      <h2>搜索结果: {{ route.query.keyword }}</h2>
    </div>
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="result-content">
      <div v-if="commodities.length === 0" class="no-result">
        未找到相关商品
      </div>
      <div v-else class="commodity-list">
        <div v-for="item in commodities" :key="item.id" class="commodity-item" @click="navigateToDetail(item.id)">
          <el-card :body-style="{ padding: '0px' }" shadow="hover" class="commodity-card">
            <img :src="formatImageUrl(item.cover_img)" class="image" :alt="item.name">
            <div class="info">
              <h3 class="title">{{ item.name }}</h3>
              <p class="intro">{{ item.intro }}</p>
              <div class="price-section">
                <div class="price-container">
                  <span class="price">¥{{ (item.selling_price / 100).toFixed(2) }}</span>
                  <span v-if="item.original_price > item.selling_price" class="original-price">¥{{ (item.original_price / 100).toFixed(2) }}</span>
                </div>
                <el-tag v-if="item.tag" size="small" type="danger">{{ item.tag }}</el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchCommodities } from '@/api/commodity'
import type { SearchResult } from '@/api/commodity'

const route = useRoute()
const router = useRouter()
const commodities = ref<SearchResult[]>([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const formatImageUrl = (url: string) => {
  return url.replace('https://', 'http://')
}

const navigateToDetail = (id: number | string) => {
  router.push(`/commodity/${id}`)
}

const fetchSearchResults = async () => {
  const keyword = route.query.keyword as string
  if (!keyword) {
    error.value = '请输入搜索关键词'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await searchCommodities({
      keyword,
      page: currentPage.value,
      page_size: pageSize.value
    })

    if (response.data.code === 0) {
      commodities.value = response.data.data
      total.value = response.data.Pagination.total_rows
    } else {
      error.value = '获取搜索结果失败'
    }
  } catch (err) {
    error.value = '搜索失败，请稍后重试'
    console.error('搜索失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchSearchResults()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchSearchResults()
}

watch(
  () => route.query.keyword,
  () => {
    currentPage.value = 1
    fetchSearchResults()
  }
)

onMounted(() => {
  fetchSearchResults()
})
</script>

<style scoped>
.search-result {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commodity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.commodity-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  border-radius: 0;
  overflow: hidden;
  background: white;
}

.commodity-item:hover {
  transform: scale(1.03);
  border-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.commodity-item:hover .title {
  color: #f10215;
}

.commodity-card {
  height: 100%;
  border: none;
  box-shadow: none;
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.info {
  padding: 14px;
}

.title {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  height: 42px;
  transition: color 0.3s ease;
}

.intro {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.price {
  font-size: 18px;
  color: #f10215;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.loading, .error, .no-result {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #ff4d4f;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
