<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commodityApi } from '@/api'
import { useCartStore } from '@/stores/cart'
import type { CommodityDetail } from '@/types'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const commodityId = ref<number>(0)
const commodity = ref<CommodityDetail | null>(null)
const loading = ref<boolean>(true)
const quantity = ref<number>(1)

// 商品图片列表
const imageList = ref<string[]>([])

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    commodityId.value = id
    fetchCommodityDetail(id)
  } else {
    ElMessage.error('商品ID无效')
    router.push('/')
  }
})

const fetchCommodityDetail = async (id: number) => {
  loading.value = true
  try {
    const res = await commodityApi.getCommodityDetail(id)
    if (res.data) {
      commodity.value = res.data as unknown as CommodityDetail

      // 处理商品图片
      if (commodity.value.images) {
        // 假设images是逗号分隔的图片URL字符串
        imageList.value = commodity.value.images.split(',')
      }

      // 确保封面图片在列表中
      if (commodity.value.cover_img && !imageList.value.includes(commodity.value.cover_img)) {
        imageList.value.unshift(commodity.value.cover_img)
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

const handleQuantityChange = (value: number) => {
  quantity.value = value
}

const addToCart = async () => {
  if (!commodity.value) return

  try {
    await cartStore.addToCart(commodityId.value, quantity.value)
    ElMessage.success('已添加到购物车')
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败')
  }
}

const buyNow = () => {
  if (!commodity.value) return

  addToCart().then(() => {
    router.push('/checkout')
  })
}
</script>

<template>
  <div class="commodity-detail-container">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-container">
          <div class="skeleton-left">
            <el-skeleton-item variant="image" style="width: 400px; height: 400px" />
          </div>
          <div class="skeleton-right">
            <el-skeleton-item variant="h3" style="width: 50%" />
            <el-skeleton-item variant="text" style="margin-top: 20px; width: 80%" />
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 70%" />
            <el-skeleton-item variant="text" style="width: 40%" />
            <el-skeleton-item variant="button" style="margin-top: 40px; width: 30%" />
            <el-skeleton-item variant="button" style="width: 30%; margin-left: 20px" />
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="commodity" class="commodity-detail">
          <div class="commodity-gallery">
            <el-carousel trigger="click" height="400px" indicator-position="outside">
              <el-carousel-item v-for="(img, index) in imageList" :key="index">
                <el-image :src="img" fit="contain" :preview-src-list="imageList"></el-image>
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="commodity-info">
            <h1 class="commodity-name">{{ commodity.name }}</h1>

            <div class="commodity-intro">{{ commodity.intro }}</div>

            <div class="commodity-price-container">
              <div class="price-label">价格:</div>
              <div class="price-value">
                <span class="selling-price">¥{{ commodity.selling_price }}</span>
                <span
                  v-if="commodity.original_price > commodity.selling_price"
                  class="original-price"
                  >¥{{ commodity.original_price }}</span
                >
              </div>
            </div>

            <div class="commodity-stock">
              <div class="stock-label">库存:</div>
              <div class="stock-value">{{ commodity.stock_num }} 件</div>
            </div>

            <div class="commodity-quantity">
              <div class="quantity-label">数量:</div>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="commodity.stock_num"
                @change="handleQuantityChange"
              ></el-input-number>
            </div>

            <div class="commodity-actions">
              <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
              <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
            </div>
          </div>
        </div>

        <div v-if="commodity" class="commodity-detail-content">
          <el-divider>
            <el-tag size="large">商品详情</el-tag>
          </el-divider>

          <div class="detail-content" v-html="commodity.detail_content"></div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.commodity-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.skeleton-container {
  display: flex;
  gap: 40px;
}

.skeleton-left {
  flex: 0 0 400px;
}

.skeleton-right {
  flex: 1;
  padding-top: 20px;
}

.commodity-detail {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.commodity-gallery {
  flex: 0 0 400px;
}

.commodity-gallery .el-image {
  width: 100%;
  height: 100%;
}

.commodity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.commodity-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.commodity-intro {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.commodity-price-container,
.commodity-stock,
.commodity-quantity {
  display: flex;
  align-items: center;
}

.price-label,
.stock-label,
.quantity-label {
  width: 80px;
  font-size: 16px;
  color: #666;
}

.selling-price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 10px;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.commodity-actions {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.commodity-detail-content {
  margin-top: 40px;
}

.detail-content {
  padding: 20px;
}

/* 处理详情内容中的图片 */
:deep(.detail-content img) {
  max-width: 100%;
  height: auto;
}
</style>
