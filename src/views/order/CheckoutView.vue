<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { orderApi } from '@/api'
import type { CartBill } from '@/types'

// 通用地址接口，兼容不同的字段名
interface GenericAddress {
  address_id?: number
  id?: string | number
  receiver_name?: string
  name?: string
  receiver_phone?: string
  phone?: string
  detail_address?: string
  detail?: string
  is_default?: number | boolean
  province: string
  city: string
  district: string
}

// API接口类型
interface OrderApi {
  getAddressList: () => Promise<{ data: GenericAddress[] }>
  createOrder: (params: OrderCreateParams) => Promise<{ data: { order_no: string } }>
}

interface OrderCreateParams {
  address_id: number | null
  payment_type: string
  [key: string]: unknown // 允许其他可能的参数
}

const router = useRouter()
const cartStore = useCartStore()

const loading = ref<boolean>(true)
const submitting = ref<boolean>(false)
const cartBill = ref<CartBill | null>(null)
const addresses = ref<GenericAddress[]>([])
const selectedAddressId = ref<number | null>(null)
const paymentMethod = ref<string>('online')

// 辅助函数，处理地址相关字段
const getAddressId = (address: GenericAddress): number => {
  const id = address.address_id || address.id
  return typeof id === 'string' ? parseInt(id, 10) : id || 0
}
const getReceiverName = (address: GenericAddress) => address.receiver_name || address.name || ''
const getReceiverPhone = (address: GenericAddress) => address.receiver_phone || address.phone || ''
const getDetailAddress = (address: GenericAddress) => address.detail_address || address.detail || ''
const isDefaultAddress = (address: GenericAddress) =>
  address.is_default === 1 || address.is_default === true

// 计算属性：是否可以提交订单
const canSubmit = computed(() => {
  return !!selectedAddressId.value && !!cartBill.value && cartBill.value.bill_detail.total_price > 0
})

onMounted(async () => {
  await Promise.all([fetchCartBill(), fetchAddresses()])
})

// 获取购物车账单
const fetchCartBill = async () => {
  loading.value = true
  try {
    const bill = await cartStore.checkCartBill()
    cartBill.value = bill as unknown as CartBill

    // 如果没有选中商品，跳转回购物车
    if (!cartBill.value || cartBill.value.bill_detail.total_price <= 0) {
      ElMessage.warning('请先选择要购买的商品')
      router.push('/cart')
      return
    }
  } catch (error) {
    console.error('获取结算信息失败:', error)
    ElMessage.error('获取结算信息失败')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 获取收货地址列表
const fetchAddresses = async () => {
  try {
    const res = await (orderApi as unknown as OrderApi).getAddressList()
    addresses.value = res.data

    // 如果有默认地址，自动选中
    const defaultAddress = addresses.value.find((addr) => isDefaultAddress(addr))
    if (defaultAddress) {
      selectedAddressId.value = getAddressId(defaultAddress)
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = getAddressId(addresses.value[0])
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  }
}

// 选择收货地址
const selectAddress = (addressId: number) => {
  selectedAddressId.value = addressId
}

// 添加新地址
const addNewAddress = () => {
  router.push('/user/address/add')
}

// 提交订单
const submitOrder = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  try {
    submitting.value = true

    // 确认提交
    await ElMessageBox.confirm('确认提交订单?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info',
    })

    // 提交订单
    const res = await (orderApi as unknown as OrderApi).createOrder({
      address_id: selectedAddressId.value,
      payment_type: paymentMethod.value,
    })

    // 清空购物车选中状态
    cartStore.selectedItems = []

    // 跳转到支付页面
    ElMessage.success('订单创建成功，即将跳转到支付页面')
    router.push(`/payment/${res.data.order_no}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交订单失败:', error)
      ElMessage.error('提交订单失败')
    }
  } finally {
    submitting.value = false
  }
}

// 返回购物车
const backToCart = () => {
  router.push('/cart')
}
</script>

<template>
  <div class="checkout-container">
    <h1 class="checkout-title">订单确认</h1>

    <el-card shadow="never" class="checkout-card">
      <el-skeleton :loading="loading" animated :rows="6">
        <template #template>
          <div style="padding: 20px">
            <el-skeleton-item variant="p" style="width: 60%" />
            <div style="margin-top: 20px">
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 90%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </div>
            <div style="margin-top: 20px">
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 90%" />
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="cartBill">
            <!-- 收货地址 -->
            <div class="section-title">收货地址</div>
            <div class="address-section">
              <div v-if="addresses.length > 0" class="address-list">
                <div
                  v-for="address in addresses"
                  :key="getAddressId(address)"
                  class="address-item"
                  :class="{ 'address-selected': selectedAddressId === getAddressId(address) }"
                  @click="selectAddress(getAddressId(address))"
                >
                  <div class="address-content">
                    <div class="address-header">
                      <span class="address-name">{{ getReceiverName(address) }}</span>
                      <span class="address-phone">{{ getReceiverPhone(address) }}</span>
                      <el-tag v-if="isDefaultAddress(address)" size="small" type="danger"
                        >默认</el-tag
                      >
                    </div>
                    <div class="address-detail">
                      {{ address.province }} {{ address.city }} {{ address.district }}
                      {{ getDetailAddress(address) }}
                    </div>
                  </div>
                  <div class="address-check">
                    <el-radio
                      :model-value="selectedAddressId"
                      :label="getAddressId(address)"
                      @change="selectAddress"
                    >
                      选择
                    </el-radio>
                  </div>
                </div>
                <div class="add-address">
                  <el-button type="dashed" @click="addNewAddress">+ 添加新地址</el-button>
                </div>
              </div>
              <div v-else class="no-address">
                <el-empty description="暂无收货地址">
                  <el-button type="primary" @click="addNewAddress">添加收货地址</el-button>
                </el-empty>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="section-title">商品信息</div>
            <div class="goods-section">
              <div class="goods-header">
                <span class="col-goods">商品信息</span>
                <span class="col-price">单价</span>
                <span class="col-quantity">数量</span>
                <span class="col-subtotal">小计</span>
              </div>

              <div class="goods-list">
                <div v-for="item in cartBill.items" :key="item.cart_item_id" class="goods-item">
                  <div class="col-goods goods-info">
                    <el-image :src="item.commodity_img" fit="cover" class="goods-image"></el-image>
                    <div class="goods-name">{{ item.commodity_name }}</div>
                  </div>
                  <div class="col-price">¥{{ item.commodity_selling_price }}</div>
                  <div class="col-quantity">{{ item.commodity_num }}</div>
                  <div class="col-subtotal">
                    ¥{{ (item.commodity_selling_price * item.commodity_num).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 支付方式 -->
            <div class="section-title">支付方式</div>
            <div class="payment-section">
              <el-radio-group v-model="paymentMethod">
                <el-radio label="online">在线支付</el-radio>
                <el-radio label="cod">货到付款</el-radio>
              </el-radio-group>
            </div>

            <!-- 订单金额 -->
            <div class="order-amount">
              <div class="amount-item">
                <span>商品总价：</span>
                <span>¥{{ cartBill.bill_detail.total_price }}</span>
              </div>
              <div class="amount-item">
                <span>运费：</span>
                <span>¥{{ '0.00' }}</span>
              </div>
              <div class="amount-item total">
                <span>应付总额：</span>
                <span class="total-price">¥{{ cartBill.bill_detail.total_price.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 提交订单 -->
            <div class="order-submit">
              <el-button @click="backToCart">返回购物车</el-button>
              <el-button
                type="danger"
                :disabled="!canSubmit"
                :loading="submitting"
                @click="submitOrder"
              >
                提交订单
              </el-button>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.checkout-card {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 地址样式 */
.address-section {
  margin-bottom: 30px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.address-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  display: flex;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #409eff;
}

.address-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.address-content {
  flex: 1;
}

.address-header {
  margin-bottom: 8px;
}

.address-name {
  font-weight: bold;
  margin-right: 10px;
}

.address-phone {
  color: #606266;
  margin-right: 10px;
}

.address-detail {
  color: #606266;
  line-height: 1.5;
}

.address-check {
  display: flex;
  align-items: center;
}

.add-address {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.no-address {
  padding: 30px 0;
}

/* 商品信息样式 */
.goods-section {
  margin-bottom: 30px;
}

.goods-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  background-color: #f5f7fa;
  padding: 12px 20px;
  font-weight: bold;
  border-radius: 4px;
}

.goods-list {
  margin-top: 10px;
}

.goods-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  align-items: center;
}

.goods-info {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
}

.goods-name {
  font-size: 14px;
  color: #303133;
}

.col-price,
.col-quantity,
.col-subtotal {
  text-align: center;
}

.col-subtotal {
  font-weight: bold;
  color: #f56c6c;
}

/* 支付方式样式 */
.payment-section {
  margin-bottom: 30px;
}

/* 订单金额样式 */
.order-amount {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.amount-item.total {
  font-size: 18px;
  font-weight: bold;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
}

.total-price {
  color: #f56c6c;
}

/* 提交订单样式 */
.order-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 15px;
}
</style>
