// 订单状态枚举
export enum OrderStatus {
  UNPAID = 0, // 待付款
  PAID = 1, // 已付款
  SHIPPED = 2, // 已发货
  COMPLETED = 3, // 已完成
  CANCELLED = 4, // 已取消
  REFUNDING = 5, // 退款中
  REFUNDED = 6, // 已退款
}

// 订单项
export interface OrderItem {
  id: number
  order_id: number
  commodity_id: number
  commodity_name: string
  commodity_img: string
  price: number
  quantity: number
}

// 收货地址
export interface OrderAddress {
  receiver_name: string
  receiver_phone: string
  province: string
  city: string
  district: string
  detail_address: string
}

// 订单详情
export interface OrderDetail {
  id: number
  order_no: string
  user_id: number
  total_price: number
  payment_type: string
  status: OrderStatus
  create_time: string
  pay_time?: string
  ship_time?: string
  complete_time?: string
  cancel_time?: string
  address: OrderAddress
  order_items: OrderItem[]
}

// 订单列表项
export interface OrderListItem {
  id: number
  order_no: string
  user_id: number
  total_price: number
  payment_type: string
  status: OrderStatus
  create_time: string
  order_items: OrderItem[]
}

// 订单列表响应
export interface OrderListResponse {
  list: OrderListItem[]
  total: number
}

// 订单API接口
export interface OrderApi {
  getOrderList: (params: OrderListParams) => Promise<{ data: OrderListResponse }>
  getOrderDetail: (orderNo: string) => Promise<{ data: OrderDetail }>
  cancelOrder: (orderNo: string) => Promise<{ success: boolean; message: string }>
  confirmReceive: (orderNo: string) => Promise<{ success: boolean; message: string }>
  applyRefund: (orderNo: string) => Promise<{ success: boolean; message: string }>
  payOrder: (params: PayOrderParams) => Promise<{ success: boolean; message: string }>
}

// 订单列表查询参数
export interface OrderListParams {
  page: number
  limit: number
  status?: string | number
}

// 支付订单参数
export interface PayOrderParams {
  order_no: string
  payment_method: string
}
