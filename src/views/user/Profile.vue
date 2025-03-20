<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>个人中心</h2>
      <el-card v-loading="loading" class="profile-card">
        <template v-if="userStore.userInfo">
          <div class="profile-header">
            <el-avatar
              :size="100"
              :src="userStore.userInfo.avatar"
            />
            <div class="user-basic-info">
              <h3>{{ userStore.userInfo.nickname }}</h3>
              <p class="login-name">{{ userStore.userInfo.login_name }}</p>
            </div>
          </div>

          <el-divider />

          <div class="profile-content">
            <div class="info-item">
              <span class="label">个性签名：</span>
              <span class="value">{{ userStore.userInfo.slogan || '这个人很懒，什么都没写~' }}</span>
            </div>

            <div class="info-item">
              <span class="label">账号状态：</span>
              <el-tag :type="userStore.userInfo.is_blocked ? 'danger' : 'success'">
                {{ userStore.userInfo.is_blocked ? '已禁用' : '正常' }}
              </el-tag>
            </div>

            <div class="info-item">
              <span class="label">实名认证：</span>
              <el-tag :type="userStore.userInfo.verified ? 'success' : 'warning'">
                {{ userStore.userInfo.verified ? '已认证' : '未认证' }}
              </el-tag>
            </div>

            <div class="info-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ userStore.userInfo.created_at }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <el-button type="primary" @click="handleEdit">编辑资料</el-button>
            <el-button type="warning" @click="handleVerify" v-if="!userStore.userInfo.verified">
              实名认证
            </el-button>
            <el-button type="info" @click="$router.push('/user/address')">
              收货地址管理
            </el-button>
          </div>
        </template>
        <template v-else>
          <el-empty description="未登录" />
        </template>
      </el-card>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="个性签名" prop="slogan">
          <el-input
            v-model="form.slogan"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
          />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="form.avatar" placeholder="请输入头像URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updateUserInfo } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  nickname: '',
  slogan: '',
  avatar: ''
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 30, message: '昵称长度不能超过30个字符', trigger: 'blur' }
  ],
  slogan: [
    { max: 30, message: '个性签名长度不能超过30个字符', trigger: 'blur' }
  ],
  avatar: [
    { max: 100, message: '头像URL长度不能超过100个字符', trigger: 'blur' }
  ]
}

// 编辑资料
const handleEdit = () => {
  if (!userStore.userInfo) return

  form.value = {
    nickname: userStore.userInfo.nickname,
    slogan: userStore.userInfo.slogan || '',
    avatar: userStore.userInfo.avatar || ''
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const res = await updateUserInfo(form.value)
    if (res.data.code === 0) {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      // 重新获取用户信息
      await userStore.getUserInfoAction()
    }
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 实名认证
const handleVerify = () => {
  ElMessage.info('实名认证功能开发中...')
}

onMounted(async () => {
  if (!userStore.userInfo) {
    loading.value = true
    try {
      await userStore.getUserInfoAction()
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.profile-box {
  width: 800px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
}

.user-basic-info {
  margin-left: 20px;
}

.user-basic-info h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.login-name {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.profile-content {
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.info-item .label {
  width: 100px;
  color: #666;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.profile-actions {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #eee;
}

.profile-actions .el-button {
  margin: 0 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
