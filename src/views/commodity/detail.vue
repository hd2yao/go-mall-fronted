<template>
  <div class="commodity-detail">
    <div class="page-header">
      <el-button class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <el-breadcrumb separator=">>">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <!-- <el-breadcrumb-item>美妆 清洁 宠物</el-breadcrumb-item>
        <el-breadcrumb-item>美妆</el-breadcrumb-item>
        <el-breadcrumb-item>口红</el-breadcrumb-item> -->
      </el-breadcrumb>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="commodity" class="detail-container" v-loading="loading">
      <div class="commodity-container">
        <div class="commodity-image"
          @mousemove="handleMouseMove"
          @mouseenter="showMagnifier = true"
          @mouseleave="showMagnifier = false"
        >
          <el-image
            :src="formatImageUrl(commodity.cover_img)"
            :alt="commodity.name"
            fit="cover"
            :preview-src-list="[formatImageUrl(commodity.cover_img)]"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <p>图片加载失败</p>
              </div>
            </template>
          </el-image>
          <div v-show="showMagnifier" class="magnifier" :style="magnifierStyle">
            <img :src="formatImageUrl(commodity.cover_img)" :style="magnifierImageStyle" alt="放大镜">
          </div>
        </div>

        <div class="commodity-info">
          <div class="basic-info">
            <h1 class="commodity-name">{{ commodity.name }}</h1>
            <p class="intro">{{ commodity.intro }}</p>
          </div>
          <div v-if="commodity.tag" class="commodity-tag">{{ commodity.tag }}</div>

          <div class="price-info">
            <div class="selling-price">
              <span class="label">售价：</span>
              <span class="price">¥{{ formatPrice(commodity.selling_price) }}</span>
            </div>
            <div class="original-price" v-if="commodity.original_price !== commodity.selling_price">
              <span class="label">原价：</span>
              <span class="price">¥{{ formatPrice(commodity.original_price) }}</span>
            </div>
          </div>

          <div class="quantity-selector">
            <span class="label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="5"
              size="large"
            />
            <span class="stock">库存：{{ commodity.stock_num }}件</span>
          </div>

          <div class="actions">
            <el-button
              type="primary"
              size="large"
              @click="addToCart"
              :loading="addingToCart"
              :disabled="commodity.stock_num === 0 || addingToCart"
            >
              <el-icon v-if="!addingToCart"><ShoppingCart /></el-icon>
              {{ commodity.stock_num === 0 ? '已售罄' : '加入购物车' }}
            </el-button>
            <el-button
              type="danger"
              size="large"
              @click="buyNow"
              :loading="buying"
              :disabled="commodity.stock_num === 0 || buying"
            >
              {{ commodity.stock_num === 0 ? '已售罄' : '立即购买' }}
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="commodity.detail_content" class="commodity-detail-content">
        <h3 class="detail-title">商品详情</h3>
        <div class="detail-content" v-html="commodity.detail_content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Picture, ShoppingCart } from '@element-plus/icons-vue';
import { getCommodityDetail, CommodityDetail } from '@/api/commodity';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/stores/cart';
import { getAccessToken } from '@/utils/token';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const commodity = ref<CommodityDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const quantity = ref(1);
const showMagnifier = ref(false);
const magnifierPos = ref({ x: 0, y: 0 });
const magnifierSize = 150; // 放大镜大小
const zoomLevel = 2; // 放大倍数
const addingToCart = ref(false); // 加入购物车加载状态
const buying = ref(false); // 立即购买加载状态

const formatImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('https://', 'http://');
};

const fetchCommodityDetail = async () => {
  try {
    loading.value = true;
    const res = await getCommodityDetail(Number(route.params.id));
    if (res.data.code === 0) {
      commodity.value = res.data.data;
    } else {
      error.value = res.data.msg;
    }
  } catch (err) {
    error.value = '获取商品详情失败';
  } finally {
    loading.value = false;
  }
};

const addToCart = async () => {
  if (!getAccessToken()) {
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    });
    return;
  }

  if (quantity.value > 5) {
    ElMessage.warning('单个商品最多只能购买5个');
    return;
  }

  try {
    addingToCart.value = true;
    await cartStore.addItemToCart({
      commodity_id: commodity.value?.id || 0,
      commodity_num: quantity.value
    });
  } catch (error) {
    console.error('加入购物车失败:', error);
  } finally {
    addingToCart.value = false;
  }
};

const buyNow = async () => {
  if (!getAccessToken()) {
    router.push({
      name: 'Login',
      query: { redirect: route.fullPath }
    });
    return;
  }

  if (quantity.value > 5) {
    ElMessage.warning('单个商品最多只能购买5个');
    return;
  }

  if (!commodity.value) {
    ElMessage.error('商品信息不存在');
    return;
  }

  try {
    buying.value = true;
    // 检查商品库存是否充足
    if (commodity.value.stock_num < quantity.value) {
      ElMessage.warning(`商品库存不足，当前库存${commodity.value.stock_num}件`);
      return;
    }

    // 直接跳转到结算页面，并传递商品信息
    router.push({
      path: '/checkout',
      query: {
        directBuy: 'true',
        commodityId: commodity.value.id.toString(),
        quantity: quantity.value.toString()
      }
    });
  } catch (error) {
    console.error('立即购买失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    buying.value = false;
  }
};

const goBack = () => {
  router.back();
};

const handleMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  // 计算鼠标相对图片容器的位置
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 允许放大镜移动到边缘
  magnifierPos.value = {
    x: Math.min(Math.max(0, x), rect.width),
    y: Math.min(Math.max(0, y), rect.height)
  };
};

const magnifierStyle = computed(() => ({
  width: `${magnifierSize}px`,
  height: `${magnifierSize}px`,
  left: `${Math.min(Math.max(magnifierSize/2, magnifierPos.value.x), 400 - magnifierSize/2) - magnifierSize/2}px`,
  top: `${Math.min(Math.max(magnifierSize/2, magnifierPos.value.y), 400 - magnifierSize/2) - magnifierSize/2}px`
}));

const magnifierImageStyle = computed(() => {
  const imageSize = 400; // 图片容器的大小

  // 计算放大镜中心点相对于图片的位置（0-1范围）
  const centerX = magnifierPos.value.x / imageSize;
  const centerY = magnifierPos.value.y / imageSize;

  // 计算图片的偏移量
  const x = -centerX * (imageSize * zoomLevel - magnifierSize);
  const y = -centerY * (imageSize * zoomLevel - magnifierSize);

  return {
    width: `${imageSize * zoomLevel}px`,
    height: `${imageSize * zoomLevel}px`,
    transform: `translate(${x}px, ${y}px)`
  };
});

onMounted(() => {
  fetchCommodityDetail();
});
</script>

<style scoped>
.commodity-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: 20px;
}

:deep(.el-breadcrumb) {
  flex: 1;
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  color: #666;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #409eff;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #666;
}

.page-title {
  margin: 0 0 0 20px;
  font-size: 20px;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.commodity-container {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.commodity-image {
  width: 400px;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  position: relative;
  cursor: none;
}

.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  background: #f5f7fa;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.commodity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.basic-info {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.commodity-name {
  margin: 0 0 15px;
  font-size: 24px;
  color: #333;
  line-height: 1.4;
}

.intro {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.price-info {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 4px;
}

.selling-price {
  margin-bottom: 10px;
}

.selling-price .label {
  font-size: 16px;
  color: #666;
}

.selling-price .price {
  color: #ff6b6b;
  font-size: 28px;
  font-weight: bold;
  margin-left: 10px;
}

.original-price .label {
  color: #999;
}

.original-price .price {
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-selector .label {
  color: #666;
}

.quantity-selector .stock {
  color: #999;
  margin-left: 20px;
}

.actions {
  display: flex;
  gap: 20px;
}

.actions .el-button {
  flex: 1;
}

.actions .el-icon {
  margin-right: 5px;
}

.commodity-detail-content {
  padding: 20px;
  border-top: 1px solid #eee;
}

.detail-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px;
  padding-left: 10px;
  border-left: 4px solid #ff6b6b;
}

.detail-content {
  color: #666;
  line-height: 1.8;
}

.error-message {
  text-align: center;
  color: #ff6b6b;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.commodity-tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.magnifier {
  position: absolute;
  border: 2px solid #fff;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  pointer-events: none;
  z-index: 2;
}

.magnifier img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
