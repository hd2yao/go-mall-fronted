import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  getAccessToken,
  getRefreshToken,
  saveLoginResponse,
  clearToken,
  isTokenExpired,
  getTokenRemainingTime
} from './token'
import { refreshToken } from '@/api/user'

// 扩展 AxiosRequestConfig 类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    needToken?: boolean
  }
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000
})

// 是否正在刷新token
let isRefreshing = false
// 重试队列
let requests: Array<() => void> = []
// Token临界值（秒）- 当token剩余有效期小于此值时，会在请求前刷新token
const TOKEN_THRESHOLD = 300 // 5分钟

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 默认需要token
    if (config.needToken !== false) {
      // 检查token是否过期或即将过期（剩余时间小于阈值）
      if ((isTokenExpired() || getTokenRemainingTime() < TOKEN_THRESHOLD) && !config.url?.includes('refresh')) {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            const refresh_token = getRefreshToken()
            if (refresh_token) {
              const res = await refreshToken(refresh_token)
              if (res.data.code === 0) {
                saveLoginResponse(res.data.data)
                // 执行队列中的请求
                requests.forEach(cb => cb())
                requests = []
              } else {
                // 刷新失败，清除token
                clearToken()
                window.location.href = '/login'
                return Promise.reject('Token refresh failed')
              }
            } else {
              // 没有refresh token，清除token
              clearToken()
              window.location.href = '/login'
              return Promise.reject('No refresh token')
            }
          } catch (error) {
            // 刷新异常，清除token
            clearToken()
            window.location.href = '/login'
            return Promise.reject(error)
          } finally {
            isRefreshing = false
          }
        } else {
          // 有其他请求正在刷新token，加入队列
          return new Promise(resolve => {
            requests.push(() => {
              resolve(request(config))
            })
          })
        }
      }

      const token = getAccessToken()
      if (token) {
        console.log('请求添加token:', config.url, token)
        config.headers['go-mall-token'] = token
      } else {
        console.log('请求无token:', config.url)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve) => {
          requests.push(() => {
            resolve(request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = getRefreshToken()
        if (!refresh_token) {
          throw new Error('No refresh token')
        }

        const res = await refreshToken(refresh_token)
        if (res.data.code === 0) {
          saveLoginResponse(res.data.data)
          // 执行队列中的请求
          requests.forEach(cb => cb())
          requests = []
          return request(originalRequest)
        }
      } catch (refreshError) {
        // 刷新token失败，清除token并跳转到登录页
        clearToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    ElMessage.error(error.response?.data?.msg || '请求失败')
    return Promise.reject(error)
  }
)

export default request
