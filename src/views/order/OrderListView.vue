<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api'
import type { OrderListItem, OrderApi } from '@/types/order'

// 订单状态枚举
const ORDER_STATUS = {
  UNPAID: 0, // 待付款
  PAID: 1, // 已付款
  SHIPPED: 2, // 已发货
  COMPLETED: 3, // 已完成
  CANCELLED: 4, // 已取消
  REFUNDING: 5, // 退款中
  REFUNDED: 6, // 已退款
}

// 订单状态标签类型
const STATUS_TAG_TYPE: Record<number, string> = {
  [ORDER_STATUS.UNPAID]: 'warning',
  [ORDER_STATUS.PAID]: 'success',
  [ORDER_STATUS.SHIPPED]: 'primary',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'info',
  [ORDER_STATUS.REFUNDING]: 'danger',
  [ORDER_STATUS.REFUNDED]: 'info',
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

const router = useRouter()
const loading = ref(true)
const orders = ref<OrderListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await (orderApi as unknown as OrderApi).getOrderList({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
    })
    orders.value = (res.data as unknown as { list: OrderListItem[] }).list
    total.value = (res.data as unknown as { total: number }).total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}

// 每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

// 状态筛选变化
const handleStatusChange = () => {
  currentPage.value = 1
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = (orderNo: string) => {
  router.push(`/order/${orderNo}`)
}

// 支付订单
const payOrder = (orderNo: string) => {
  router.push(`/payment/${orderNo}`)
}

// 取消订单
const cancelOrder = async (orderNo: string) => {
  try {
    await (orderApi as unknown as OrderApi).cancelOrder(orderNo)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败')
  }
}

// 确认收货
const confirmReceive = async (orderNo: string) => {
  try {
    await (orderApi as unknown as OrderApi).confirmReceive(orderNo)
    ElMessage.success('已确认收货')
    fetchOrders()
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败')
  }
}

// 申请退款
const applyRefund = async (orderNo: string) => {
  try {
    await (orderApi as unknown as OrderApi).applyRefund(orderNo)
    ElMessage.success('退款申请已提交')
    fetchOrders()
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

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="order-list-container">
    <h1 class="page-title">我的订单</h1>

    <div class="filter-bar">
      <el-select
        v-model="statusFilter"
        placeholder="订单状态"
        clearable
        @change="handleStatusChange"
      >
        <el-option label="全部订单" value="" />
        <el-option
          v-for="(text, status) in STATUS_TEXT"
          :key="status"
          :label="text"
          :value="status"
        />
      </el-select>
    </div>

    <el-card shadow="never" class="order-list-card">
      <el-table v-loading="loading" :data="orders" style="width: 100%" empty-text="暂无订单数据">
        <el-table-column label="订单信息" min-width="300">
          <template #default="{ row }">
            <div class="order-info">
              <div class="order-no">订单号：{{ row.order_no }}</div>
              <div class="order-time">下单时间：{{ formatDate(row.create_time) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="商品信息" min-width="400">
          <template #default="{ row }">
            <div class="order-items">
              <div v-for="item in row.order_items" :key="item.id" class="order-item">
                <el-image :src="item.commodity_img" fit="cover" class="item-image" />
                <div class="item-info">
                  <div class="item-name">{{ item.commodity_name }}</div>
                  <div class="item-price">¥{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120" align="center">
          <template #default="{ row }">
            <div class="order-amount">
              <div class="total-price">¥{{ formatPrice(row.total_price) }}</div>
              <div class="payment-type">
                {{ row.payment_type === 'online' ? '在线支付' : '货到付款' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="STATUS_TAG_TYPE[row.status]" size="small">
              {{ STATUS_TEXT[row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <div class="order-actions">
              <el-button type="text" @click="viewOrderDetail(row.order_no)">查看详情</el-button>

              <!-- 待付款状态 -->
              <template v-if="row.status === ORDER_STATUS.UNPAID">
                <el-button type="text" @click="payOrder(row.order_no)">去支付</el-button>
                <el-button type="text" @click="cancelOrder(row.order_no)">取消订单</el-button>
              </template>

              <!-- 已发货状态 -->
              <template v-if="row.status === ORDER_STATUS.SHIPPED">
                <el-button type="text" @click="confirmReceive(row.order_no)">确认收货</el-button>
              </template>

              <!-- 已付款或已发货状态 -->
              <template
                v-if="row.status === ORDER_STATUS.PAID || row.status === ORDER_STATUS.SHIPPED"
              >
                <el-button type="text" @click="applyRefund(row.order_no)">申请退款</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.order-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-list-card {
  margin-bottom: 30px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-no {
  font-weight: bold;
  color: #333;
}

.order-time {
  font-size: 13px;
  color: #999;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  align-items: center;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 10px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 13px;
  color: #999;
}

.order-amount {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-price {
  font-weight: bold;
  color: #f56c6c;
}

.payment-type {
  font-size: 12px;
  color: #999;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
