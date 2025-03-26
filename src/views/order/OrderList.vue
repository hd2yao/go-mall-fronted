<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserOrders, cancelOrder, getPayTypeText, getPayStateText, shouldOrderBeCancelled, reorder } from '@/api/order'
import type { OrderDetail } from '@/api/order'
import { formatPrice } from '@/utils/format'

// 定义倒计时相关的类型和变量
interface OrderWithCountdown extends OrderDetail {
  remainingTime?: number;
}

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(2)
const orderList = ref<OrderWithCountdown[]>([])
const totalOrders = ref(0) // 总订单数量
const countdownTimers = ref<number[]>([])

// 格式化图片URL
const formatImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('https://', 'http://');
};

// 格式化订单状态
const formatOrderStatus = (status: string): 'warning' | 'info' | 'primary' | 'success' | 'danger' => {
  // 可以根据后端返回的状态值进行不同的样式处理
  const statusMap: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'danger'> = {
    '待付款': 'warning',
    '待发货': 'info',
    '待收货': 'primary',
    '已完成': 'success',
    '已取消': 'danger',
    '待评价': 'info'
  }
  return statusMap[status] || 'info'
}

// 判断是否可以支付
const canPay = (order: OrderDetail) => {
  // 如果订单应该被取消，则不能支付
  if (shouldOrderBeCancelled(order)) {
    return false;
  }

  // 只检查订单状态是否为待付款
  return order.status === '待付款';
}

// 判断是否需要重新支付（不再显示重新支付按钮）
const needRepay = () => {
  return false; // 不再检查支付状态
}

// 获取订单状态标签类型
const getOrderStatusTagType = (order: OrderDetail): 'warning' | 'info' | 'primary' | 'success' | 'danger' => {
  // 如果订单应该被取消（超时未支付），返回danger类型
  if (shouldOrderBeCancelled(order)) {
    return 'danger';
  }

  // 如果支付状态是支付失败，则显示danger
  if (order.pay_state === 3) {
    return 'danger';
  }

  // 否则使用原有逻辑
  return formatOrderStatus(order.status);
}

// 清除所有计时器
const clearAllCountdowns = () => {
  countdownTimers.value.forEach(timerId => {
    window.clearInterval(timerId);
  });
  countdownTimers.value = [];
};

// 组件卸载时清除所有计时器
onUnmounted(() => {
  clearAllCountdowns();
});

// 为待付款订单设置倒计时
const startCountdowns = () => {
  // 先清除所有计时器
  clearAllCountdowns();

  orderList.value.forEach((order) => {
    if (order.status !== '待付款') return;

    // 计算过期时间（创建时间+20分钟）
    const createTime = new Date(order.created_at).getTime();
    const now = Date.now();
    const expirationTime = createTime + 20 * 60 * 1000; // 20分钟过期时间

    // 检查是否已过期
    if (now > expirationTime) {
      // 过期的订单直接在前端显示状态变更，但不修改实际状态
      // 下次刷新页面时会从后端获取最新状态
      ElMessage.warning(`订单 ${order.order_no} 已超时，请刷新页面获取最新状态`);
      return;
    }

    // 计算剩余时间（秒）
    const remainingSeconds = Math.floor((expirationTime - now) / 1000);
    order.remainingTime = remainingSeconds;

    // 创建计时器
    const intervalId = window.setInterval(() => {
      if (order.remainingTime && order.remainingTime > 0) {
        order.remainingTime--;
      } else {
        // 清除计时器
        window.clearInterval(intervalId);

        // 从数组中移除计时器ID
        const idx = countdownTimers.value.indexOf(intervalId);
        if (idx !== -1) {
          countdownTimers.value.splice(idx, 1);
        }

        // 提示用户订单可能已过期，需要刷新
        ElMessage.warning(`订单 ${order.order_no} 已超时，请刷新页面获取最新状态`);
        // 不在前端修改订单状态，而是提示用户刷新页面
      }
    }, 1000);

    // 将计时器ID保存起来，以便组件卸载时清除
    countdownTimers.value.push(intervalId);
  });
};

// 显示倒计时
const shouldShowCountdown = (order: OrderWithCountdown) => {
  return canPay(order) && (order.remainingTime || 0) > 0;
};

// 格式化倒计时显示
const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 判断倒计时是否小于5分钟，用于显示警告颜色
const isCountdownWarning = (orderNo: string) => {
  const order = orderList.value.find(o => o.order_no === orderNo);
  return !!order && !!order.remainingTime && order.remainingTime > 0 && order.remainingTime < 300;
};

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    console.log('正在获取页码:', currentPage.value, '的订单数据')
    const res = await getUserOrders(currentPage.value, pageSize.value)
    if (res.data.code === 0) {
      // 根据新的接口返回格式获取订单列表
      orderList.value = (res.data.data || []) as OrderWithCountdown[]

      // 从Pagination对象中获取分页信息
      if (res.data.Pagination) {
        // 更新页码和页面大小（保持与接口一致）
        currentPage.value = res.data.Pagination.page
        pageSize.value = res.data.Pagination.page_size
        // 获取总记录数
        totalOrders.value = res.data.Pagination.total_rows || 0
      } else {
        // 如果没有Pagination对象但有数据，设置为至少当前数据长度
        if (totalOrders.value === 0 && orderList.value.length > 0) {
          totalOrders.value = orderList.value.length
        }
      }

      console.log('数据加载成功 - 当前页:', currentPage.value, '总数:', totalOrders.value)

      // 初始化倒计时
      startCountdowns()
    } else {
      ElMessage.error(res.data.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化页面时从URL获取页码和页面大小
const initPageFromUrl = () => {
  // 默认值设置
  currentPage.value = 1
  pageSize.value = 10 // 默认每页显示2项，与接口默认保持一致

  // 获取页码参数
  const pageParam = route.query.page
  if (pageParam) {
    const page = parseInt(pageParam as string)
    if (!isNaN(page) && page > 0) {
      console.log('从URL初始化页码:', page)
      currentPage.value = page
    }
  }

  // 获取页面大小参数
  const pageSizeParam = route.query.page_size
  if (pageSizeParam) {
    const size = parseInt(pageSizeParam as string)
    if (!isNaN(size) && size > 0) {
      console.log('从URL初始化页面大小:', size)
      pageSize.value = size
    }
  }

  console.log('初始化分页参数:', { page: currentPage.value, pageSize: pageSize.value })
}

// 分页组件切换处理 - 更新当前页码并更新URL
const handlePageChange = (page: number) => {
  console.log('分页组件触发切换:', page)

  // 更新当前页码
  currentPage.value = page

  // 手动更新URL
  updateUrlParams(page, pageSize.value)

  // 获取新页面数据
  fetchOrders()
}

// 分页大小改变处理
const handleSizeChange = (size: number) => {
  console.log('分页大小改变:', size)

  // 更新分页大小并重置为第一页
  pageSize.value = size
  currentPage.value = 1

  // 更新URL
  updateUrlParams(1, size)

  // 获取新数据
  fetchOrders()
}

// 更新URL参数的通用函数
const updateUrlParams = (page: number, page_size: number) => {
  const url = new URL(window.location.href)

  // 设置分页参数
  url.searchParams.set('page', page.toString())
  url.searchParams.set('page_size', page_size.toString())

  // 更新URL而不重新加载页面
  window.history.pushState({}, '', url)

  console.log('URL已更新:', url.toString())
}

// 组件挂载时初始化
onMounted(() => {
  console.log('订单列表组件挂载')
  initPageFromUrl()
  fetchOrders()
})

// 查看订单详情
const viewOrderDetail = (orderNo: string) => {
  // 跳转时带上当前分页参数
  router.push({
    path: `/order/${orderNo}`,
    query: {
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString()
    }
  })
}

// 取消订单
const handleCancelOrder = async (orderNo: string) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？此操作不可逆', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await cancelOrder(orderNo)
    if (res.data.code === 0) {
      // 提示用户刷新页面以获取最新状态
      ElMessage({
        message: '订单已取消，请刷新页面查看最新状态',
        type: 'success',
        duration: 5000
      })

      // 刷新订单列表，从后端获取最新数据
      fetchOrders()
    } else {
      ElMessage.error(res.data.msg || '取消订单失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 跳转到支付页面（临时使用订单详情页面）
const goPay = (orderNo: string) => {
  // 跳转到订单详情，带上支付参数和分页参数
  router.push({
    path: `/order/${orderNo}`,
    query: {
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString(),
      action: 'pay'
    }
  })
}

// 再来一单功能
const handleReorder = async (orderNo: string) => {
  loading.value = true
  try {
    const res = await reorder(orderNo)
    if (res.data.code === 0) {
      ElMessage.success('商品已添加到购物车')
      // 跳转到购物车页面
      router.push('/cart')
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('再来一单失败:', error)
    ElMessage.error('添加商品到购物车失败')
  } finally {
    loading.value = false
  }
}

// 检查订单是否可以"再来一单"（已完成或已取消的订单）
const canReorder = (order: OrderDetail) => {
  return order.status === '已完成' || order.status === '已取消' || order.status === '待评价'
}

// 检查订单是否可以评价
const canReview = (order: OrderDetail) => {
  return order.status === '待评价'
}

// 评价订单（暂时仅展示按钮）
const goToReview = (orderNo: string) => {
  ElMessage.info('点击了评价按钮，orderNo: ' + orderNo)
  // 实际实现时，这里应该跳转到评价页面
  // router.push(`/order/review/${orderNo}`)
}
</script>

<template>
  <div class="order-list-container" v-loading="loading">
    <div class="order-list-header">
      <h2>我的订单</h2>
    </div>

    <div class="empty-orders" v-if="orderList.length === 0 && !loading">
      <el-empty description="暂无订单" />
    </div>

    <div class="order-list" v-else>
      <div class="order-item" v-for="order in orderList" :key="order.order_no">
        <div class="order-header">
          <div class="order-info">
            <span class="order-time">下单时间：{{ order.created_at }}</span>
            <span class="order-no">订单编号：{{ order.order_no }}</span>
            <span v-if="order.pay_type > 0" class="pay-type">支付方式：{{ getPayTypeText(order.pay_type) }}</span>
            <span class="pay-state">支付状态：{{ getPayStateText(order.pay_state) }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getOrderStatusTagType(order)">{{ order.status }}</el-tag>
            <!-- 显示待付款订单的倒计时 -->
            <span
              v-if="shouldShowCountdown(order as OrderWithCountdown)"
              class="countdown-tag"
              :class="{'countdown-warning': isCountdownWarning(order.order_no)}"
            >
              付款倒计时: {{ formatCountdown(order.remainingTime || 0) }}
            </span>
          </div>
        </div>

        <div class="order-goods">
          <div
            class="goods-item"
            v-for="item in order.items"
            :key="item.commodity_id"
            @click="viewOrderDetail(order.order_no)"
          >
            <div class="goods-image">
              <img :src="formatImageUrl(item.commodity_img)" :alt="item.commodity_name">
            </div>
            <div class="goods-info">
              <div class="goods-name">{{ item.commodity_name }}</div>
              <div class="goods-price">¥{{ formatPrice(item.commodity_selling_price) }} × {{ item.commodity_num }}</div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>订单状态：<el-tag size="small" :type="formatOrderStatus(order.status)">{{ order.status }}</el-tag></span>
            <span style="margin-left: 15px;">实付金额：</span>
            <span class="price">¥{{ formatPrice(order.pay_money) }}</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="canPay(order)"
              type="primary"
              size="small"
              @click="goPay(order.order_no)"
            >
              去支付
            </el-button>
            <el-button
              v-if="needRepay()"
              type="warning"
              size="small"
              @click="goPay(order.order_no)"
            >
              重新支付
            </el-button>
            <el-button
              v-if="canPay(order)"
              type="danger"
              size="small"
              plain
              @click="handleCancelOrder(order.order_no)"
            >
              取消订单
            </el-button>
            <el-button
              type="primary"
              size="small"
              plain
              @click="viewOrderDetail(order.order_no)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="canReorder(order)"
              type="success"
              size="small"
              @click="handleReorder(order.order_no)"
            >
              再来一单
            </el-button>
            <el-button
              v-if="canReview(order)"
              type="info"
              size="small"
              @click="goToReview(order.order_no)"
            >
              评价
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="totalOrders > 0">
      <el-pagination
        background
        layout="sizes, prev, pager, next, total"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20]"
        :total="totalOrders"
        :pager-count="5"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.order-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-list-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.order-list-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.order-item {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.order-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.order-goods {
  padding: 0;
}

.goods-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.goods-item:hover {
  background-color: #f9f9f9;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-price {
  font-size: 14px;
  color: #999;
}

.order-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebeef5;
  background-color: #f8f9fa;
}

.order-total {
  font-size: 14px;
  color: #666;
}

.order-total .price {
  font-size: 16px;
  color: #e4393c;
  font-weight: bold;
  margin-left: 5px;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap; /* 允许按钮在必要时换行 */
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty-orders {
  background-color: #fff;
  padding: 50px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.countdown-tag {
  margin-left: 10px;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: #F0F9EB;
  color: #67C23A;
  border: 1px solid #E1F3D8;
}

.countdown-warning {
  background-color: #FEF0F0;
  color: #F56C6C;
  border: 1px solid #FDE2E2;
}

.pay-type {
  margin-left: 20px;
  color: #666;
  font-size: 14px;
}

.pay-state {
  margin-left: 20px;
  color: #666;
  font-size: 14px;
}
</style>
