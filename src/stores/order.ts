import { ref } from 'vue'
import { defineStore } from 'pinia'
import { orderApi } from '@/api'
import type { Order, OrderCreateParams, OrderPayParams, PayInfo } from '@/types'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const payInfo = ref<PayInfo | null>(null)

  // 创建订单
  async function createOrder(data: OrderCreateParams) {
    try {
      const res = await orderApi.createOrder(data)
      return res.data.order_no
    } catch (error) {
      throw error
    }
  }

  // 获取用户订单列表
  async function getUserOrders(page: number = 1, pageSize: number = 10) {
    try {
      const res = await orderApi.getUserOrders(page, pageSize)
      orderList.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 获取订单详情
  async function getOrderDetail(orderNo: string) {
    try {
      const res = await orderApi.getOrderDetail(orderNo)
      currentOrder.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 取消订单
  async function cancelOrder(orderNo: string) {
    try {
      await orderApi.cancelOrder(orderNo)
      // 更新当前订单状态
      if (currentOrder.value && currentOrder.value.order_no === orderNo) {
        currentOrder.value.status = '已取消'
      }
      // 更新订单列表中的状态
      const orderIndex = orderList.value.findIndex((order) => order.order_no === orderNo)
      if (orderIndex !== -1) {
        orderList.value[orderIndex].status = '已取消'
      }
    } catch (error) {
      throw error
    }
  }

  // 发起订单支付
  async function createOrderPay(orderNo: string, payType: number) {
    try {
      const res = await orderApi.createOrderPay({ order_no: orderNo, pay_type: payType })
      payInfo.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 清空订单状态
  function clearOrderState() {
    orderList.value = []
    currentOrder.value = null
    payInfo.value = null
  }

  return {
    orderList,
    currentOrder,
    payInfo,
    createOrder,
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    createOrderPay,
    clearOrderState,
  }
})
