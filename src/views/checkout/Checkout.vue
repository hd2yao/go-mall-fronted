<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatPrice } from '@/utils/format'
import { getAddressList } from '@/api/user'
import type { Address } from '@/api/user'
import { getCartBill } from '@/api/cart'
import type { CartBillResponse } from '@/api/cart'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const addressList = ref<Address[]>([])
const selectedAddressId = ref<number | null>(null)
const billData = ref<CartBillResponse | null>(null)
const paymentMethod = ref('online')
const invoiceType = ref('none')

// 从 URL 中获取选中的商品 ID
const getItemIds = (): number[] => {
  const itemIdStr = route.query.itemIds as string
  if (!itemIdStr) return []
  return itemIdStr.split(',').map(id => parseInt(id))
}

// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
    if (res.data.code === 0) {
      addressList.value = res.data.data
      // 选择默认地址
      const defaultAddress = addressList.value.find(addr => addr.default === 1)
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress.id
      } else if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  }
}

// 获取结算账单
const fetchBillData = async () => {
  loading.value = true
  try {
    const itemIds = getItemIds()
    if (itemIds.length === 0) {
      ElMessage.error('未选择商品')
      router.push('/cart')
      return
    }

    const res = await getCartBill(itemIds)
    if (res.data.code === 0) {
      billData.value = res.data.data
    } else {
      ElMessage.error('获取账单失败')
      router.push('/cart')
    }
  } catch (error) {
    console.error('获取账单失败:', error)
    ElMessage.error('获取账单失败')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 选择地址
const selectAddress = (addressId: number) => {
  selectedAddressId.value = addressId
}

// 添加新地址
const goToAddAddress = () => {
  router.push('/user/address')
}

// 提交订单
const submitOrder = () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  ElMessageBox.alert('订单创建功能开发中...', '提示')
  // TODO: 这里将来需要调用创建订单的 API
}

// 格式化图片 URL
const formatImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('https://', 'http://');
};

// 获取选中的地址
const selectedAddress = computed(() => {
  if (!selectedAddressId.value) return null
  return addressList.value.find(addr => addr.id === selectedAddressId.value)
})

onMounted(async () => {
  await fetchAddressList()
  await fetchBillData()
})
</script>

<template>
  <div class="checkout-container" v-loading="loading">
    <div class="checkout-header">
      <div class="logo">
        <!-- <img src="http://static.toastmemo.com/img/go-mall/logo/go-mall-logo.png" alt="Go Mall"> -->
        <span>结算页</span>
      </div>
      <div class="checkout-steps">
        <div class="step active">1.填写订单信息</div>
        <div class="step-arrow"></div>
        <div class="step">2.确认订单并付款</div>
        <div class="step-arrow"></div>
        <div class="step">3.完成订单交易</div>
      </div>
    </div>

    <div class="checkout-content">
      <!-- 收货地址 -->
      <div class="address-section section">
        <div class="section-header">
          <h3>收货人信息</h3>
          <el-button type="primary" link @click="goToAddAddress">
            <el-icon><Plus /></el-icon>新增收货地址
          </el-button>
        </div>

        <div class="address-list">
          <template v-if="addressList.length > 0">
            <div
              v-for="address in addressList"
              :key="address.id"
              class="address-item"
              :class="{ active: selectedAddressId === address.id }"
              @click="selectAddress(address.id)"
            >
              <div class="address-info">
                <div class="user-info">
                  <span class="name">{{ address.masked_user_name }}</span>
                  <span class="phone">{{ address.masked_user_phone }}</span>
                  <el-tag v-if="address.default === 1" type="success" size="small">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ address.province_name }}{{ address.city_name }}{{ address.region_name }}{{ address.detail_address }}
                </div>
              </div>
            </div>
          </template>
          <el-empty v-else description="暂无收货地址，请添加" />
        </div>
      </div>

      <!-- 商品清单 -->
      <div class="goods-section section">
        <div class="section-header">
          <h3>商品清单</h3>
        </div>

        <div class="goods-list">
          <table class="goods-table">
            <thead>
              <tr>
                <th class="col-image">商品图片</th>
                <th class="col-info">商品信息</th>
                <th class="col-price">单价</th>
                <th class="col-quantity">数量</th>
                <th class="col-total">小计</th>
              </tr>
            </thead>
            <tbody v-if="billData?.items">
              <tr v-for="item in billData.items" :key="item.cart_item_id" class="goods-item">
                <td class="col-image">
                  <img :src="formatImageUrl(item.commodity_img)" :alt="item.commodity_name">
                </td>
                <td class="col-info">
                  <div class="goods-name">{{ item.commodity_name }}</div>
                </td>
                <td class="col-price">¥{{ formatPrice(item.commodity_selling_price) }}</td>
                <td class="col-quantity">{{ item.commodity_num }}</td>
                <td class="col-total">¥{{ formatPrice(item.commodity_selling_price * item.commodity_num) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section section">
        <div class="section-header">
          <h3>支付方式</h3>
        </div>

        <div class="payment-options">
          <div class="payment-option active">
            <el-radio v-model="paymentMethod" label="online" checked>在线支付</el-radio>
          </div>
        </div>
      </div>

      <!-- 发票信息 -->
      <div class="invoice-section section">
        <div class="section-header">
          <h3>发票信息</h3>
        </div>

        <div class="invoice-options">
          <el-radio v-model="invoiceType" label="none" checked>不开发票</el-radio>
          <el-radio v-model="invoiceType" label="electronic" checked>电子发票</el-radio>
          <el-radio v-model="invoiceType" label="paper" checked>纸质发票</el-radio>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="coupon-section section">
        <div class="section-header">
          <h3>优惠券</h3>
        </div>

        <div class="coupon-options">
          <div v-if="billData && billData.bill_detail.coupon.discount_money > 0" class="coupon-item">
            <span class="coupon-name">优惠券</span>
            <span class="coupon-amount">-¥{{ formatPrice(billData.bill_detail.coupon.discount_money) }}</span>
          </div>
          <div v-else class="no-coupon">暂无可用优惠券</div>
        </div>
      </div>

      <!-- 订单汇总 - 直接放在页面内容中 -->
      <div class="order-summary-section section">
        <div class="section-header">
          <h3>订单汇总</h3>
        </div>

        <div class="order-summary-content">
          <div class="order-summary-left">
            <div class="address-confirm" v-if="selectedAddress">
              <div class="address-confirm-title">收货地址：</div>
              <div class="address-confirm-content">
                <p>{{ selectedAddress.province_name }}{{ selectedAddress.city_name }}{{ selectedAddress.region_name }}{{ selectedAddress.detail_address }}</p>
                <p>{{ selectedAddress.masked_user_name }} {{ selectedAddress.masked_user_phone }}</p>
              </div>
            </div>
          </div>

          <div class="order-summary-right">
            <div class="summary-item">
              <span>商品总金额：</span>
              <span>¥{{ billData ? formatPrice(billData.bill_detail.original_total_price) : '0.00' }}</span>
            </div>
            <div class="summary-item" v-if="billData && billData.bill_detail.coupon.discount_money > 0">
              <span>优惠券抵扣：</span>
              <span>-¥{{ formatPrice(billData.bill_detail.coupon.discount_money) }}</span>
            </div>
            <div class="summary-item" v-if="billData && billData.bill_detail.discount.discount_money > 0">
              <span>活动优惠：</span>
              <span>-¥{{ formatPrice(billData.bill_detail.discount.discount_money) }}</span>
            </div>
            <div class="summary-item" v-if="billData && billData.bill_detail.vip_discount_money > 0">
              <span>会员优惠：</span>
              <span>-¥{{ formatPrice(billData.bill_detail.vip_discount_money) }}</span>
            </div>
            <div class="summary-item">
              <span>运费：</span>
              <span>¥0.00</span>
            </div>
            <div class="summary-item total">
              <span>实付款：</span>
              <span class="final-price">¥{{ billData ? formatPrice(billData.bill_detail.total_price) : '0.00' }}</span>
            </div>

            <div class="submit-order">
              <el-button type="primary" size="large" @click="submitOrder" :disabled="!selectedAddressId || !billData">
                提交订单
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 30px;
}

.checkout-header {
  background-color: #fff;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.logo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.logo span {
  font-size: 18px;
  color: #666;
}

.checkout-steps {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  padding: 8px 15px;
  font-size: 14px;
  color: #999;
}

.step.active {
  color: #e4393c;
  font-weight: bold;
}

.step-arrow {
  width: 15px;
  height: 15px;
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
  transform: rotate(45deg);
  margin: 0 10px;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

/* 地址样式 */
.address-list {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.address-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-item:hover {
  border-color: #e4393c;
}

.address-item.active {
  border-color: #e4393c;
  background-color: #fff8f8;
}

.user-info {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.name {
  font-weight: bold;
}

.phone {
  color: #666;
}

.address-detail {
  color: #666;
  line-height: 1.4;
}

/* 商品列表样式 */
.goods-list {
  padding: 0 20px 20px;
}

.goods-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.goods-table th {
  padding: 15px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #999;
  font-weight: normal;
}

.goods-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  text-align: center;
}

.goods-item:last-child td {
  border-bottom: none;
}

.col-image {
  width: 80px;
}

.col-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin: 0 auto;
  display: block;
}

.col-info {
  width: 40%;
  text-align: left;
}

.goods-name {
  color: #333;
  line-height: 1.4;
}

.col-price, .col-quantity, .col-total {
  width: 100px;
}

.col-total {
  color: #e4393c;
  font-weight: bold;
}

/* 支付方式 */
.payment-options, .invoice-options, .coupon-options {
  padding: 20px;
}

.payment-option {
  display: flex;
  align-items: center;
}

.payment-option.active {
  color: #e4393c;
}

/* 优惠券 */
.coupon-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.coupon-amount {
  color: #e4393c;
}

.no-coupon {
  color: #999;
}

/* 订单汇总 - 页面内 */
.order-summary-content {
  padding: 20px;
  display: flex;
  gap: 40px;
}

.order-summary-left {
  flex: 1;
}

.order-summary-right {
  width: 350px;
}

.address-confirm {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.address-confirm-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.address-confirm-content {
  color: #666;
  line-height: 1.6;
}

.address-confirm-content p {
  margin: 5px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #666;
}

.summary-item.total {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 15px 0;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.final-price {
  color: #e4393c;
  font-size: 20px;
  font-weight: bold;
}

.submit-order {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.submit-order .el-button {
  min-width: 150px;
  background-color: #e4393c;
  border-color: #e4393c;
}

.submit-order .el-button:hover {
  background-color: #c1272d;
  border-color: #c1272d;
}
</style>
