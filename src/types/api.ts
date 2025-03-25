// API响应的通用类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  request_id: string
  data: T
}

export interface PaginationParams {
  page: number
  page_size: number
  total_rows: number
}
