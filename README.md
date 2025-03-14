# Go Mall 商城前端

基于Vue 3 + TypeScript + Element Plus的商城前端项目，对接Go Mall后端API。

## 技术栈

- Vue 3
- TypeScript
- Vue Router
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP请求)

## 项目结构

```plain text
src/
├── api/                # API接口
│   ├── cart.ts         # 购物车相关接口
│   ├── commodity.ts    # 商品相关接口
│   ├── index.ts        # API导出
│   ├── order.ts        # 订单相关接口
│   ├── request.ts      # Axios配置
│   └── user.ts         # 用户相关接口
├── assets/             # 静态资源
├── components/         # 公共组件
│   └── layout/         # 布局组件
│       ├── AppHeader.vue  # 页面头部
│       └── AppFooter.vue  # 页面底部
├── router/             # 路由配置
├── stores/             # Pinia状态管理
│   ├── cart.ts         # 购物车状态
│   ├── commodity.ts    # 商品状态
│   ├── index.ts        # 状态管理导出
│   ├── order.ts        # 订单状态
│   └── user.ts         # 用户状态
├── types/              # TypeScript类型定义
│   └── index.ts        # 类型定义
└── views/              # 页面视图
    ├── cart/           # 购物车相关页面
    ├── category/       # 分类相关页面
    ├── commodity/      # 商品相关页面
    ├── order/          # 订单相关页面
    ├── search/         # 搜索相关页面
    ├── user/           # 用户相关页面
    └── HomeView.vue    # 首页
```

## 功能模块

- 用户模块：登录、注册、个人信息管理、地址管理
- 商品模块：商品分类、商品列表、商品详情、商品搜索
- 购物车模块：购物车管理、结算
- 订单模块：订单创建、订单列表、订单详情、订单支付

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

在`.env`文件中配置：

```plain text
VITE_API_BASE_URL=/api  # API基础路径
```

## API文档

API接口文档位于`api/`目录下：

- `api/index.md`: API概述
- `api/user.md`: 用户模块API
- `api/commodity.md`: 商品模块API
- `api/cart.md`: 购物车模块API
- `api/order.md`: 订单模块API
