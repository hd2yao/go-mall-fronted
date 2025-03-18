<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <h2>重置密码</h2>
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-width="0"
        @keyup.enter="handleReset"
      >
        <el-form-item prop="username">
          <el-input
            v-model="resetForm.username"
            placeholder="用户名/邮箱/手机号"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-input">
            <el-input
              v-model="resetForm.code"
              placeholder="验证码"
              prefix-icon="Key"
            />
            <el-button
              type="primary"
              :disabled="!!countdown"
              @click="handleSendCode"
            >
              {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="新密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="确认新密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="reset-button"
            @click="handleReset"
          >
            重置密码
          </el-button>
        </el-form-item>
        <div class="reset-options">
          <router-link to="/login" class="login-link">
            返回登录
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { sendResetCode, resetPassword } from '@/api/user'
import { handleResponse, handleError } from '@/utils/response'

const router = useRouter()
const resetFormRef = ref<FormInstance>()
const loading = ref(false)
const countdown = ref(0)

const resetForm = reactive({
  username: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (_: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const resetRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!resetForm.username) {
    ElMessage.warning('请先输入用户名/邮箱/手机号')
    return
  }

  try {
    const res = await sendResetCode(resetForm.username)
    handleResponse<string>(res)
    ElMessage.success('验证码已发送')
    startCountdown()
  } catch (error) {
    handleError(error)
  }
}

const handleReset = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    const res = await resetPassword({
      username: resetForm.username,
      code: resetForm.code,
      password: resetForm.password
    })

    handleResponse<string>(res)
    ElMessage.success('密码重置成功')
    router.push('/login')
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.reset-password-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.code-input {
  display: flex;
  gap: 10px;
}

.code-input .el-input {
  flex: 1;
}

.reset-button {
  width: 100%;
}

.reset-options {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.login-link {
  color: #409eff;
  text-decoration: none;
}

.login-link:hover {
  color: #66b1ff;
}
</style>
