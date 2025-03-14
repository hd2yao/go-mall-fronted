import request from './request'
import type {
  ApiResponse,
  UserInfo,
  LoginParams,
  RegisterParams,
  TokenInfo,
  PasswordResetApplyParams,
  PasswordResetParams,
  UserUpdateParams,
  Address,
  AddressParams,
} from '@/types'

// 用户注册
export function register(data: RegisterParams) {
  return request<ApiResponse<string>>({
    url: '/user/register',
    method: 'post',
    data,
  })
}

// 用户登录
export function login(data: LoginParams) {
  return request<ApiResponse<TokenInfo>>({
    url: '/user/login',
    method: 'post',
    data,
  })
}

// 刷新Token
export function refreshToken(refreshToken: string) {
  return request<ApiResponse<TokenInfo>>({
    url: `/user/token/refresh?refresh_token=${refreshToken}`,
    method: 'get',
  })
}

// 用户登出
export function logout() {
  return request<ApiResponse<string>>({
    url: '/user/logout',
    method: 'delete',
  })
}

// 申请重置密码
export function applyResetPassword(data: PasswordResetApplyParams) {
  return request<ApiResponse<{ password_reset_token: string }>>({
    url: '/user/password/apply-reset',
    method: 'post',
    data,
  })
}

// 重置密码
export function resetPassword(data: PasswordResetParams) {
  return request<ApiResponse<string>>({
    url: '/user/password/reset',
    method: 'post',
    data,
  })
}

// 获取用户信息
export function getUserInfo() {
  return request<ApiResponse<UserInfo>>({
    url: '/user/info',
    method: 'get',
  })
}

// 更新用户信息
export function updateUserInfo(data: UserUpdateParams) {
  return request<ApiResponse<string>>({
    url: '/user/info',
    method: 'patch',
    data,
  })
}

// 修改密码
export function changePassword(data: { old_password: string; new_password: string }) {
  return request<ApiResponse<string>>({
    url: '/user/password/change',
    method: 'post',
    data,
  })
}

// 上传头像
export function uploadAvatar(data: FormData) {
  return request<ApiResponse<{ url: string }>>({
    url: '/user/avatar/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  })
}

// 获取地址列表
export function getAddressList() {
  return request<ApiResponse<Address[]>>({
    url: '/user/address',
    method: 'get',
  })
}

// 获取地址详情
export function getAddressDetail(id: string) {
  return request<ApiResponse<Address>>({
    url: `/user/address/${id}`,
    method: 'get',
  })
}

// 新增地址
export function addAddress(data: AddressParams) {
  return request<ApiResponse<Address>>({
    url: '/user/address',
    method: 'post',
    data,
  })
}

// 更新地址
export function updateAddress(data: AddressParams & { id: string }) {
  return request<ApiResponse<string>>({
    url: `/user/address/${data.id}`,
    method: 'patch',
    data,
  })
}

// 删除地址
export function deleteAddress(id: string) {
  return request<ApiResponse<string>>({
    url: `/user/address/${id}`,
    method: 'delete',
  })
}

// 设置默认地址
export function setDefaultAddress(id: string) {
  return request<ApiResponse<string>>({
    url: `/user/address/${id}/default`,
    method: 'patch',
  })
}
