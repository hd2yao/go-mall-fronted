<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref<boolean>(true)
const cartItems = ref<CartItem[]>([])
const selectedItems = ref<number[]>([])
const allSelected = ref<boolean>(false)

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item) => selectedItems.value.includes(item.cart_item_id))
    .reduce((total, item) => {
      return total + item.commodity_num * item.commodity_selling_price
    }, 0)
    .toFixed(2)
})

// 计算选中的商品数量
const selectedCount = computed(() => {
  return selectedItems.value.length
})

onMounted(async () => {
  await fetchCartItems()
})

// 获取购物车商品
const fetchCartItems = async () => {
  loading.value = true
  try {
    const result = await cartStore.getCartList()
    cartItems.value = result as unknown as CartItem[]
    loading.value = false
  } catch (error) {
    console.error('获取购物车失败:', error)
    ElMessage.error('获取购物车失败')
    loading.value = false
  }
}

// 更新商品数量
const updateQuantity = async (item: CartItem, newQuantity: number) => {
  try {
    await cartStore.updateCartItem(item.cart_item_id, newQuantity)
    ElMessage.success('数量已更新')
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
  }
}

// 删除购物车商品
const removeCartItem = async (itemId: number) => {
  try {
    await ElMessageBox.confirm('确定要从购物车中移除该商品吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await cartStore.deleteCartItem(itemId)
    // 从选中列表中移除
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId)
    ElMessage.success('商品已从购物车移除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

// 选择/取消选择单个商品
const toggleSelectItem = (itemId: number) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index === -1) {
    selectedItems.value.push(itemId)
  } else {
    selectedItems.value.splice(index, 1)
  }
  updateAllSelected()
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = cartItems.value.map((item) => item.cart_item_id)
  }
  allSelected.value = !allSelected.value
}

// 更新全选状态
const updateAllSelected = () => {
  allSelected.value =
    cartItems.value.length > 0 && selectedItems.value.length === cartItems.value.length
}

// 结算
const checkout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请至少选择一件商品')
    return
  }

  // 将选中的商品ID存储到store中，用于结算页面
  cartStore.selectedItems = selectedItems.value
  router.push('/checkout')
}

// 继续购物
const continueShopping = () => {
  router.push('/')
}
</script>

<template>
  <div class="cart-container">
    <h1 class="cart-title">我的购物车</h1>

    <el-card shadow="never" class="cart-card">
      <el-skeleton :loading="loading" animated :rows="5">
        <template #template>
          <div style="padding: 20px">
            <el-skeleton-item variant="p" style="width: 100%" />
            <div style="display: flex; margin-top: 20px">
              <el-skeleton-item
                variant="image"
                style="width: 100px; height: 100px; margin-right: 20px"
              />
              <div style="flex: 1">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <el-skeleton-item variant="text" style="margin-top: 10px; width: 60%" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
            </div>
            <div style="display: flex; margin-top: 20px">
              <el-skeleton-item
                variant="image"
                style="width: 100px; height: 100px; margin-right: 20px"
              />
              <div style="flex: 1">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <el-skeleton-item variant="text" style="margin-top: 10px; width: 60%" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="cartItems.length === 0" class="empty-cart">
            <el-empty description="购物车是空的">
              <el-button type="primary" @click="continueShopping">去购物</el-button>
            </el-empty>
          </div>

          <div v-else>
            <div class="cart-header">
              <el-checkbox v-model="allSelected" @change="toggleSelectAll">全选</el-checkbox>
              <span class="header-item">商品信息</span>
              <span class="header-item">单价</span>
              <span class="header-item">数量</span>
              <span class="header-item">小计</span>
              <span class="header-item">操作</span>
            </div>

            <el-divider />

            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item">
                <el-checkbox
                  :model-value="selectedItems.includes(item.cart_item_id)"
                  @change="() => toggleSelectItem(item.cart_item_id)"
                ></el-checkbox>

                <div class="item-info">
                  <el-image
                    :src="item.commodity_img"
                    fit="cover"
                    class="item-image"
                    @click="router.push(`/commodity/${item.commodity_id}`)"
                  ></el-image>
                  <div class="item-details">
                    <div class="item-name" @click="router.push(`/commodity/${item.commodity_id}`)">
                      {{ item.commodity_name }}
                    </div>
                  </div>
                </div>

                <div class="item-price">¥{{ item.commodity_selling_price }}</div>

                <div class="item-quantity">
                  <el-input-number
                    v-model="item.commodity_num"
                    :min="1"
                    :max="99"
                    size="small"
                    @change="(val: number) => updateQuantity(item, val)"
                  ></el-input-number>
                </div>

                <div class="item-subtotal">
                  ¥{{ (item.commodity_num * item.commodity_selling_price).toFixed(2) }}
                </div>

                <div class="item-actions">
                  <el-button type="danger" size="small" @click="removeCartItem(item.cart_item_id)"
                    >删除</el-button
                  >
                </div>
              </div>
            </div>

            <el-divider />

            <div class="cart-footer">
              <div class="footer-left">
                <el-checkbox v-model="allSelected" @change="toggleSelectAll">全选</el-checkbox>
                <el-button type="text" @click="continueShopping">继续购物</el-button>
              </div>

              <div class="footer-right">
                <div class="checkout-info">
                  <span
                    >已选择 <span class="highlight">{{ selectedCount }}</span> 件商品</span
                  >
                  <span
                    >合计: <span class="highlight price">¥{{ totalPrice }}</span></span
                  >
                </div>
                <el-button
                  type="danger"
                  size="large"
                  @click="checkout"
                  :disabled="selectedCount === 0"
                >
                  结算
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.cart-card {
  margin-bottom: 30px;
}

.empty-cart {
  padding: 40px 0;
  text-align: center;
}

.cart-header {
  display: grid;
  grid-template-columns: 60px 3fr 1fr 1fr 1fr 1fr;
  align-items: center;
  font-weight: bold;
  color: #606266;
}

.header-item {
  text-align: center;
}

.cart-items {
  margin-top: 10px;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 3fr 1fr 1fr 1fr 1fr;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-info {
  display: flex;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  cursor: pointer;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  cursor: pointer;
}

.item-name:hover {
  color: #409eff;
}

.item-price,
.item-quantity,
.item-subtotal,
.item-actions {
  text-align: center;
}

.item-subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.checkout-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.highlight {
  color: #f56c6c;
  font-weight: bold;
}

.price {
  font-size: 20px;
}
</style>
