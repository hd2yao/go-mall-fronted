<template>
  <div class="commodity-list">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="commodities.length === 0" class="empty">暂无商品</div>
    <div v-else class="commodity-grid">
      <div v-for="item in commodities" :key="item.id" class="commodity-item" @click="goToDetail(item.id)">
        <img :src="formatImageUrl(item.cover_img)" :alt="item.name" class="commodity-image">
        <div class="commodity-info">
          <h3 class="commodity-name">{{ item.name }}</h3>
          <p class="commodity-intro">{{ item.intro }}</p>
          <div class="commodity-price">
            <span class="selling-price">¥{{ (item.selling_price / 100).toFixed(2) }}</span>
            <span class="original-price">¥{{ (item.original_price / 100).toFixed(2) }}</span>
          </div>
          <div v-if="item.tag" class="commodity-tag">{{ item.tag }}</div>
        </div>
      </div>
    </div>
    <div v-if="pagination && commodities.length > 0" class="pagination">
      <button
        :disabled="pagination.page === 1"
        @click="handlePageChange(pagination.page - 1)"
      >
        上一页
      </button>
      <span>{{ pagination.page }} / {{ Math.ceil(pagination.total_rows / pagination.page_size) }}</span>
      <button
        :disabled="pagination.page >= Math.ceil(pagination.total_rows / pagination.page_size)"
        @click="handlePageChange(pagination.page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getCommodityListByCategory } from '@/api/commodity';
import type { Commodity } from '@/api/commodity';
import type { PaginationParams } from '@/types/api'
import { useCommodityStore } from '@/stores/commodity';

const router = useRouter();
const props = defineProps<{
  categoryId: number;
  initialPage?: number;
}>();

const commodities = ref<Commodity[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<PaginationParams | null | undefined>(null);
const commodityStore = useCommodityStore();

const fetchCommodities = async (page: number = props.initialPage || 1) => {
  loading.value = true;
  error.value = null;
  try {
    console.log('开始获取商品列表, categoryId:', props.categoryId, 'page:', page);
    const response = await getCommodityListByCategory(props.categoryId, page);
    console.log('获取到的商品数据:', response);
    commodities.value = response.data.data;
    pagination.value = response.data.Pagination;
    // 保存当前页码到 store
    commodityStore.setCurrentPage(page);
  } catch (err) {
    error.value = '获取商品列表失败';
    console.error('获取商品列表失败:', err);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  fetchCommodities(page);
};

const formatImageUrl = (url: string) => {
  return url.replace('https://', 'http://');
};

const goToDetail = (id: number) => {
  router.push(`/commodity/${id}`);
};

watch(() => props.categoryId, (newId) => {
  if (newId) {
    fetchCommodities();
  }
}, { immediate: true });
</script>

<style scoped>
.commodity-list {
  padding: 20px;
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #ff4d4f;
}

.empty {
  color: #999;
}

.commodity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.commodity-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.commodity-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: #e0e0e0;
}

.commodity-item:hover .commodity-name {
  color: #ff4d4f;
}

.commodity-item:hover .commodity-image {
  transform: scale(1.05);
}

.commodity-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.commodity-info {
  padding: 12px;
}

.commodity-name {
  font-size: 16px;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.commodity-intro {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.commodity-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selling-price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>
