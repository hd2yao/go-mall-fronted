import request from './request'
import type { ApiResponse, Category, Commodity, CommodityDetail, Pagination } from '@/types'

// 获取分类列表
export function getCategoryList() {
  return request<ApiResponse<Category[]>>({
    url: '/commodity/category-hierarchy/',
    method: 'get',
  })
}

// 获取分类详情
export function getCategoryDetail(parentId: number) {
  return request<ApiResponse<Category>>({
    url: '/commodity/category/',
    method: 'get',
    params: {
      parent_id: parentId,
    },
  })
}

// 获取分类下的商品列表
export function getCommodityListByCategory(params: {
  category_id: number
  page: number
  page_size: number
}) {
  return request<ApiResponse<{ list: Commodity[]; pagination: Pagination }>>({
    url: '/commodity/commodity-in-cate/',
    method: 'get',
    params,
  })
}

// 搜索商品
export function searchCommodity(params: { keyword: string; page: number; page_size: number }) {
  return request<ApiResponse<{ list: Commodity[]; pagination: Pagination }>>({
    url: '/commodity/search',
    method: 'get',
    params,
  })
}

// 获取商品详情
export function getCommodityDetail(commodityId: number) {
  return request<ApiResponse<CommodityDetail>>({
    url: `/commodity/${commodityId}/info`,
    method: 'get',
  })
}

// 获取热门商品
export function getHotCommodities(limit: number = 10) {
  return request<ApiResponse<Commodity[]>>({
    url: '/commodity/hot',
    method: 'get',
    params: { limit },
  })
}

// 获取新品上架
export function getNewCommodities(limit: number = 10) {
  return request<ApiResponse<Commodity[]>>({
    url: '/commodity/new',
    method: 'get',
    params: { limit },
  })
}

// 获取推荐商品
export function getRecommendCommodities(limit: number = 10) {
  return request<ApiResponse<Commodity[]>>({
    url: '/commodity/recommend',
    method: 'get',
    params: { limit },
  })
}
