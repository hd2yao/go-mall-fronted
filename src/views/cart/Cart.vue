<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const router = useRouter()
const selectedItems = ref<Set<number>>(new Set())

// 计算选中商品的总价
const selectedTotal = computed(() => {
  return cartStore.cartItems
    .filter(item => selectedItems.value.has(item.cart_item_id))
    .reduce((total, item) => total + item.commodity_selling_price * item.commodity_num, 0)
})

// 计算选中商品的数量
const selectedCount = computed(() => {
  return selectedItems.value.size
})

// 全选状态
const isAllSelected = computed(() => {
  return cartStore.cartItems.length > 0 && selectedItems.value.size === cartStore.cartItems.length
})

// 切换全选状态
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value.clear()
  } else {
    cartStore.cartItems.forEach(item => {
      selectedItems.value.add(item.cart_item_id)
    })
  }
  selectedItems.value = new Set(selectedItems.value)
}

// 切换单个商品选中状态
const toggleItem = (itemId: number) => {
  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId)
  } else {
    selectedItems.value.add(itemId)
  }
  selectedItems.value = new Set(selectedItems.value)
}

// 在组件挂载时获取购物车列表
onMounted(() => {
  cartStore.fetchCartList()
})

// 更新商品数量
const handleUpdateQuantity = async (itemId: number, quantity: number) => {
  if (quantity > 5) {
    ElMessageBox.alert('单个商品最多只能购买5个', '提示')
    return
  }
  await cartStore.updateItemInCart({ item_id: itemId, commodity_num: quantity })
}

// 删除商品
const handleDelete = async (itemId: number) => {
  await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await cartStore.removeItemFromCart(itemId)
}

// 跳转到商品详情页
const goToDetail = (commodityId: number) => {
  router.push(`/commodity/${commodityId}`)
}

const formatImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('https://', 'http://');
};
</script>

<template>
  <div class="cart-container">
    <div class="cart-content">
      <div class="cart-header">
        <h2>我的购物车</h2>
      </div>

      <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车是空的" />
      </div>

      <template v-else>
        <div class="cart-list">
          <table class="cart-table">
            <thead>
              <tr>
                <th class="col-checkbox">
                  <el-checkbox
                    :model-value="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="col-image">商品图片</th>
                <th class="col-info">商品信息</th>
                <th class="col-quantity">数量</th>
                <th class="col-total text-right">小计</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartStore.cartItems" :key="item.cart_item_id" class="cart-item">
                <td class="col-checkbox">
                  <el-checkbox
                    :model-value="selectedItems.has(item.cart_item_id)"
                    @change="() => toggleItem(item.cart_item_id)"
                  />
                </td>
                <td class="col-image">
                  <img :src="formatImageUrl(item.commodity_img)" :alt="item.commodity_name" @click="goToDetail(item.commodity_id)">
                </td>
                <td class="col-info">
                  <div class="info-content">
                    <h3 class="commodity-name" @click="goToDetail(item.commodity_id)">
                      {{ item.commodity_name }}
                    </h3>
                    <p class="price">¥{{ formatPrice(item.commodity_selling_price) }}</p>
                  </div>
                </td>
                <td class="col-quantity">
                  <el-input-number
                    v-model="item.commodity_num"
                    :min="1"
                    :max="5"
                    @change="(val) => handleUpdateQuantity(item.cart_item_id, val ?? 0)"
                  />
                </td>
                <td class="col-total text-right">
                  <p>¥{{ formatPrice(item.commodity_selling_price * item.commodity_num) }}</p>
                </td>
                <td class="col-actions">
                  <el-button type="danger" @click="handleDelete(item.cart_item_id)">删除</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <div class="cart-footer" v-if="cartStore.cartItems.length > 0">
      <div class="cart-footer-content">
        <div class="cart-footer-left">
          <el-checkbox
            :model-value="isAllSelected"
            @change="toggleSelectAll"
          >全选</el-checkbox>
          <div class="cart-summary">
            <span>已选商品 {{ selectedCount }} 件</span>
            <span class="total-amount">合计：¥{{ formatPrice(selectedTotal) }}</span>
          </div>
        </div>
        <div class="cart-footer-right">
          <el-button
            type="primary"
            size="large"
            :disabled="selectedCount === 0"
            class="checkout-button"
          >
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  min-height: calc(100vh - 60px); /* 减去头部导航的高度 */
  padding-bottom: 80px; /* 为固定底部留出空间 */
  position: relative;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-header {
  margin-bottom: 20px;
}

.cart-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.cart-table th {
  padding: 15px;
  font-weight: bold;
  color: #333;
  text-align: left;
  border-bottom: 2px solid #eee;
}

.cart-table td {
  padding: 20px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.cart-item:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right !important;
  padding-right: 20px !important;
}

.col-checkbox {
  width: 40px;
  text-align: center !important;
  padding: 0 !important;
}

.col-checkbox :deep(.el-checkbox) {
  margin: 0;
  display: flex;
  justify-content: center;
}

.col-checkbox :deep(.el-checkbox__input) {
  margin: 0;
}

.col-image {
  width: 120px;
  text-align: center !important;
}

.col-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.col-image img:hover {
  opacity: 0.8;
}

.col-info {
  width: 400px;
}

.info-content {
  padding: 0 20px;
}

.commodity-name {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.commodity-name:hover {
  color: #409EFF;
}

.price {
  color: #ff6b6b;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.col-quantity {
  width: 180px;
  text-align: center !important;
}

.col-quantity :deep(.el-input-number) {
  width: 120px;
}

.col-total {
  width: 160px;
  text-align: center !important;
}

.col-total p {
  margin: 0;
  color: #ff6b6b;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.col-actions {
  width: 100px;
  text-align: center !important;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.cart-footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-footer-left {
  display: flex;
  align-items: center;
}

.cart-footer-left .el-checkbox {
  margin: 0 40px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-summary {
  display: flex;
  align-items: center;
}

.cart-summary > span {
  margin-right: 30px;
}

.cart-summary > span:last-child {
  margin-right: 0;
}

.total-amount {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
}

.checkout-button {
  min-width: 120px;
  margin-left: 20px;
}

.empty-cart {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}
</style>
