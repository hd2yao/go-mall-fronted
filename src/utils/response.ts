import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

export function handleResponse<T>(response: { data: ApiResponse<T> }): T {
  const { code, msg, data } = response.data

  if (code === 0) {
    return data
  } else {
    ElMessage.error(msg || '请求失败')
    throw new Error(msg)
  }
}

export function handleError(error: any) {
  const message = error.response?.data?.msg || error.message || '请求失败'
  ElMessage.error(message)
  throw error
}
