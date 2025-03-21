import request from '@/utils/request';
import type { ApiResponse,PaginationParams } from '@/types/api'

export interface Category {
    id: number;
    level: number;
    parent_id: number;
    name: string;
    icon_img: string;
    rank: number;
    sub_categories: Category[] | null;
  }

  export interface Commodity {
    id: number;
    name: string;
    intro: string;
    category_id: number;
    cover_img: string;
    original_price: number;
    selling_price: number;
    tag: string;
    sell_status: number;
    created_at: string;
  }

export interface CommodityListResponse {
  code: number;
  msg: string;
  request_id: string;
  data: Commodity[];
  Pagination: PaginationParams;
}

export interface CommodityDetail extends Commodity {
  images: string;
  detail_content: string;
  stock_num: number;
}

export interface SearchParams {
  keyword: string
  page: number
  page_size?: number
}

export interface SearchResult {
  id: number
  name: string
  intro: string
  category_id: number
  cover_img: string
  original_price: number
  selling_price: number
  tag: string
  sell_status: number
  created_at: string
}

export interface SearchResponse extends ApiResponse<SearchResult[]> {
  data: SearchResult[]
  Pagination: {
    page: number
    page_size: number
    total_rows: number
  }
}

export const getCategoryHierarchy = () => {
  return request<ApiResponse<Category[]>>({
    url: '/commodity/category-hierarchy/',
    method: 'GET'
  });
};

export const getCommodityListByCategory = (categoryId: number, page: number = 1, pageSize: number = 20) => {
  return request<CommodityListResponse>({
    url: '/commodity/commodity-in-cate/',
    method: 'GET',
    params: {
      category_id: categoryId,
      page,
      page_size: pageSize
    }
  });
};

export const getCommodityDetail = (commodityId: number) => {
  return request<ApiResponse<CommodityDetail>>({
    url: `/commodity/${commodityId}/info`,
    method: 'GET'
  });
};

export const searchCommodities = (params: SearchParams) => {
  return request<SearchResponse>({
    url: '/commodity/search',
    method: 'GET',
    params
  })
}
