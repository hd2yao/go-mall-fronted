// 通用API响应类型
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  request_id: string
  data: T
}

// 分页信息
export interface Pagination {
  page: number
  page_size: number
  total_rows: number
}

// 用户相关类型
export interface UserInfo {
  id: string
  nickname: string
  login_name: string
  verified: number
  avatar: string
  slogan: string
  is_blocked: number
  created_at: string
}

export interface LoginParams {
  login_name: string
  password: string
}

export interface RegisterParams {
  login_name: string
  password: string
  password_confirm: string
  nickname?: string
  slogan?: string
  avatar?: string
}

export interface TokenInfo {
  access_token: string
  refresh_token: string
  duration: number
  srv_create_time: string
}

export interface PasswordResetApplyParams {
  login_name: string
}

export interface PasswordResetParams {
  password: string
  password_confirm: string
  password_reset_token: string
  password_reset_code: string
}

export interface UserUpdateParams {
  nickname?: string
  slogan?: string
  avatar?: string
}

// 地址相关类型
export interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

export interface AddressParams {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default?: boolean
}

// 商品相关类型
export interface Category {
  id: number
  level: number
  parent_id: number
  name: string
  icon_img: string
  rank: number
  sub_categories?: Category[]
}

export interface Commodity {
  id: number
  name: string
  intro: string
  category_id: number
  cover_img: string
  original_price: number
  selling_price: number
  tag: string
  sell_status: number
  created_at: string
}

export interface CommodityDetail extends Commodity {
  images: string
  detail_content: string
  stock_num: number
}

// 购物车相关类型
export interface CartItem {
  cart_item_id: number
  user_id: number
  commodity_id: number
  commodity_num: number
  commodity_name: string
  commodity_img: string
  commodity_selling_price: number
  add_cart_at: string
}

export interface CartAddParams {
  commodity_id: number
  commodity_num: number
}

export interface CartUpdateParams {
  item_id: number
  commodity_num: number
}

export interface BillDetail {
  coupon: {
    coupon_id: number
    coupon_name: string
    discount_money: number
  }
  discount: {
    discount_id: number
    discount_name: string
    discount_money: number
  }
  vip_discount_money: number
  original_total_price: number
  total_price: number
}

export interface CartBill {
  items: CartItem[]
  bill_detail: BillDetail
}

// 订单相关类型
export interface OrderAddress {
  user_name: string
  user_phone: string
  province_name: string
  city_name: string
  region_name: string
  detail_address: string
}

export interface OrderItem {
  commodity_id: number
  commodity_name: string
  commodity_img: string
  commodity_selling_price: number
  commodity_num: number
}

export interface Order {
  order_no: string
  pay_trans_id: string
  pay_type: number
  bill_money: number
  pay_money: number
  pay_state: number
  status: string
  address: OrderAddress
  items: OrderItem[]
  created_at: string
}

export interface OrderCreateParams {
  cart_item_id_list: number[]
  user_address_id: number
}

export interface OrderPayParams {
  order_no: string
  pay_type: number
}

export interface PayInfo {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}
