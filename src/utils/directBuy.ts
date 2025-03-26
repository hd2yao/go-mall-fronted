import { getCommodityDetail } from '@/api/commodity'
import type { CartBillResponse, CartItem } from '@/api/cart'

/**
 * 获取直接购买的账单数据
 * @param commodityId 商品ID
 * @param quantity 购买数量
 * @returns 账单数据
 */
export async function getDirectBuyBillData(commodityId: number, quantity: number): Promise<CartBillResponse> {
  if (!commodityId) {
    throw new Error('商品ID不能为空')
  }

  if (!quantity || quantity < 1) {
    throw new Error('购买数量必须大于0')
  }

  // 获取商品详情
  try {
    const res = await getCommodityDetail(commodityId)
    if (res.data.code !== 0 || !res.data.data) {
      throw new Error(res.data.msg || '获取商品详情失败')
    }

    const commodity = res.data.data

    // 检查库存
    if (commodity.stock_num < quantity) {
      throw new Error(`商品库存不足，当前库存${commodity.stock_num}件`)
    }

    // 构建购物车项
    const cartItem: CartItem = {
      cart_item_id: -1, // 临时ID，负数表示非购物车项
      user_id: 0, // 用户ID，这里不重要
      commodity_id: commodity.id,
      commodity_num: quantity,
      commodity_name: commodity.name,
      commodity_img: commodity.cover_img,
      commodity_selling_price: commodity.selling_price,
      add_cart_at: new Date().toISOString()
    }

    // 计算价格
    const originalTotalPrice = commodity.original_price * quantity
    const totalPrice = commodity.selling_price * quantity

    // 构建账单数据
    const billData: CartBillResponse = {
      items: [cartItem],
      bill_detail: {
        coupon: {
          coupon_id: 0,
          coupon_name: '',
          discount_money: 0
        },
        discount: {
          discount_id: 0,
          discount_name: '',
          discount_money: 0
        },
        vip_discount_money: 0,
        original_total_price: originalTotalPrice,
        total_price: totalPrice
      }
    }

    return billData
  } catch (error) {
    console.error('获取直接购买账单数据失败:', error)
    throw error
  }
}
