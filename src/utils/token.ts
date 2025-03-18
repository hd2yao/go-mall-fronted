import type { LoginResponse } from '@/api/user'

const TOKEN_KEY = 'user_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// 保存登录响应
export const saveLoginResponse = (response: LoginResponse) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(response))
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
}

// 获取access_token
export const getAccessToken = (): string | null => {
  const tokenData = localStorage.getItem(TOKEN_KEY)
  if (!tokenData) return null

  const { access_token, duration, srv_create_time } = JSON.parse(tokenData)
  const createTime = new Date(srv_create_time).getTime()
  const now = new Date().getTime()

  // 检查是否过期
  if (now - createTime >= duration * 1000) {
    return null
  }

  return access_token
}

// 获取refresh_token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// 清除token
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
