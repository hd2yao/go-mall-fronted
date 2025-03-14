<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommodityStore } from '@/stores/commodity'
import type { Category, Commodity } from '@/types'

const router = useRouter()
const commodityStore = useCommodityStore()

const categories = ref<Category[]>([])
const hotProducts = ref<Commodity[]>([])
const newProducts = ref<Commodity[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    // 获取分类数据
    const categoryRes = await commodityStore.getCategoryHierarchy()
    categories.value = categoryRes

    // 获取热门商品（这里模拟，实际应该有专门的接口）
    const hotRes = await commodityStore.getCommodityListByCategory(1, 1, 8)
    hotProducts.value = hotRes

    // 获取新品（这里模拟，实际应该有专门的接口）
    const newRes = await commodityStore.getCommodityListByCategory(2, 1, 8)
    newProducts.value = newRes
  } catch (error) {
    console.error('获取首页数据失败:', error)
  } finally {
    loading.value = false
  }
})

const navigateToCategory = (categoryId: number) => {
  router.push(`/category/${categoryId}`)
}

const navigateToProduct = (productId: number) => {
  router.push(`/commodity/${productId}`)
}

// 格式化价格显示
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}
</script>

<template>
  <div class="home-page">
    <!-- 轮播图 -->
    <div class="banner-section">
      <el-carousel height="400px">
        <el-carousel-item v-for="i in 4" :key="i">
          <div class="banner-item" :style="{ backgroundColor: `hsl(${i * 90}, 70%, 80%)` }">
            <h3>促销活动 {{ i }}</h3>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="category-section container">
      <h2 class="section-title">商品分类</h2>
      <el-skeleton :rows="3" animated v-if="loading" />
      <div v-else class="category-list">
        <div
          v-for="category in categories.slice(0, 8)"
          :key="category.id"
          class="category-item"
          @click="navigateToCategory(category.id)"
        >
          <div class="category-icon">
            <el-icon size="24"><Goods /></el-icon>
          </div>
          <div class="category-name">{{ category.name }}</div>
        </div>
      </div>
    </div>

    <!-- 热门商品 -->
    <div class="product-section container">
      <h2 class="section-title">热门商品</h2>
      <el-skeleton :rows="2" animated v-if="loading" />
      <div v-else class="product-list">
        <div
          v-for="product in hotProducts"
          :key="product.id"
          class="product-card"
          @click="navigateToProduct(product.id)"
        >
          <div class="product-image">
            <img :src="product.cover_img" :alt="product.name" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">
              <span class="price">{{ formatPrice(product.selling_price) }}</span>
              <span v-if="product.original_price > product.selling_price" class="original-price">
                {{ formatPrice(product.original_price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新品上市 -->
    <div class="product-section container">
      <h2 class="section-title">新品上市</h2>
      <el-skeleton :rows="2" animated v-if="loading" />
      <div v-else class="product-list">
        <div
          v-for="product in newProducts"
          :key="product.id"
          class="product-card"
          @click="navigateToProduct(product.id)"
        >
          <div class="product-image">
            <img :src="product.cover_img" :alt="product.name" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">
              <span class="price">{{ formatPrice(product.selling_price) }}</span>
              <span v-if="product.original_price > product.selling_price" class="original-price">
                {{ formatPrice(product.original_price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 40px;
}

.banner-section {
  margin-bottom: 30px;
}

.banner-item {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.category-section,
.product-section {
  margin-bottom: 30px;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.category-item {
  width: 12%;
  min-width: 100px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 10px;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: center;
}
</style>
