import type { LoginResponse } from '@/api/user'

const TOKEN_KEY = 'user_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const REFRESH_TOKEN_EXPIRY_KEY = 'refresh_token_expiry'

// 保存登录响应
export const saveLoginResponse = (response: LoginResponse) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(response))
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)

  // 设置refresh_token的过期时间（当前时间 + 10天）
  const refreshExpiry = new Date()
  refreshExpiry.setDate(refreshExpiry.getDate() + 10) // 10天后过期
  localStorage.setItem(REFRESH_TOKEN_EXPIRY_KEY, refreshExpiry.getTime().toString())
}

// 检查token是否过期
export const isTokenExpired = (): boolean => {
  const tokenData = localStorage.getItem(TOKEN_KEY)
  if (!tokenData) return true

  const { duration, srv_create_time } = JSON.parse(tokenData)
  const createTime = new Date(srv_create_time).getTime()
  const now = new Date().getTime()

  return now - createTime >= duration * 1000
}

// 检查refresh_token是否过期
export const isRefreshTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem(REFRESH_TOKEN_EXPIRY_KEY)
  if (!expiryTime) return true

  const now = new Date().getTime()
  return now >= parseInt(expiryTime)
}

// 获取access_token剩余有效期（秒）
export const getTokenRemainingTime = (): number => {
  const tokenData = localStorage.getItem(TOKEN_KEY)
  if (!tokenData) return 0

  const { duration, srv_create_time } = JSON.parse(tokenData)
  const createTime = new Date(srv_create_time).getTime()
  const now = new Date().getTime()
  const expiryTime = createTime + duration * 1000

  // 返回剩余秒数，如果已过期则返回0
  return Math.max(0, Math.floor((expiryTime - now) / 1000))
}

// 获取access_token
export const getAccessToken = (): string | null => {
  const tokenData = localStorage.getItem(TOKEN_KEY)
  if (!tokenData) return null

  const { access_token } = JSON.parse(tokenData)
  return access_token
}

// 获取refresh_token
export const getRefreshToken = (): string | null => {
  // 如果refresh_token已过期，返回null
  if (isRefreshTokenExpired()) {
    clearToken()
    return null
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// 清除token
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_EXPIRY_KEY)
}
