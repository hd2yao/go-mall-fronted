export interface ApiResponse<T> {
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
