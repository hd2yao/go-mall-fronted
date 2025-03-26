<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, cancelOrder, getPayTypeText, getPayStateText, shouldOrderBeCancelled, reorder, createOrderPayment, PaymentResponse } from '@/api/order'
import type { OrderDetail } from '@/api/order'
import { formatPrice } from '@/utils/format'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const orderDetail = ref<OrderDetail | null>(null)

// 获取订单号和页码参数
const orderNo = computed(() => route.params.orderNo as string)
const fromPage = computed(() => {
  const page = route.query.page
  return page ? parseInt(page as string) : 1
})
const action = computed(() => route.query.action as string | undefined)

// 格式化图片URL
const formatImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace('https://', 'http://');
};

// 获取订单详情
const fetchOrderDetail = async () => {
  if (!orderNo.value) {
    ElMessage.error('订单号不能为空')
    router.push('/order/list')
    return
  }

  loading.value = true
  try {
    const res = await getOrderDetail(orderNo.value)
    if (res.data.code === 0) {
      orderDetail.value = res.data.data

      // 检查订单是否需要被取消（如果已经过期但状态仍为待付款）
      if (orderDetail.value && orderDetail.value.status === '待付款') {
        const createTime = new Date(orderDetail.value.created_at).getTime()
        const now = Date.now()
        const expirationTime = createTime + 20 * 60 * 1000 // 20分钟过期时间

        if (now > expirationTime) {
          // 订单已过期，更新状态
          orderDetail.value = {
            ...orderDetail.value,
            status: '已取消',
            pay_state: 0 // 订单过期时设置支付状态为0
          }
          ElMessage.warning('该订单已超时自动取消')
          // 不重新请求订单信息，直接在前端更新状态
          return
        }
      }

      // 为待付款订单启动倒计时
      startCountdown()
    } else {
      ElMessage.error(res.data.msg || '获取订单详情失败')
      router.push('/order/list')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 倒计时相关
const countdownTimer = ref<number>(0) // 倒计时剩余秒数
const countdownInterval = ref<number | null>(null) // 计时器ID

// 检查是否在付款期限内并启动倒计时
const startCountdown = () => {
  if (!orderDetail.value) return

  const { created_at, status } = orderDetail.value
  if (status !== '待付款') return

  // 检查是否已经过期
  const createTime = new Date(created_at).getTime()
  const now = Date.now()
  const expirationTime = createTime + 20 * 60 * 1000 // 20分钟过期时间

  if (now > expirationTime) {
    // 订单已过期，直接更新状态
    if (orderDetail.value) {
      orderDetail.value = {
        ...orderDetail.value,
        status: '已取消',
        pay_state: 0 // 订单过期时设置支付状态为0
      }
    }
    ElMessage.warning('该订单已超时自动取消')
    return
  }

  // 计算剩余时间（秒）
  let remainingTime = Math.floor((expirationTime - now) / 1000)
  countdownTimer.value = remainingTime

  // 设置倒计时
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }

  countdownInterval.value = window.setInterval(() => {
    remainingTime -= 1
    if (remainingTime <= 0) {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
      // 订单过期，更新状态
      if (orderDetail.value) {
        orderDetail.value = {
          ...orderDetail.value,
          status: '已取消',
          pay_state: 0 // 订单过期时设置支付状态为0
        }
      }
      ElMessage.warning('该订单已超时自动取消')
      // 不再重新获取订单信息，避免后端未更新pay_state导致前端显示不一致
    } else {
      countdownTimer.value = remainingTime
    }
  }, 1000)
}

// 将秒数转换为 mm:ss 格式
const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 判断倒计时是否小于5分钟，用于显示警告颜色
const isCountdownWarning = computed(() => {
  return countdownTimer.value > 0 && countdownTimer.value < 300 // 小于5分钟
})

// 组件卸载时清除计时器
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
})

// 取消订单
const handleCancelOrder = async () => {
  if (!orderDetail.value) return

  try {
    await ElMessageBox.confirm('确定要取消该订单吗？此操作不可逆', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await cancelOrder(orderNo.value)
    if (res.data.code === 0) {
      // 在本地直接更新订单状态和支付状态
      if (orderDetail.value) {
        orderDetail.value = {
          ...orderDetail.value,
          status: '已取消',
          pay_state: 0  // 手动取消订单时设置支付状态为0
        }
      }
      ElMessage.success('订单已取消')
      // 不再重新获取订单信息，避免后端未更新pay_state导致前端显示不一致
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

// 判断是否可以支付
const canPay = computed(() => {
  if (!orderDetail.value) return false

  // 如果订单已过期（超时未支付），则不能支付
  if (shouldOrderBeCancelled(orderDetail.value)) {
    return false
  }

  // 只检查订单状态是否为待付款
  return orderDetail.value.status === '待付款';
})

// 微信支付的配置参数
const wxPayConfig = ref<PaymentResponse | null>(null)
const payLoading = ref(false)

// 跳转到支付页面（示例函数，实际未实现）
const goPay = () => {
  if (!orderDetail.value) return

  ElMessage.info('正在准备支付，请选择支付方式')

  // 显示支付方式选择对话框
  ElMessageBox.confirm(
    '请选择支付方式',
    '订单支付',
    {
      confirmButtonText: '微信支付',
      cancelButtonText: '支付宝',
      distinguishCancelAndClose: true,
      type: 'info'
    }
  ).then(() => {
    // 微信支付
    startPayProcess(1)
  }).catch((action) => {
    if (action === 'cancel') {
      // 支付宝支付
      startPayProcess(2)
    }
  })
}

// 开始支付流程
const startPayProcess = async (payType: number) => {
  if (!orderDetail.value) return

  const payTypeText = payType === 1 ? '微信支付' : '支付宝支付'
  ElMessage.info(`已选择${payTypeText}，正在准备支付参数...`)

  payLoading.value = true
  try {
    // 调用创建支付订单的API
    const res = await createOrderPayment(orderNo.value, payType)

    if (res.data.code === 0 && res.data.data) {
      // 获取支付参数
      const payConfig = res.data.data as PaymentResponse
      wxPayConfig.value = payConfig

      if (payType === 1) {
        // 微信支付 - 调用微信支付SDK
        callWxPay(payConfig)
      } else if (payType === 2) {
        // 支付宝支付 - 目前后端暂不支持，显示提示
        ElMessage.warning('暂不支持支付宝支付，请选择微信支付')
      }
    } else {
      ElMessage.error(res.data.msg || '获取支付参数失败')
    }
  } catch (error: any) {
    console.error('获取支付参数失败:', error)
    ElMessage.error('获取支付参数失败: ' + (error.message || '未知错误'))
  } finally {
    payLoading.value = false
  }
}

// 调用微信支付SDK
const callWxPay = (payConfig: PaymentResponse) => {
  // 判断环境
  if (typeof window.WeixinJSBridge === 'undefined') {
    // 模拟微信支付环境
    ElMessageBox.alert(
      `<div style="text-align:center">
        <div style="font-size:18px;margin-bottom:10px">模拟微信支付</div>
        <div style="background:#f5f5f5;padding:15px;border-radius:4px;text-align:left;margin-bottom:15px">
          <div>订单号：${orderNo.value}</div>
          <div>金额：¥${orderDetail.value ? formatPrice(orderDetail.value.pay_money) : '0.00'}</div>
        </div>
        <div style="color:#999">（因在浏览器环境中无法调用真实微信支付，此处仅做演示）</div>
      </div>`,
      '微信支付',
      {
        confirmButtonText: '确认支付',
        dangerouslyUseHTMLString: true,
        callback: (action: string) => {
          if (action === 'confirm') {
            // 模拟支付成功
            ElMessage.success('支付成功！')
            // 刷新订单状态
            setTimeout(() => {
              fetchOrderDetail()
            }, 1000)
          }
        }
      }
    )
  } else {
    // 真实微信环境 - 调用WeixinJSBridge
    window.WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      {
        "appId": payConfig.appId,
        "timeStamp": payConfig.timeStamp,
        "nonceStr": payConfig.nonceStr,
        "package": payConfig.package,
        "signType": payConfig.signType,
        "paySign": payConfig.paySign
      },
      (res: any) => {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          // 支付成功
          ElMessage.success('支付成功！')
          // 刷新订单状态
          fetchOrderDetail()
        } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
          // 用户取消
          ElMessage.info('您已取消支付')
        } else {
          // 支付失败
          ElMessage.error('支付失败，请重试')
        }
      }
    )
  }
}

// 声明全局Window接口，添加WeixinJSBridge属性
declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (method: string, config: any, callback: (res: any) => void) => void
    }
  }
}

// 返回订单列表
const goBack = () => {
  // 返回时保留页码信息
  router.push(`/order/list?page=${fromPage.value}`)
}

// 再来一单功能
const handleReorder = async () => {
  if (!orderDetail.value) return

  loading.value = true
  try {
    const res = await reorder(orderNo.value)
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
const canReorder = computed(() => {
  if (!orderDetail.value) return false
  return orderDetail.value.status === '已完成' || orderDetail.value.status === '已取消' || orderDetail.value.status === '待评价'
})

// 检查订单是否可以评价
const canReview = computed(() => {
  if (!orderDetail.value) return false
  return orderDetail.value.status === '待评价'
})

// 评价订单（暂时仅展示按钮）
const goToReview = () => {
  ElMessage.info('点击了评价按钮，orderNo: ' + orderNo.value)
  // 实际实现时，这里应该跳转到评价页面
  // router.push(`/order/review/${orderNo.value}`)
}

// 在组件挂载时获取订单详情
onMounted(() => {
  fetchOrderDetail()

  // 检查是否有支付动作参数
  if (action.value === 'pay') {
    // 自动触发支付流程
    ElMessage.info('正在跳转到支付页面...')
    // 延迟调用支付函数，等待订单详情加载完成
    setTimeout(() => {
      if (canPay.value) {
        goPay()
      } else {
        ElMessage.success('该订单无需支付')
      }
    }, 1000)
  }
})
</script>

<template>
  <div class="order-detail-container" v-loading="loading">
    <div class="order-detail-header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回订单列表</span>
      </div>
      <h2>订单详情</h2>
    </div>

    <div v-if="orderDetail">
      <!-- 订单状态 -->
      <div class="order-status-section">
        <div class="status-icon" :class="orderDetail.status">
          <i class="el-icon-check" v-if="orderDetail.status === '已完成'"></i>
          <i class="el-icon-time" v-if="orderDetail.status === '待付款'"></i>
          <i class="el-icon-loading" v-if="orderDetail.status === '待发货'"></i>
          <i class="el-icon-truck" v-if="orderDetail.status === '待收货'"></i>
          <i class="el-icon-close" v-if="orderDetail.status === '已取消'"></i>
          <i class="el-icon-star-off" v-if="orderDetail.status === '待评价'"></i>
        </div>
        <div class="status-info">
          <h3>{{ orderDetail.status }}</h3>
          <p v-if="orderDetail.status === '待付款'">
            请尽快完成付款，以免订单自动取消
            <span
              v-if="countdownTimer > 0"
              class="countdown-display"
              :class="{'countdown-warning': isCountdownWarning}"
            >
              倒计时: {{ formatCountdown(countdownTimer) }}
            </span>
          </p>
          <p v-else-if="orderDetail.status === '已取消'">
            订单已取消
          </p>
          <p v-else-if="orderDetail.status === '待发货'">
            商家正在处理您的订单，请耐心等待
          </p>
          <p v-else-if="orderDetail.status === '待收货'">
            商品已经发出，请注意查收
          </p>
          <p v-else-if="orderDetail.status === '待评价'">
            您已收到商品，请对本次购物体验进行评价
          </p>
        </div>
        <div class="status-actions">
          <el-button v-if="canPay" type="primary" @click="goPay">去支付</el-button>
          <el-button v-if="canPay" type="danger" plain @click="handleCancelOrder">取消订单</el-button>
          <el-button v-if="canReview" type="info" @click="goToReview">评价</el-button>
          <el-button v-if="canReorder" type="success" @click="handleReorder">再来一单</el-button>
        </div>
      </div>

      <!-- 订单信息改为支付信息 -->
      <div class="order-info-section">
        <h3>支付信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderDetail.order_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ orderDetail.created_at }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ orderDetail ? getPayTypeText(orderDetail.pay_type) : '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态：</span>
            <span class="value" :class="{'pay-success': orderDetail?.pay_state === 2, 'pay-fail': orderDetail?.pay_state === 3}">
              {{ getPayStateText(orderDetail?.pay_state || 0) }}
            </span>
          </div>
          <div class="info-item" v-if="orderDetail.pay_trans_id">
            <span class="label">支付流水号：</span>
            <span class="value">{{ orderDetail.pay_trans_id }}</span>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="order-address-section">
        <h3>收货信息</h3>
        <div class="address-content">
          <p class="receiver">{{ orderDetail.address.user_name }} {{ orderDetail.address.user_phone }}</p>
          <p class="address">{{ orderDetail.address.province_name }}{{ orderDetail.address.city_name }}{{ orderDetail.address.region_name }}{{ orderDetail.address.detail_address }}</p>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="order-goods-section">
        <h3>商品信息</h3>
        <div class="goods-list">
          <div class="goods-header">
            <div class="goods-cell goods-info-cell">商品信息</div>
            <div class="goods-cell goods-price-cell">单价</div>
            <div class="goods-cell goods-quantity-cell">数量</div>
            <div class="goods-cell goods-subtotal-cell">小计</div>
          </div>
          <div class="goods-item" v-for="item in orderDetail.items" :key="item.commodity_id">
            <div class="goods-cell goods-info-cell">
              <div class="goods-image">
                <img :src="formatImageUrl(item.commodity_img)" :alt="item.commodity_name">
              </div>
              <div class="goods-name">{{ item.commodity_name }}</div>
            </div>
            <div class="goods-cell goods-price-cell">¥{{ formatPrice(item.commodity_selling_price) }}</div>
            <div class="goods-cell goods-quantity-cell">{{ item.commodity_num }}</div>
            <div class="goods-cell goods-subtotal-cell">¥{{ formatPrice(item.commodity_selling_price * item.commodity_num) }}</div>
          </div>
        </div>
      </div>

      <!-- 订单汇总 -->
      <div class="order-summary-section">
        <div class="summary-item">
          <span class="label">商品总金额：</span>
          <span class="value">¥{{ formatPrice(orderDetail.bill_money) }}</span>
        </div>
        <div class="summary-item" v-if="orderDetail.bill_money > orderDetail.pay_money">
          <span class="label">优惠金额：</span>
          <span class="value">-¥{{ formatPrice(orderDetail.bill_money - orderDetail.pay_money) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">运费：</span>
          <span class="value">¥0.00</span>
        </div>
        <div class="summary-item total">
          <span class="label">实付款：</span>
          <span class="value">¥{{ formatPrice(orderDetail.pay_money) }}</span>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="empty-detail">
      <el-empty description="订单不存在或已被删除" />
    </div>
  </div>
</template>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.back-button {
  display: flex;
  align-items: center;
  margin-right: 20px;
  cursor: pointer;
  color: #409eff;
}

.back-button:hover {
  color: #66b1ff;
}

.back-button span {
  margin-left: 5px;
}

.order-detail-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.order-status-section,
.order-info-section,
.order-address-section,
.order-goods-section,
.order-summary-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 20px;
}

.order-status-section {
  display: flex;
  align-items: center;
  position: relative;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
}

.status-icon.待付款 {
  background-color: #faad14;
  color: #fff;
}

.status-icon.待发货 {
  background-color: #1890ff;
  color: #fff;
}

.status-icon.待收货 {
  background-color: #52c41a;
  color: #fff;
}

.status-icon.已完成 {
  background-color: #52c41a;
  color: #fff;
}

.status-icon.已取消 {
  background-color: #f5222d;
  color: #fff;
}

.status-icon.待评价 {
  background-color: #909399;
  color: #fff;
}

.status-info {
  flex: 1;
}

.status-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}

.status-info p {
  margin: 0;
  color: #666;
}

.status-actions {
  position: absolute;
  right: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
}

.label {
  color: #666;
  width: 100px;
}

.value {
  color: #333;
  flex: 1;
}

.address-content {
  color: #333;
  line-height: 1.6;
}

.receiver {
  font-weight: bold;
  margin-bottom: 5px;
}

.goods-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.goods-header {
  display: flex;
  background-color: #f5f7fa;
  padding: 12px 0;
  font-weight: bold;
}

.goods-cell {
  padding: 0 10px;
  text-align: center;
}

.goods-info-cell {
  flex: 1;
  text-align: left;
  display: flex;
  align-items: center;
}

.goods-price-cell,
.goods-quantity-cell,
.goods-subtotal-cell {
  width: 120px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
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

.goods-name {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.order-summary-section {
  text-align: right;
}

.summary-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-item .label {
  width: auto;
  margin-right: 10px;
}

.summary-item .value {
  width: 100px;
  display: inline-block;
}

.summary-item.total {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.summary-item.total .value {
  color: #e4393c;
  font-size: 18px;
}

.empty-detail {
  background-color: #fff;
  padding: 50px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.countdown-display {
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  color: #67C23A;
  background-color: #F0F9EB;
  border: 1px solid #E1F3D8;
}

.countdown-warning {
  color: #F56C6C;
  background-color: #FEF0F0;
  border: 1px solid #FDE2E2;
}

.pay-success {
  color: #67C23A;
}

.pay-fail {
  color: #F56C6C;
}
</style>
