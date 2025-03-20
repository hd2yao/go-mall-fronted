<template>
  <div class="commodity-detail">
    <div class="back-button">
        <el-button @click="goBack">返回</el-button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="commodity" class="detail-container">
      <div class="image-section">
        <img :src="formatImageUrl(commodity.cover_img)" :alt="commodity.name" class="main-image">
      </div>
      <div class="info-section">
        <h1 class="title">{{ commodity.name }}</h1>
        <p class="intro">{{ commodity.intro }}</p>
        <div class="price-section">
          <div class="price">
            <span class="selling-price">¥{{ (commodity.selling_price / 100).toFixed(2) }}</span>
            <span class="original-price">¥{{ (commodity.original_price / 100).toFixed(2) }}</span>
          </div>
          <div v-if="commodity.tag" class="tag">{{ commodity.tag }}</div>
        </div>
        <div class="stock">库存: {{ commodity.stock_num }}件</div>
        <div class="action-section">
          <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
          <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
        </div>
      </div>
      <div class="detail-content" v-if="commodity.detail_content">
        <h2>商品详情</h2>
        <div v-html="commodity.detail_content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCommodityDetail } from '@/api/commodity';
import type { CommodityDetail } from '@/api/commodity';

const route = useRoute();
const router = useRouter();

const commodity = ref<CommodityDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const formatImageUrl = (url: string) => {
  return url.replace('https://', 'http://');
};

const fetchCommodityDetail = async () => {
  const commodityId = Number(route.params.id);
  if (!commodityId) {
    error.value = '商品ID无效';
    return;
  }

  try {
    loading.value = true;
    const response = await getCommodityDetail(commodityId);
    commodity.value = response.data.data;
  } catch (err) {
    error.value = '获取商品详情失败';
    console.error('获取商品详情失败:', err);
  } finally {
    loading.value = false;
  }
};

const addToCart = () => {
  ElMessage.info('购物车功能开发中...');
};

const buyNow = () => {
  ElMessage.info('立即购买功能开发中...');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchCommodityDetail();
});
</script>

<style scoped>
.commodity-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.back-button {
  margin-bottom: 20px;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
}

.back-button .el-button {
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #ff4d4f;
}

.detail-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-section {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 4px;
}

.info-section {
  padding: 20px 0;
}

.title {
  font-size: 24px;
  margin: 0 0 16px;
}

.intro {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px;
}

.price-section {
  margin-bottom: 24px;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.selling-price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.stock {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.action-section {
  display: flex;
  gap: 16px;
}

.detail-content {
  grid-column: 1 / -1;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.detail-content h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.custom-back-btn {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-back-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
</style>
