import request from './request'
import type { ApiResponse, CartItem, CartAddParams, CartUpdateParams, CartBill } from '@/types'

// 获取购物车列表
export function getCartList() {
  return request<ApiResponse<CartItem[]>>({
    url: '/cart/item/',
    method: 'get',
  })
}

// 添加商品到购物车
export function addToCart(data: CartAddParams) {
  return request<ApiResponse<string>>({
    url: '/cart/add-item',
    method: 'post',
    data,
  })
}

// 更新购物车商品数量
export function updateCartItem(data: CartUpdateParams) {
  return request<ApiResponse<string>>({
    url: '/cart/update-item',
    method: 'patch',
    data,
  })
}

// 删除购物车商品
export function deleteCartItem(itemId: number) {
  return request<ApiResponse<string>>({
    url: `/cart/item/${itemId}`,
    method: 'delete',
  })
}

// 查看购物项账单
export function checkCartBill(itemIds: number[]) {
  const queryString = itemIds.map((id) => `item_id=${id}`).join('&')
  return request<ApiResponse<CartBill>>({
    url: `/cart/item/check-bill?${queryString}`,
    method: 'get',
  })
}
