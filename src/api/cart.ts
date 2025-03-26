import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// 购物车项目类型
export interface CartItem {
    cart_item_id: number
    user_id: number
    commodity_id: number
    commodity_num: number
    commodity_name: string
    commodity_img: string
    commodity_selling_price: number
    add_cart_at: string
}

// 添加到购物车请求参数
export interface AddToCartParams {
commodity_id: number
commodity_num: number
}

// 更新购物车商品数量请求参数
export interface UpdateCartItemParams {
item_id: number
commodity_num: number
}

// 购物车结算账单响应类型
export interface CartBillResponse {
  items: CartItem[]
  bill_detail: {
    coupon: {
      coupon_id: number
      coupon_name: string
      discount_money: number
    }
    discount: {
      discount_id: number
      discount_name: string
      discount_money: number
    }
    vip_discount_money: number
    original_total_price: number
    total_price: number
  }
}

// 获取购物车列表
export function getCartList() {
  return request<ApiResponse<CartItem[]>>({
    url: '/cart/item/',
    method: 'get'
  })
}

// 添加商品到购物车
export function addToCart(data: {
  commodity_id: number
  commodity_num: number
}) {
  return request<ApiResponse>({
    url: '/cart/add-item',
    method: 'post',
    data
  })
}

// 更新购物车商品数量
export function updateCartItem(data: {
  item_id: number
  commodity_num: number
}) {
  return request<ApiResponse>({
    url: '/cart/update-item',
    method: 'patch',
    data
  })
}

// 删除购物车商品
export function deleteCartItem(itemId: number) {
  return request<ApiResponse>({
    url: `/cart/item/${itemId}`,
    method: 'delete'
  })
}

// 获取购物车结算账单
export function getCartBill(itemIds: number[]) {
  const searchParams = new URLSearchParams()
  itemIds.forEach(id => {
    searchParams.append('item_id', id.toString())
  })

  return request<ApiResponse<CartBillResponse>>({
    url: `/cart/item/check-bill?${searchParams.toString()}`,
    method: 'get'
  })
}
