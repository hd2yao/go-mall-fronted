<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api'
import type { OrderDetail, OrderApi } from '@/types/order'

// 订单状态枚举
const ORDER_STATUS: Record<string, number> = {
  UNPAID: 0, // 待付款
  PAID: 1, // 已付款
  SHIPPED: 2, // 已发货
  COMPLETED: 3, // 已完成
  CANCELLED: 4, // 已取消
  REFUNDING: 5, // 退款中
  REFUNDED: 6, // 已退款
}

// 订单状态文本
const STATUS_TEXT: Record<number, string> = {
  [ORDER_STATUS.UNPAID]: '待付款',
  [ORDER_STATUS.PAID]: '已付款',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDING]: '退款中',
  [ORDER_STATUS.REFUNDED]: '已退款',
}

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderDetail = ref<OrderDetail | null>(null)

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderNo = route.params.orderNo as string
  if (!orderNo) {
    ElMessage.error('订单号不存在')
    router.push('/order/list')
    return
  }

  loading.value = true
  try {
    const res = await orderApi.getOrderDetail(orderNo)
    orderDetail.value = res.data as unknown as OrderDetail
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 支付订单
const payOrder = () => {
  if (!orderDetail.value) return
  router.push(`/payment/${orderDetail.value.order_no}`)
}

// 取消订单
const cancelOrder = async () => {
  if (!orderDetail.value) return
  try {
    await (orderApi as unknown as OrderApi).cancelOrder(orderDetail.value.order_no)
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败')
  }
}

// 确认收货
const confirmReceive = async () => {
  if (!orderDetail.value) return
  try {
    await (orderApi as unknown as OrderApi).confirmReceive(orderDetail.value.order_no)
    ElMessage.success('已确认收货')
    fetchOrderDetail()
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败')
  }
}

// 申请退款
const applyRefund = async () => {
  if (!orderDetail.value) return
  try {
    await (orderApi as unknown as OrderApi).applyRefund(orderDetail.value.order_no)
    ElMessage.success('退款申请已提交')
    fetchOrderDetail()
  } catch (error) {
    console.error('申请退款失败:', error)
    ElMessage.error('申请退款失败')
  }
}

// 格式化时间
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 格式化金额
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

// 返回订单列表
const backToList = () => {
  router.push('/order/list')
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<template>
  <div class="order-detail-container">
    <h1 class="page-title">订单详情</h1>

    <el-card v-loading="loading" shadow="never" class="order-detail-card">
      <template v-if="orderDetail">
        <!-- 订单状态 -->
        <div class="order-status-section">
          <div class="status-info">
            <div class="status-text">{{ STATUS_TEXT[orderDetail.status] }}</div>
            <div class="status-desc">
              <template v-if="orderDetail.status === ORDER_STATUS.UNPAID">
                请在24小时内完成支付，超时订单将自动取消
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.PAID">
                商家正在处理您的订单，请耐心等待
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.SHIPPED">
                商品已发货，请注意查收
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.COMPLETED">
                订单已完成，感谢您的购买
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.CANCELLED">
                订单已取消
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.REFUNDING">
                退款申请处理中，请耐心等待
              </template>
              <template v-else-if="orderDetail.status === ORDER_STATUS.REFUNDED">
                退款已完成
              </template>
            </div>
          </div>

          <div class="status-actions">
            <!-- 待付款状态 -->
            <template v-if="orderDetail.status === ORDER_STATUS.UNPAID">
              <el-button type="primary" @click="payOrder">去支付</el-button>
              <el-button @click="cancelOrder">取消订单</el-button>
            </template>

            <!-- 已发货状态 -->
            <template v-if="orderDetail.status === ORDER_STATUS.SHIPPED">
              <el-button type="primary" @click="confirmReceive">确认收货</el-button>
            </template>

            <!-- 已付款或已发货状态 -->
            <template
              v-if="
                orderDetail.status === ORDER_STATUS.PAID ||
                orderDetail.status === ORDER_STATUS.SHIPPED
              "
            >
              <el-button @click="applyRefund">申请退款</el-button>
            </template>
          </div>
        </div>

        <el-divider />

        <!-- 订单信息 -->
        <div class="order-info-section">
          <div class="section-title">订单信息</div>
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderDetail.order_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(orderDetail.create_time) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{
              orderDetail.payment_type === 'online' ? '在线支付' : '货到付款'
            }}</span>
          </div>
          <div v-if="orderDetail.pay_time" class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatDate(orderDetail.pay_time) }}</span>
          </div>
          <div v-if="orderDetail.ship_time" class="info-item">
            <span class="label">发货时间：</span>
            <span class="value">{{ formatDate(orderDetail.ship_time) }}</span>
          </div>
          <div v-if="orderDetail.complete_time" class="info-item">
            <span class="label">完成时间：</span>
            <span class="value">{{ formatDate(orderDetail.complete_time) }}</span>
          </div>
        </div>

        <!-- 收货信息 -->
        <div class="shipping-info-section">
          <div class="section-title">收货信息</div>
          <div class="info-item">
            <span class="label">收货人：</span>
            <span class="value">{{ orderDetail.address.receiver_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ orderDetail.address.receiver_phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货地址：</span>
            <span class="value">
              {{ orderDetail.address.province }}
              {{ orderDetail.address.city }}
              {{ orderDetail.address.district }}
              {{ orderDetail.address.detail_address }}
            </span>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="goods-section">
          <div class="section-title">商品信息</div>
          <el-table :data="orderDetail.order_items" style="width: 100%">
            <el-table-column label="商品信息" min-width="400">
              <template #default="{ row }">
                <div class="goods-item">
                  <el-image :src="row.commodity_img" fit="cover" class="goods-image"></el-image>
                  <div class="goods-info">
                    <div class="goods-name">{{ row.commodity_name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="单价" width="120" align="center">
              <template #default="{ row }"> ¥{{ formatPrice(row.price) }} </template>
            </el-table-column>

            <el-table-column label="数量" width="100" align="center">
              <template #default="{ row }">
                {{ row.quantity }}
              </template>
            </el-table-column>

            <el-table-column label="小计" width="120" align="center">
              <template #default="{ row }"> ¥{{ formatPrice(row.price * row.quantity) }} </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 金额信息 -->
        <div class="amount-section">
          <div class="amount-item">
            <span class="label">商品总价：</span>
            <span class="value">¥{{ formatPrice(orderDetail.total_price) }}</span>
          </div>
          <div class="amount-item">
            <span class="label">运费：</span>
            <span class="value">¥0.00</span>
          </div>
          <div class="amount-item total">
            <span class="label">实付金额：</span>
            <span class="value price">¥{{ formatPrice(orderDetail.total_price) }}</span>
          </div>
        </div>

        <div class="actions">
          <el-button @click="backToList">返回订单列表</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.order-detail-card {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.order-status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-text {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 5px;
}

.status-desc {
  color: #909399;
}

.status-actions {
  display: flex;
  gap: 10px;
}

.order-info-section,
.shipping-info-section,
.goods-section,
.amount-section {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.label {
  width: 100px;
  color: #909399;
}

.value {
  flex: 1;
  color: #303133;
}

.goods-item {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  color: #303133;
}

.amount-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.amount-item .label {
  width: auto;
  margin-right: 10px;
}

.amount-item.total {
  font-size: 18px;
  font-weight: bold;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
}

.price {
  color: #f56c6c;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
