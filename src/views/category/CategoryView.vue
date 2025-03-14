<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commodityApi } from '@/api'
import type { Category } from '@/types'

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(false)

onMounted(() => {
  fetchCategories()
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await commodityApi.getCategoryList()
    if (res && res.data) {
      categories.value = res.data as unknown as Category[]
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleCategoryClick = (categoryId: number) => {
  router.push(`/category/${categoryId}`)
}
</script>

<template>
  <div class="category-container">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <span>商品分类</span>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :rows="5" :count="3">
        <template #default>
          <div v-if="categories.length === 0" class="empty-category">
            <el-empty description="暂无商品分类"></el-empty>
          </div>

          <div v-else class="category-list">
            <div v-for="category in categories" :key="category.id" class="category-group">
              <div class="category-parent" @click="handleCategoryClick(category.id)">
                <el-image
                  v-if="category.icon_img"
                  :src="category.icon_img"
                  class="category-icon"
                  fit="cover"
                ></el-image>
                <span class="category-name">{{ category.name }}</span>
                <el-icon class="category-arrow"><arrow-right /></el-icon>
              </div>

              <div
                v-if="category.sub_categories && category.sub_categories.length > 0"
                class="category-children"
              >
                <div
                  v-for="subCategory in category.sub_categories"
                  :key="subCategory.id"
                  class="category-child"
                  @click="handleCategoryClick(subCategory.id)"
                >
                  <el-image
                    v-if="subCategory.icon_img"
                    :src="subCategory.icon_img"
                    class="sub-category-icon"
                    fit="cover"
                  ></el-image>
                  <span class="sub-category-name">{{ subCategory.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<style scoped>
.category-container {
  padding: 20px;
}

.category-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-category {
  padding: 40px 0;
  text-align: center;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-group {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.category-parent {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.category-parent:hover {
  background-color: #e6f1fc;
}

.category-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border-radius: 4px;
}

.category-name {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
}

.category-arrow {
  color: #909399;
}

.category-children {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  background-color: #fff;
}

.category-child {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-child:hover {
  transform: translateY(-3px);
}

.sub-category-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.sub-category-name {
  font-size: 14px;
  text-align: center;
  color: #606266;
}
</style>
