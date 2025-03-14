<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

const userStore = useUserStore()
const activeTab = ref('profile')

const userInfo = reactive({
  id: '',
  login_name: '',
  nickname: '',
  slogan: '',
  avatar: '',
  created_at: '',
})

const profileForm = reactive({
  nickname: '',
  slogan: '',
  avatar: '',
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const loading = ref(false)
const uploadLoading = ref(false)

const profileRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

const passwordRules = {
  old_password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

onMounted(async () => {
  await fetchUserInfo()
})

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserInfo()
    Object.assign(userInfo, res.data)
    // 初始化表单数据
    profileForm.nickname = userInfo.nickname
    profileForm.slogan = userInfo.slogan
    profileForm.avatar = userInfo.avatar
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

const handleUpdateProfile = async () => {
  loading.value = true
  try {
    await userApi.updateUserInfo(profileForm)
    ElMessage.success('个人资料更新成功')
    await fetchUserInfo()
    // 更新全局用户信息
    userStore.setUserInfo({
      ...userStore.userInfo,
      nickname: profileForm.nickname,
      avatar: profileForm.avatar,
    })
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新个人资料失败')
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  loading.value = true
  try {
    await userApi.changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
    })
    ElMessage.success('密码修改成功')
    // 清空表单
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    loading.value = false
  }
}

const handleAvatarUpload = async (file: File) => {
  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await userApi.uploadAvatar(formData)
    profileForm.avatar = res.data.url
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await userStore.logout()
      ElMessage.success('退出登录成功')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
          <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人资料" name="profile">
          <el-skeleton :loading="loading" animated>
            <template #default>
              <div class="user-info">
                <div class="avatar-container">
                  <el-avatar
                    :size="100"
                    :src="
                      profileForm.avatar ||
                      'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
                    "
                  ></el-avatar>
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :http-request="({ file }) => handleAvatarUpload(file)"
                    :show-file-list="false"
                    accept="image/*"
                  >
                    <el-button size="small" type="primary" :loading="uploadLoading"
                      >更换头像</el-button
                    >
                  </el-upload>
                </div>

                <el-form :model="profileForm" :rules="profileRules" label-width="100px">
                  <el-form-item label="账号">
                    <el-input v-model="userInfo.login_name" disabled></el-input>
                  </el-form-item>

                  <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="profileForm.nickname" placeholder="请输入昵称"></el-input>
                  </el-form-item>

                  <el-form-item label="个性签名">
                    <el-input
                      v-model="profileForm.slogan"
                      type="textarea"
                      placeholder="请输入个性签名"
                    ></el-input>
                  </el-form-item>

                  <el-form-item label="注册时间">
                    <el-input v-model="userInfo.created_at" disabled></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="handleUpdateProfile" :loading="loading"
                      >保存修改</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="当前密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                show-password
                placeholder="请输入当前密码"
              ></el-input>
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                show-password
                placeholder="请输入新密码"
              ></el-input>
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                show-password
                placeholder="请确认新密码"
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="loading"
                >修改密码</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  padding: 20px 0;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  margin-top: 15px;
}
</style>
