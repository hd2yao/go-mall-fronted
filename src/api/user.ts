import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface LoginParams {
  login_name: string
  password: string
}

export interface RegisterParams {
  login_name: string
  password: string
  password_confirm: string
  nickname: string
  slogan: string
  avatar: string
}

export interface ResetPasswordParams {
  username: string
  code: string
  password: string
}

export interface UserInfo {
  /** 用户ID */
  id: number
  /** 用户昵称 */
  nickname: string
  /** 登录名（邮箱或手机号） */
  login_name: string
  /** 用户验证状态 0：未验证；1：已验证 */
  verified: number
  /** 用户头像 */
  avatar?: string
  /** 个性签名 */
  slogan?: string
  /** 用户禁用状态 0：正常；1：已禁用 */
  is_blocked: number
  /** 创建时间 */
  created_at: string
}

export interface UpdateUserInfoParams {
  nickname?: string
  slogan?: string
  avatar?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  duration: number
  srv_create_time: string
}

// 收货地址相关接口
export interface Address {
  id: number
  user_name: string
  user_phone: string
  masked_user_name: string
  masked_user_phone: string
  default: number
  province_name: string
  city_name: string
  region_name: string
  detail_address: string
  created_at: string
}

// 新增收货地址参数
export interface AddAddressParams {
  user_name: string
  user_phone: string
  default: number
  province_name: string
  city_name: string
  region_name: string
  detail_address: string
}

// 用户注册
export const register = (data: RegisterParams) => {
  return request<ApiResponse<string>>({
    url: '/user/register',
    method: 'post',
    data,
    needToken: false
  })
}

// 用户登录
export const login = (data: LoginParams) => {
  return request<ApiResponse<LoginResponse>>({
    url: '/user/login',
    method: 'post',
    data,
    headers: {
      platform: 'H5'
    },
    needToken: false
  })
}

// 刷新token
export const refreshToken = (refresh_token: string) => {
  return request<ApiResponse<LoginResponse>>({
    url: `/user/token/refresh?refresh_token=${refresh_token}`,
    method: 'get',
    needToken: false
  })
}

// 用户登出
export const logout = () => {
  return request<ApiResponse<string>>({
    url: '/user/logout',
    method: 'delete',
    needToken: true
  })
}

// 发送重置密码验证码(暂无)
export const sendResetCode = (login_name: string) => {
  return request<ApiResponse<string>>({
    url: '/user/reset-code',
    method: 'post',
    data: { login_name },
    needToken: false
  })
}

// 重置密码
export const resetPassword = (data: ResetPasswordParams) => {
  return request<ApiResponse<string>>({
    url: '/user/password/reset',
    method: 'post',
    data,
    needToken: false
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request<ApiResponse<UserInfo>>({
    url: '/user/info',
    method: 'get',
    needToken: true
  })
}

// 更新用户信息
export const updateUserInfo = (data: UpdateUserInfoParams) => {
  return request<ApiResponse<string>>({
    url: '/user/info',
    method: 'patch',
    data,
    needToken: true
  })
}

// 获取收货地址列表
export const getAddressList = () => {
  return request<ApiResponse<Address[]>>({
    url: '/user/address/',
    method: 'get'
  })
}

// 新增收货地址
export const addAddress = (data: AddAddressParams) => {
  return request<ApiResponse<null>>({
    url: '/user/address',
    method: 'post',
    data
  })
}

// 更新收货地址
export const updateAddress = (address_id: number, data: AddAddressParams) => {
  return request<ApiResponse<null>>({
    url: `/user/address/${address_id}`,
    method: 'patch',
    data
  })
}

// 删除收货地址
export const deleteAddress = (address_id: number) => {
  return request<ApiResponse<null>>({
    url: `/user/address/${address_id}`,
    method: 'delete'
  })
}
