<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api'
import type { OrderDetail, OrderApi } from '@/types/order'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderInfo = ref<OrderDetail | null>(null)
const paymentMethod = ref('alipay')
const countdown = ref(900) // 15分钟倒计时
const countdownTimer = ref<number | null>(null)

// 获取订单信息
const fetchOrderInfo = async () => {
  const orderNo = route.params.orderNo as string
  if (!orderNo) {
    ElMessage.error('订单号不存在')
    router.push('/order/list')
    return
  }

  loading.value = true
  try {
    const res = await orderApi.getOrderDetail(orderNo)
    orderInfo.value = res.data as unknown as OrderDetail

    // 如果订单已支付或已取消，跳转到订单详情页
    if (orderInfo.value && orderInfo.value.status !== 0) {
      ElMessage.info('订单状态已变更，跳转到订单详情页')
      router.push(`/order/${orderNo}`)
      return
    }

    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('获取订单信息失败:', error)
    ElMessage.error('获取订单信息失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdownTimer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer.value as number)
      ElMessage.warning('支付超时，订单即将自动取消')
      router.push('/order/list')
    }
  }, 1000)
}

// 格式化倒计时
const formatCountdown = () => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 支付订单
const payOrder = async () => {
  if (!orderInfo.value) return

  try {
    await (orderApi as unknown as OrderApi).payOrder({
      order_no: orderInfo.value.order_no,
      payment_method: paymentMethod.value,
    })

    ElMessage.success('支付成功')

    // 清除倒计时
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
    }

    // 跳转到订单详情页
    router.push(`/order/${orderInfo.value.order_no}`)
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败，请重试')
  }
}

// 取消支付
const cancelPayment = () => {
  if (!orderInfo.value) return
  router.push(`/order/${orderInfo.value.order_no}`)
}

// 格式化金额
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

// 组件卸载时清除定时器
onMounted(() => {
  fetchOrderInfo()

  return () => {
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
    }
  }
})
</script>

<template>
  <div class="payment-container">
    <h1 class="page-title">订单支付</h1>

    <el-card v-loading="loading" shadow="never" class="payment-card">
      <template v-if="orderInfo">
        <div class="payment-header">
          <div class="payment-amount">
            <span class="amount-label">支付金额</span>
            <span class="amount-value">¥{{ formatPrice(orderInfo.total_price) }}</span>
          </div>
          <div class="payment-countdown">
            <span class="countdown-label">支付剩余时间</span>
            <span class="countdown-value">{{ formatCountdown() }}</span>
          </div>
        </div>

        <div class="order-info">
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderInfo.order_no }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <div class="section-title">选择支付方式</div>
          <el-radio-group v-model="paymentMethod" class="payment-method-group">
            <el-radio label="alipay">
              <div class="payment-method-item">
                <img
                  src="https://img.alicdn.com/tfs/TB1RQSAqVzqK1RjSZFvXXcB7VXa-68-68.png"
                  alt="支付宝"
                  class="payment-icon"
                />
                <span>支付宝</span>
              </div>
            </el-radio>
            <el-radio label="wechat">
              <div class="payment-method-item">
                <img
                  src="https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.png"
                  alt="微信支付"
                  class="payment-icon"
                />
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio label="unionpay">
              <div class="payment-method-item">
                <img
                  src="https://www.unionpayintl.com/upload/image/20230217/1676595888751089442.png"
                  alt="银联支付"
                  class="payment-icon"
                />
                <span>银联支付</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="payment-actions">
          <el-button @click="cancelPayment">取消支付</el-button>
          <el-button type="primary" @click="payOrder">确认支付</el-button>
        </div>

        <div class="payment-tips">
          <p>温馨提示：</p>
          <p>1. 请在提交订单后15分钟内完成支付，超时订单将自动取消</p>
          <p>2. 如遇到支付问题，请联系客服：400-123-4567</p>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.payment-card {
  margin-bottom: 30px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 20px;
}

.amount-label,
.countdown-label {
  font-size: 14px;
  color: #909399;
  margin-right: 10px;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.countdown-value {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.order-info {
  margin-bottom: 20px;
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

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.payment-method-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 200px;
}

.payment-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.payment-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.payment-tips {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
}

.payment-tips p {
  margin: 5px 0;
}
</style>
