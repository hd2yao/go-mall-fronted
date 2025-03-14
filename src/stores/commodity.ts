import { ref } from 'vue'
import { defineStore } from 'pinia'
import { commodityApi } from '@/api'
import type { Category, Commodity, CommodityDetail, Pagination } from '@/types'

export const useCommodityStore = defineStore('commodity', () => {
  const categories = ref<Category[]>([])
  const commodityList = ref<Commodity[]>([])
  const currentCommodity = ref<CommodityDetail | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    page_size: 20,
    total_rows: 0,
  })

  // 获取按层级划分的所有商品分类
  async function getCategoryHierarchy() {
    try {
      const res = await commodityApi.getCategoryHierarchy()
      categories.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 获取商品子类列表
  async function getCategoryList(parentId: number) {
    try {
      const res = await commodityApi.getCategoryList(parentId)
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 按分类查询商品列表
  async function getCommodityListByCategory(
    categoryId: number,
    page: number = 1,
    pageSize: number = 20,
  ) {
    try {
      const res = await commodityApi.getCommodityListByCategory(categoryId, page, pageSize)
      commodityList.value = res.data
      pagination.value = res.Pagination
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 商品搜索
  async function searchCommodity(keyword: string, page: number = 1, pageSize: number = 20) {
    try {
      const res = await commodityApi.searchCommodity(keyword, page, pageSize)
      commodityList.value = res.data
      pagination.value = res.Pagination
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 获取商品详情
  async function getCommodityDetail(commodityId: number) {
    try {
      const res = await commodityApi.getCommodityDetail(commodityId)
      currentCommodity.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  return {
    categories,
    commodityList,
    currentCommodity,
    pagination,
    getCategoryHierarchy,
    getCategoryList,
    getCommodityListByCategory,
    searchCommodity,
    getCommodityDetail,
  }
})
