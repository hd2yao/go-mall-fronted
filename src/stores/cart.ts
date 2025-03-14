import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { cartApi } from '@/api'
import type { CartItem, CartBill, ApiResponse } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<CartItem[]>([])
  const cartBill = ref<CartBill | null>(null)
  const selectedItems = ref<number[]>([])

  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.commodity_num, 0)
  })

  const selectedCount = computed(() => {
    return cartItems.value
      .filter((item) => selectedItems.value.includes(item.cart_item_id))
      .reduce((total, item) => total + item.commodity_num, 0)
  })

  // 获取购物车列表
  async function getCartList() {
    try {
      const res = await cartApi.getCartList()
      cartItems.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 添加商品到购物车
  async function addToCart(commodityId: number, commodityNum: number) {
    try {
      await cartApi.addToCart({ commodity_id: commodityId, commodity_num: commodityNum })
      await getCartList()
    } catch (error) {
      throw error
    }
  }

  // 更新购物车商品数量
  async function updateCartItem(itemId: number, commodityNum: number) {
    try {
      await cartApi.updateCartItem({ item_id: itemId, commodity_num: commodityNum })
      await getCartList()
    } catch (error) {
      throw error
    }
  }

  // 删除购物车商品
  async function deleteCartItem(itemId: number) {
    try {
      await cartApi.deleteCartItem(itemId)
      // 从选中列表中移除
      selectedItems.value = selectedItems.value.filter((id) => id !== itemId)
      await getCartList()
    } catch (error) {
      throw error
    }
  }

  // 选择/取消选择购物项
  function toggleSelectItem(itemId: number) {
    const index = selectedItems.value.indexOf(itemId)
    if (index === -1) {
      selectedItems.value.push(itemId)
    } else {
      selectedItems.value.splice(index, 1)
    }
  }

  // 全选/取消全选
  function toggleSelectAll(select: boolean) {
    if (select) {
      selectedItems.value = cartItems.value.map((item) => item.cart_item_id)
    } else {
      selectedItems.value = []
    }
  }

  // 查看购物项账单
  async function checkCartBill() {
    if (selectedItems.value.length === 0) {
      cartBill.value = null
      return null
    }

    try {
      const res = await cartApi.checkCartBill(selectedItems.value)
      cartBill.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 清空购物车状态
  function clearCart() {
    cartItems.value = []
    cartBill.value = null
    selectedItems.value = []
  }

  return {
    cartItems,
    cartBill,
    selectedItems,
    cartCount,
    selectedCount,
    getCartList,
    addToCart,
    updateCartItem,
    deleteCartItem,
    toggleSelectItem,
    toggleSelectAll,
    checkCartBill,
    clearCart,
  }
})
