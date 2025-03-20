<template>
  <div class="commodity-page">
    <div class="page-container">
      <div class="category-sidebar">
        <CategoryList @category-click="handleCategoryClick" />
      </div>
      <div class="content-area">
        <CommodityList :category-id="commodityStore.selectedCategoryId" :initial-page="commodityStore.currentPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryList from '@/components/CategoryList.vue';
import CommodityList from '@/components/CommodityList.vue';
import type { Category } from '@/api/commodity';
import { useCommodityStore } from '@/stores/commodity';

const commodityStore = useCommodityStore();

const handleCategoryClick = (category: Category) => {
  commodityStore.setSelectedCategory(category.id);
};
</script>

<style scoped>
.commodity-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}

.category-sidebar {
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
