import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { userApi } from '@/api'
import type { UserInfo, Address } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(Cookies.get('go_mall_token') || '')
  const refreshToken = ref<string>(Cookies.get('go_mall_refresh_token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const addressList = ref<Address[]>([])

  const isLoggedIn = computed(() => !!token.value)

  // 设置token
  function setToken(accessToken: string, refreshTokenValue: string) {
    token.value = accessToken
    refreshToken.value = refreshTokenValue
    Cookies.set('go_mall_token', accessToken, { expires: 7 })
    Cookies.set('go_mall_refresh_token', refreshTokenValue, { expires: 30 })
  }

  // 清除token
  function clearToken() {
    token.value = ''
    refreshToken.value = ''
    Cookies.remove('go_mall_token')
    Cookies.remove('go_mall_refresh_token')
  }

  // 登录
  async function login(loginName: string, password: string) {
    try {
      const res = await userApi.login({ login_name: loginName, password })
      setToken(res.data.access_token, res.data.refresh_token)
      await getUserInfo()
      return res
    } catch (error) {
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
      userInfo.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 获取地址列表
  async function getAddressList() {
    try {
      const res = await userApi.getAddressList()
      addressList.value = res.data
      return res.data
    } catch (error) {
      throw error
    }
  }

  // 刷新token
  async function refreshUserToken() {
    if (!refreshToken.value) return

    try {
      const res = await userApi.refreshToken(refreshToken.value)
      setToken(res.data.access_token, res.data.refresh_token)
      return res.data
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
