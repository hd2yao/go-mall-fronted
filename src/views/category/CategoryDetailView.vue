<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commodityApi } from '@/api'
import type { Commodity, Pagination, Category } from '@/types'

const route = useRoute()
const router = useRouter()
const categoryId = ref<number>(0)
const categoryName = ref<string>('')
const commodities = ref<Commodity[]>([])
const loading = ref<boolean>(false)
const pagination = ref<Pagination>({
  page: 1,
  page_size: 20,
  total_rows: 0,
})

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    categoryId.value = id
    fetchCategoryInfo(id)
    fetchCommodities()
  }
})

const fetchCategoryInfo = async (id: number) => {
  try {
    const res = await commodityApi.getCategoryDetail(id)
    if (res.data && typeof res.data === 'object' && 'name' in res.data) {
      categoryName.value = (res.data as unknown as Category).name
    }
  } catch (error) {
    console.error('获取分类信息失败:', error)
    ElMessage.error('获取分类信息失败')
  }
}

const fetchCommodities = async () => {
  loading.value = true
  try {
    const res = await commodityApi.getCommodityListByCategory({
      category_id: categoryId.value,
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    })
    if (
      res.data &&
      typeof res.data === 'object' &&
      'list' in res.data &&
      'pagination' in res.data
    ) {
      const data = res.data as unknown as { list: Commodity[]; pagination: Pagination }
      commodities.value = data.list
      pagination.value = data.pagination
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleCommodityClick = (id: number) => {
  router.push(`/commodity/${id}`)
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchCommodities()
}
</script>

<template>
  <div class="category-detail-container">
    <el-card class="category-detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ categoryName || '商品列表' }}</span>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :rows="3" :count="4">
        <template #default>
          <div v-if="commodities.length === 0" class="empty-commodity">
            <el-empty description="暂无商品"></el-empty>
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
.category-detail-container {
  padding: 20px;
}

.category-detail-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-commodity {
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
