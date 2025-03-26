import request from '@/utils/request'

/**
 * 计算订单过期时间（创建时间后的20分钟）
 * @param createdAt 订单创建时间
 * @returns 过期时间的时间戳
 */
export function getOrderExpiryTime(createdAt: string): number {
  // 订单创建时间 + 20分钟
  const createdTime = new Date(createdAt).getTime()
  const expiryTime = createdTime + 20 * 60 * 1000 // 20分钟的毫秒数
  return expiryTime
}

/**
 * 检查订单是否过期（超过创建后20分钟）
 * @param createdAt 订单创建时间
 * @returns 是否已过期
 */
export function isOrderExpired(createdAt: string): boolean {
  const expiryTime = getOrderExpiryTime(createdAt)
  const now = new Date().getTime()
  return now > expiryTime
}

/**
 * 判断订单是否应该被取消（过期未支付）
 * @param order 订单对象
 * @returns 是否应该被取消
 */
export function shouldOrderBeCancelled(order: OrderDetail): boolean {
  // 只有待付款状态的订单且支付状态不是成功时才需要检查是否过期
  if (order.status === '待付款' && order.pay_state !== 2) {
    return isOrderExpired(order.created_at)
  }
  return false
}

/**
 * 获取订单剩余支付时间（秒）
 * @param createdAt 订单创建时间
 * @returns 剩余秒数，如果已过期返回0
 */
export function getOrderRemainingTime(createdAt: string): number {
  const expiryTime = getOrderExpiryTime(createdAt)
  const now = new Date().getTime()
  const remainingTime = Math.max(0, expiryTime - now)
  return Math.floor(remainingTime / 1000)
}

/**
 * 创建订单
 * @param cartItemIds 购物项ID列表
 * @param userAddressId 用户地址ID
 */
export function createOrder(cartItemIds: number[], userAddressId: number) {
  return request({
    url: '/order/create',
    method: 'POST',
    data: {
      cart_item_id_list: cartItemIds,
      user_address_id: userAddressId
    }
  })
}

// 订单项类型
export interface OrderItem {
  commodity_id: number
  commodity_name: string
  commodity_img: string
  commodity_selling_price: number
  commodity_num: number
}

// 订单地址类型
export interface OrderAddress {
  user_name: string
  user_phone: string
  province_name: string
  city_name: string
  region_name: string
  detail_address: string
}

// 订单详情类型
export interface OrderDetail {
  order_no: string
  pay_trans_id: string
  pay_type: number // 支付类型 0-未确定 1-微信支付 2-支付宝
  pay_state: number // 0-未发起支付, 1-待支付，2-支付成功，3-支付失败
  bill_money: number
  pay_money: number
  status: string    // 订单状态: 待付款、待发货、待收货、已完成、已取消、待评价等
  address: OrderAddress
  items: OrderItem[]
  created_at: string
}

/**
 * 获取支付状态的文字描述
 * @param payState 支付状态码
 */
export function getPayStateText(payState: number): string {
  const stateMap: Record<number, string> = {
    0: '未发起支付',
    1: '待支付',
    2: '支付成功',
    3: '支付失败'
  }
  return stateMap[payState] || '未知状态'
}

/**
 * 获取支付类型的文字描述
 * @param payType 支付类型码
 */
export function getPayTypeText(payType: number): string {
  const typeMap: Record<number, string> = {
    0: '未确定',
    1: '微信支付',
    2: '支付宝'
  }
  return typeMap[payType] || '未确定'
}

/**
 * 获取用户订单列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export function getUserOrders(page: number = 1, pageSize: number = 10) {
  return request({
    url: `/order/user-order/`,
    method: 'GET',
    params: {
      page,
      page_size: pageSize
    }
  })
}

/**
 * 获取订单详情
 * @param orderNo 订单编号
 */
export function getOrderDetail(orderNo: string) {
  return request({
    url: `/order/${orderNo}/info`,
    method: 'GET'
  })
}

/**
 * 取消订单
 * @param orderNo 订单编号
 */
export function cancelOrder(orderNo: string) {
  return request({
    url: `/order/${orderNo}/cancel`,
    method: 'PATCH'
  })
}

/**
 * 再来一单（重新添加订单中的商品到购物车）
 * @param orderNo 订单编号
 */
export function reorder(orderNo: string) {
  return request({
    url: `/cart/reorder/${orderNo}`,
    method: 'POST'
  })
}
