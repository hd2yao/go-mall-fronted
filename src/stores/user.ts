import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/api/user'
import { login, register, getUserInfo, logout, refreshToken } from '@/api/user'
import { saveLoginResponse, clearToken, getAccessToken, getRefreshToken } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const token = ref(getAccessToken())
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // 刷新token
  const refreshUserToken = async () => {
    const refresh_token = getRefreshToken()
    if (!refresh_token) return false

    try {
      const res = await refreshToken(refresh_token)
      if (res.data.code === 0) {
        // 保存新的token信息
        saveLoginResponse(res.data.data)
        return true
      }
      return false
    } catch (error) {
      console.error('刷新token失败:', error)
      return false
    }
  }

  // 判断用户是否已登录
  const isLoggedIn = computed(() => {
    return !!getAccessToken() && !!userInfo.value
  })

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const clearUserInfo = () => {
    userInfo.value = null
  }

  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfo()
      if (res.data.code === 0) {
        setUserInfo(res.data.data)
        return res.data.data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  const handleLogin = async (login_name: string, password: string) => {
    try {
      const res = await login({ login_name, password })
      if (res.data.code === 0) {
        // 保存token信息
        saveLoginResponse(res.data.data)
        // 获取用户信息
        await getUserInfoAction()
        return true
      }
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
        // 清除本地token
        clearToken()
        // 清除用户信息
        clearUserInfo()
        return true
      }
      return false
    } catch (error) {
      console.error('登出失败:', error)
      return false
    }
  }

  // 初始化用户状态
  const initUserState = async () => {
    const accessToken = getAccessToken()
    if (accessToken) {
      try {
        await getUserInfoAction()
      } catch (error) {
        console.error('初始化用户状态失败:', error)
        // 如果获取用户信息失败，尝试刷新token
        const refreshed = await refreshUserToken()
        if (refreshed) {
          // 刷新成功，重新获取用户信息
          await getUserInfoAction()
        } else {
          // 刷新失败，清除token
          clearToken()
          token.value = null
          userInfo.value = null
        }
      }
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
    refreshUserToken
  }
})
