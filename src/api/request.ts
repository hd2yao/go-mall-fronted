import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import router from '@/router'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      // 为所有请求添加platform header
      config.headers['platform'] = 'H5'

      // token 可以从本地存储或其他地方获取
      const token = localStorage.getItem('go_mall_token')
      if (token) {
        config.headers['go-mall-token'] = token
      } else {
        console.log('没有找到 token')
      }
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 如果状态码不是0，说明有错误
    if (res.code !== 0) {
      // 显示错误消息
      ElMessage.error(res.msg || '请求失败')

      // 处理特定错误码
      if (res.code === 10000004) {
        // Token无效，跳转到登录页
        localStorage.removeItem('go_mall_token')
        localStorage.removeItem('go_mall_refresh_token')
        router.push('/login')
      }

      return Promise.reject(new Error(res.msg || '请求失败'))
    }

    return res
  },
  (error) => {
    console.error('响应错误:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  },
)

export default service
