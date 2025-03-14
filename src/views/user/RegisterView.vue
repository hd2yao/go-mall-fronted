<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'

const router = useRouter()

const registerForm = reactive({
  login_name: '',
  password: '',
  password_confirm: '',
  nickname: '',
  slogan: '',
})

const loading = ref(false)
const rules = {
  login_name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  password_confirm: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  nickname: [{ required: false, message: '请输入昵称', trigger: 'blur' }],
}

const handleRegister = async () => {
  loading.value = true
  try {
    await userApi.register(registerForm)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">用户注册</h2>

      <el-form :model="registerForm" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="login_name">
          <el-input v-model="registerForm.login_name" placeholder="请输入手机号或邮箱"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="password_confirm">
          <el-input
            v-model="registerForm.password_confirm"
            type="password"
            placeholder="请确认密码"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>

        <el-form-item label="个性签名" prop="slogan">
          <el-input v-model="registerForm.slogan" placeholder="请输入个性签名"></el-input>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" :loading="loading" @click="handleRegister" style="width: 100%"
            >注册</el-button
          >
        </div>

        <div class="form-links">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px 0;
}

.register-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-actions {
  margin-top: 20px;
}

.form-links {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  font-size: 14px;
}
</style>
