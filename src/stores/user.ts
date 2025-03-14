import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api'
import type { UserInfo, Address, TokenInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('go_mall_token') || '')
  const refreshToken = ref<string>(localStorage.getItem('go_mall_refresh_token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const addressList = ref<Address[]>([])

  const isLoggedIn = computed(() => !!token.value)

  // 设置token
  function setToken(accessToken: string, refreshTokenValue: string) {
    token.value = accessToken
    refreshToken.value = refreshTokenValue
    localStorage.setItem('go_mall_token', accessToken)
    localStorage.setItem('go_mall_refresh_token', refreshTokenValue)
  }

  // 清除token
  function clearToken() {
    token.value = ''
    refreshToken.value = ''
    localStorage.removeItem('go_mall_token')
    localStorage.removeItem('go_mall_refresh_token')
  }

  // 登录
  async function login(loginName: string, password: string) {
    try {
      const res = await userApi.login({ login_name: loginName, password })
      // @ts-expect-error - 响应拦截器已经处理了 ApiResponse 结构
      setToken(res.data.access_token, res.data.refresh_token)

      await getUserInfo()
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 登出
  async function logout() {
    try {
      if (token.value) {
        await userApi.logout()
      }
    } finally {
      clearToken()
      userInfo.value = null
      addressList.value = []
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const res = await userApi.getUserInfo()
      // @ts-expect-error - 响应拦截器已经处理了 ApiResponse 结构
      userInfo.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取地址列表
  async function getAddressList() {
    try {
      const res = await userApi.getAddressList()
      // @ts-expect-error - 响应拦截器已经处理了 ApiResponse 结构
      addressList.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  // 刷新token
  async function refreshUserToken() {
    if (!refreshToken.value) return

    try {
      const res = await userApi.refreshToken(refreshToken.value)
      // @ts-expect-error - 响应拦截器已经处理了 ApiResponse 结构
      setToken(res.access_token, res.refresh_token)
      return res
    } catch (error) {
      clearToken()
      throw error
    }
  }

  return {
    token,
    refreshToken,
    userInfo,
    addressList,
    isLoggedIn,
    login,
    logout,
    getUserInfo,
    getAddressList,
    refreshUserToken,
  }
})
