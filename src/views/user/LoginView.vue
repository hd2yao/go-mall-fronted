<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginForm = reactive({
  login_name: '',
  password: '',
})

const loading = ref(false)
const rules = {
  login_name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(loginForm.login_name, loginForm.password)
    ElMessage.success('登录成功')

    // 如果有重定向地址，则跳转到重定向地址
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>

      <el-form :model="loginForm" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="login_name">
          <el-input v-model="loginForm.login_name" placeholder="请输入手机号或邮箱"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%"
            >登录</el-button
          >
        </div>

        <div class="form-links">
          <router-link to="/register">注册账号</router-link>
          <router-link to="/reset-password">忘记密码</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-actions {
  margin-top: 20px;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
}
</style>
