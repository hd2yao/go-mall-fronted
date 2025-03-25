import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCartList, addToCart, updateCartItem, deleteCartItem } from '@/api/cart'
import type { CartItem, AddToCartParams, UpdateCartItemParams } from '@/api/cart'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  // 购物车列表
  const cartItems = ref<CartItem[]>([])

  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      const res = await getCartList()
      if (res.data.code === 0) {
        cartItems.value = res.data.data
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error)
    }
  }

  // 添加商品到购物车
  const addItemToCart = async (params: AddToCartParams) => {
    try {
      const res = await addToCart(params)
      if (res.data.code === 0) {
        ElMessage.success('添加到购物车成功')
        await fetchCartList()
      }
    } catch (error) {
      console.error('添加到购物车失败:', error)
    }
  }

  // 更新购物车商品数量
  const updateItemInCart = async (params: UpdateCartItemParams) => {
    try {
      const res = await updateCartItem(params)
      if (res.data.code === 0) {
        ElMessage.success('更新购物车成功')
        await fetchCartList()
      }
    } catch (error) {
      console.error('更新购物车失败:', error)
    }
  }

  // 删除购物车商品
  const removeItemFromCart = async (itemId: number) => {
    try {
      const res = await deleteCartItem(itemId)
      if (res.data.code === 0) {
        ElMessage.success('删除成功')
        await fetchCartList()
      }
    } catch (error) {
      console.error('删除购物车商品失败:', error)
    }
  }

  // 计算购物车商品总数
  const totalItems = () => {
    return cartItems.value.reduce((sum, item) => sum + item.commodity_num, 0)
  }

  // 计算购物车总金额
  const totalAmount = () => {
    return cartItems.value.reduce((sum, item) => sum + item.commodity_selling_price * item.commodity_num, 0)
  }

  return {
    cartItems,
    fetchCartList,
    addItemToCart,
    updateItemInCart,
    removeItemFromCart,
    totalItems,
    totalAmount
  }
})
