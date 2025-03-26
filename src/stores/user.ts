import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { UserInfo } from '@/api/user'
import { login, register, getUserInfo, logout, refreshToken } from '@/api/user'
import {
  saveLoginResponse,
  clearToken,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  isRefreshTokenExpired
} from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  console.log('初始化userStore')
  const token = ref(getAccessToken())
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  console.log('初始状态 - token:', token.value, 'userInfo:', userInfo.value)

  // 监视token和userInfo变化
  watch(token, (newToken) => {
    console.log('token变化:', newToken)
  })

  watch(userInfo, (newUserInfo) => {
    console.log('userInfo变化:', newUserInfo)
  })

  // 刷新token
  const refreshUserToken = async () => {
    console.log('尝试刷新token')
    const refresh_token = getRefreshToken()
    if (!refresh_token) {
      console.log('无refresh_token可用')
      return false
    }

    try {
      const res = await refreshToken(refresh_token)
      console.log('刷新token返回:', res.data)
      if (res.data.code === 0) {
        // 保存新的token信息
        saveLoginResponse(res.data.data)
        token.value = res.data.data.access_token
        console.log('token刷新成功:', token.value)
        return true
      }
      console.log('token刷新失败:', res.data.msg)
      return false
    } catch (error) {
      console.error('刷新token失败:', error)
      return false
    }
  }

  // 判断用户是否已登录
  const isLoggedIn = computed(() => {
    // 检查access_token是否过期且refresh_token是否有效
    // 如果access_token过期但refresh_token有效，仍然视为已登录状态
    const result = isTokenExpired()
      ? !isRefreshTokenExpired() && !!userInfo.value
      : !!token.value && !!userInfo.value

    console.log('检查登录状态:', result,
      'token:', token.value,
      'userInfo:', userInfo.value,
      'token过期:', isTokenExpired(),
      'refresh_token过期:', isRefreshTokenExpired())

    return result
  })

  const setUserInfo = (info: UserInfo) => {
    console.log('设置用户信息:', info)
    userInfo.value = info
  }

  const clearUserInfo = () => {
    console.log('清除用户信息')
    userInfo.value = null
    token.value = null
  }

  const getUserInfoAction = async () => {
    console.log('开始获取用户信息, 当前token:', token.value)
    try {
      const res = await getUserInfo()
      console.log('获取用户信息返回:', res.data)
      if (res.data.code === 0) {
        setUserInfo(res.data.data)
        return res.data.data
      } else {
        console.error('获取用户信息失败:', res.data.msg)
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 初始化用户状态
  const initUserState = async () => {
    console.log('初始化用户状态')
    // 先检查是否有access_token
    let accessToken = getAccessToken()
    console.log('当前accessToken:', accessToken, '是否过期:', isTokenExpired())

    // 如果没有access_token但有refresh_token，尝试刷新
    if (!accessToken && !isRefreshTokenExpired()) {
      console.log('accessToken无效但refresh_token有效，尝试刷新')
      const refreshed = await refreshUserToken()
      if (refreshed) {
        accessToken = getAccessToken()
        console.log('刷新成功，新token:', accessToken)
      } else {
        console.log('刷新失败')
      }
    }

    // 如果有access_token但没有用户信息
    if (accessToken && !userInfo.value) {
      console.log('有accessToken但没有用户信息，设置token并获取用户信息')
      token.value = accessToken
      try {
        const userData = await getUserInfoAction()
        console.log('获取到用户信息:', userData)
      } catch (error) {
        console.error('初始化用户状态失败:', error)
        // 如果获取用户信息失败，尝试刷新token
        console.log('获取用户信息失败，尝试刷新token')
        const refreshed = await refreshUserToken()
        if (refreshed) {
          // 刷新成功，重新获取用户信息
          console.log('刷新成功，重新获取用户信息')
          const userData = await getUserInfoAction()
          console.log('重新获取到用户信息:', userData)
        } else {
          // 刷新失败，清除token和用户信息
          console.log('刷新失败，清除token和用户信息')
          clearToken()
          clearUserInfo()
        }
      }
    } else {
      console.log('无需初始化用户状态', 'token:', accessToken, 'userInfo:', userInfo.value)
    }
  }

  const handleLogin = async (login_name: string, password: string) => {
    console.log('处理登录请求:', login_name)
    try {
      const res = await login({ login_name, password })
      console.log('登录返回:', res.data)
      if (res.data.code === 0) {
        // 保存token信息
        saveLoginResponse(res.data.data)
        token.value = res.data.data.access_token
        console.log('设置token成功:', token.value)
        // 获取并保存用户信息
        console.log('开始获取用户信息')
        const userInfoRes = await getUserInfoAction()
        console.log('登录后获取用户信息结果:', userInfoRes)
        return !!userInfoRes
      }
      console.error('登录失败:', res.data.msg)
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  const handleRegister = async (
    login_name: string,
    password: string,
    password_confirm: string,
    nickname: string,
    slogan: string,
    avatar: string
  ) => {
    try {
      const res = await register({
        login_name,
        password,
        password_confirm,
        nickname,
        slogan,
        avatar
      })
      return res.data.code === 0
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  const handleLogout = async () => {
    try {
      const res = await logout()
      if (res.data.code === 0) {
        // 清除本地token和用户信息
        clearToken()
        clearUserInfo()
        return true
      }
      return false
    } catch (error) {
      console.error('登出失败:', error)
      return false
    }
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    initUserState,
    handleLogin,
    handleRegister,
    handleLogout,
    getUserInfoAction,
    refreshUserToken,
    clearUserInfo
  }
}, {
  persist: true
})
