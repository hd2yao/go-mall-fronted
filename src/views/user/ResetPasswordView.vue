<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'

const router = useRouter()

const step = ref(1) // 1: 申请重置, 2: 输入新密码
const loading = ref(false)

const applyForm = reactive({
  login_name: '',
})

const resetForm = reactive({
  password: '',
  password_confirm: '',
  password_reset_token: '',
  password_reset_code: '',
})

const applyRules = {
  login_name: [{ required: true, message: '请输入账号', trigger: 'blur' }],
}

const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  password_confirm: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== resetForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  password_reset_token: [{ required: true, message: '请输入重置令牌', trigger: 'blur' }],
  password_reset_code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const handleApply = async () => {
  loading.value = true
  try {
    const res = await userApi.applyResetPassword(applyForm)
    ElMessage.success('申请成功，请查收验证码')
    if (res.data && typeof res.data === 'object' && 'password_reset_token' in res.data) {
      resetForm.password_reset_token = (
        res.data as { password_reset_token: string }
      ).password_reset_token
    }
    step.value = 2
  } catch (error) {
    console.error('申请失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  loading.value = true
  try {
    await userApi.resetPassword(resetForm)
    ElMessage.success('密码重置成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('重置失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-container">
    <div class="reset-box">
      <h2 class="reset-title">{{ step === 1 ? '申请重置密码' : '重置密码' }}</h2>

      <el-form v-if="step === 1" :model="applyForm" :rules="applyRules" label-position="top">
        <el-form-item label="账号" prop="login_name">
          <el-input v-model="applyForm.login_name" placeholder="请输入手机号或邮箱"></el-input>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" :loading="loading" @click="handleApply" style="width: 100%"
            >申请重置</el-button
          >
        </div>
      </el-form>

      <el-form v-else :model="resetForm" :rules="resetRules" label-position="top">
        <el-form-item label="验证码" prop="password_reset_code">
          <el-input v-model="resetForm.password_reset_code" placeholder="请输入验证码"></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="确认新密码" prop="password_confirm">
          <el-input
            v-model="resetForm.password_confirm"
            type="password"
            placeholder="请确认新密码"
            show-password
          ></el-input>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" :loading="loading" @click="handleReset" style="width: 100%"
            >重置密码</el-button
          >
        </div>
      </el-form>

      <div class="form-links">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.reset-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.reset-title {
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
