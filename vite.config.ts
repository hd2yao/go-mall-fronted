import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 创建通用的代理配置
const createProxyOptions = (target: string) => ({
  target,
  changeOrigin: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configure: (proxy: any, options: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
      // 添加 CORS 头部
      const origin = req.headers.origin || 'http://localhost:5174'
      proxyRes.headers['Access-Control-Allow-Origin'] = origin
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      proxyRes.headers['Access-Control-Allow-Headers'] =
        'Origin, X-Requested-With, Content-Type, Accept, platform, go-mall-token'

      // 处理 OPTIONS 请求
      if (req.method === 'OPTIONS') {
        res.statusCode = 200
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/commodity': createProxyOptions('http://localhost:8080'),
      '/user/address': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        configure: (proxy: any, options: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
            // 添加平台标识
            proxyReq.setHeader('platform', 'H5')

            // 添加 token（如果有）
            const token = localStorage.getItem('go_mall_token')
            if (token) {
              proxyReq.setHeader('go-mall-token', token)
            }
          })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
            // 添加 CORS 头部
            proxyRes.headers['Access-Control-Allow-Origin'] = '*'
            proxyRes.headers['Access-Control-Allow-Methods'] =
              'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            proxyRes.headers['Access-Control-Allow-Headers'] =
              'Origin, X-Requested-With, Content-Type, Accept, platform, go-mall-token'

            // 处理 OPTIONS 请求
            if (req.method === 'OPTIONS') {
              res.statusCode = 200
            }
          })
        },
      },
      '/user': createProxyOptions('http://localhost:8080'),
      '/cart': createProxyOptions('http://localhost:8080'),
      '/order': createProxyOptions('http://localhost:8080'),
      // 根据需要添加其他 API 路径
    },
  },
})
