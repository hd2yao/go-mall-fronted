import request from './request'
import type { ApiResponse, Order, OrderCreateParams, OrderPayParams, PayInfo } from '@/types'
import type { OrderListParams, PayOrderParams } from '@/types/order'

// 创建订单
export function createOrder(data: OrderCreateParams) {
  return request<ApiResponse<{ order_no: string }>>({
    url: '/order/create',
    method: 'post',
    data,
  })
}

// 获取用户订单列表
export function getUserOrders(page: number = 1, pageSize: number = 10) {
  return request<ApiResponse<Order[]>>({
    url: `/order/user-order/?page=${page}&page_size=${pageSize}`,
    method: 'get',
  })
}

// 获取订单详情
export function getOrderDetail(orderNo: string) {
  return request<ApiResponse<Order>>({
    url: `/order/${orderNo}/info`,
    method: 'get',
  })
}

// 取消订单
export function cancelOrder(orderNo: string) {
  return request<ApiResponse<string>>({
    url: `/order/${orderNo}/cancel`,
    method: 'patch',
  })
}

// 发起订单支付
export function createOrderPay(data: OrderPayParams) {
  return request<ApiResponse<PayInfo>>({
    url: '/order/create-pay',
    method: 'post',
    data,
  })
}

// 获取订单列表
export function getOrderList(params: OrderListParams) {
  return request({
    url: '/api/orders',
    method: 'get',
    params,
  })
}

// 确认收货
export function confirmReceive(orderNo: string) {
  return request({
    url: `/api/orders/${orderNo}/receive`,
    method: 'post',
  })
}

// 申请退款
export function applyRefund(orderNo: string) {
  return request({
    url: `/api/orders/${orderNo}/refund`,
    method: 'post',
  })
}

// 支付订单
export function payOrder(data: PayOrderParams) {
  return request({
    url: '/api/orders/pay',
    method: 'post',
    data,
  })
}

export const orderApi = {
  getOrderList,
  getOrderDetail,
  cancelOrder,
  confirmReceive,
  applyRefund,
  payOrder,
}
