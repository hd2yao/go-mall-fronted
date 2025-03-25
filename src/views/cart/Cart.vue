<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const router = useRouter()

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
    <div class="cart-header">
      <h2>我的购物车</h2>
    </div>

    <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的" />
    </div>

    <template v-else>
      <div class="cart-list">
        <div v-for="item in cartStore.cartItems" :key="item.cart_item_id" class="cart-item">
          <div class="item-image" @click="goToDetail(item.commodity_id)">
            <img :src="formatImageUrl(item.commodity_img)" :alt="item.commodity_name">
          </div>
          <div class="item-info">
            <h3 class="commodity-name" @click="goToDetail(item.commodity_id)">
              {{ item.commodity_name }}
            </h3>
            <p class="price">¥{{ formatPrice(item.commodity_selling_price) }}</p>
          </div>
          <div class="item-quantity">
            <el-input-number
              v-model="item.commodity_num"
              :min="1"
              :max="5"
              @change="(val) => handleUpdateQuantity(item.cart_item_id, val ?? 0)"
            />
          </div>
          <div class="item-total">
            <p>小计：¥{{ formatPrice(item.commodity_selling_price * item.commodity_num) }}</p>
          </div>
          <div class="item-actions">
            <el-button type="danger" @click="handleDelete(item.cart_item_id)">删除</el-button>
          </div>
        </div>
      </div>

      <div class="cart-footer">
        <div class="cart-summary">
          <p>商品总数：{{ cartStore.totalItems() }} 件</p>
          <p class="total-amount">合计：¥{{ formatPrice(cartStore.totalAmount()) }}</p>
        </div>
        <el-button type="primary" size="large">去结算</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-container {
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

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 120px;
  height: 120px;
  margin-right: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.item-image:hover {
  opacity: 0.8;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.commodity-name {
  margin: 0 0 10px;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.commodity-name:hover {
  color: #409EFF;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
}

.item-quantity {
  margin: 0 40px;
}

.item-total {
  margin: 0 40px;
  font-size: 16px;
  font-weight: bold;
}

.cart-footer {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-summary {
  font-size: 16px;
}

.total-amount {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.empty-cart {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}
</style>
