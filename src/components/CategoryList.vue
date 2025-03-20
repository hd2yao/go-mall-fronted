<template>
  <div class="category-list">
    <div v-for="category in categories" :key="category.id" class="category-item">
      <div class="category-name">{{ category.name }}</div>
      <div v-if="category.sub_categories" class="sub-categories">
        <div v-for="subCategory in category.sub_categories" :key="subCategory.id" class="sub-category-item">
          <div class="sub-category-name">{{ subCategory.name }}</div>
          <div v-if="subCategory.sub_categories" class="third-categories">
            <div
              v-for="thirdCategory in subCategory.sub_categories"
              :key="thirdCategory.id"
              class="third-category-item"
              @click="handleCategoryClick(thirdCategory)"
            >
              {{ thirdCategory.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCategoryHierarchy } from '@/api/commodity';
import type { Category } from '@/api/commodity';

const categories = ref<Category[]>([]);

const fetchCategories = async () => {
  try {
    const response = await getCategoryHierarchy();
    categories.value = response.data.data;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

const handleCategoryClick = (category: Category) => {
  emit('category-click', category);
};

const emit = defineEmits<{
  (e: 'category-click', category: Category): void;
}>();

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-list {
  padding: 20px;
}

.category-item {
  margin-bottom: 20px;
}

.category-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.sub-categories {
  margin-left: 20px;
}

.sub-category-item {
  margin-bottom: 15px;
}

.sub-category-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.third-categories {
  margin-left: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.third-category-item {
  padding: 5px 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.third-category-item:hover {
  background-color: #e0e0e0;
}
</style>
