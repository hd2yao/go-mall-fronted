<template>
  <div class="address-container">
    <div class="address-box">
      <div class="address-header">
        <h2>收货地址</h2>
        <el-button type="primary" @click="handleAdd">新增地址</el-button>
      </div>

      <el-card v-loading="loading" class="address-list">
        <template v-if="addressList.length > 0">
          <div v-for="address in addressList" :key="address.id" class="address-item">
            <div class="address-info">
              <div class="user-info">
                <span class="name">{{ address.masked_user_name }}</span>
                <span class="phone">{{ address.masked_user_phone }}</span>
                <el-tag v-if="address.default === 1" type="success" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province_name }}{{ address.city_name }}{{ address.region_name }}{{ address.detail_address }}
              </div>
            </div>
            <div class="address-actions">
              <el-button type="primary" link @click="handleEdit(address)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(address)">删除</el-button>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无收货地址" />
      </el-card>
    </div>

    <!-- 新增/编辑地址对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="收件人" prop="user_name">
          <el-input v-model="form.user_name" placeholder="请输入收件人姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="user_phone">
          <el-input v-model="form.user_phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="所在地区" required>
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item prop="province_name">
                <el-input v-model="form.province_name" placeholder="省" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="city_name">
                <el-input v-model="form.city_name" placeholder="市" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="region_name">
                <el-input v-model="form.region_name" placeholder="区" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail_address">
          <el-input
            v-model="form.detail_address"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认" prop="default">
          <el-switch v-model="form.default" :active-value="1" :inactive-value="0" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAddressList, addAddress, updateAddress, deleteAddress } from '@/api/user'
import type { Address, AddAddressParams } from '@/api/user'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentAddressId = ref<number>(0)
const formRef = ref<FormInstance>()
const addressList = ref<Address[]>([])

const form = ref<AddAddressParams>({
  user_name: '',
  user_phone: '',
  default: 0,
  province_name: '',
  city_name: '',
  region_name: '',
  detail_address: ''
})

const rules: FormRules = {
  user_name: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' },
    { max: 20, message: '收件人姓名不能超过20个字符', trigger: 'blur' }
  ],
  user_phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  province_name: [
    { required: true, message: '请输入省份', trigger: 'blur' }
  ],
  city_name: [
    { required: true, message: '请输入城市', trigger: 'blur' }
  ],
  region_name: [
    { required: true, message: '请输入区县', trigger: 'blur' }
  ],
  detail_address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 100, message: '详细地址不能超过100个字符', trigger: 'blur' }
  ]
}

// 获取地址列表
const fetchAddressList = async () => {
  loading.value = true
  try {
    const res = await getAddressList()
    if (res.data.code === 0) {
      addressList.value = res.data.data
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

// 新增地址
const handleAdd = () => {
  isEdit.value = false
  currentAddressId.value = 0
  form.value = {
    user_name: '',
    user_phone: '',
    default: 0,
    province_name: '',
    city_name: '',
    region_name: '',
    detail_address: ''
  }
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (address: Address) => {
  isEdit.value = true
  currentAddressId.value = address.id
  form.value = {
    user_name: address.user_name,
    user_phone: address.user_phone,
    default: address.default,
    province_name: address.province_name,
    city_name: address.city_name,
    region_name: address.region_name,
    detail_address: address.detail_address
  }
  dialogVisible.value = true
}

// 删除地址
const handleDelete = (address: Address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAddress(address.id)
      if (res.data.code === 0) {
        ElMessage.success('删除成功')
        // 重新获取地址列表
        await fetchAddressList()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    let res
    if (isEdit.value) {
      // 更新地址
      res = await updateAddress(currentAddressId.value, form.value)
      if (res.data.code === 0) {
        ElMessage.success('更新成功')
      }
    } else {
      // 新增地址
      res = await addAddress(form.value)
      if (res.data.code === 0) {
        ElMessage.success('添加成功')
      }
    }

    if (res.data.code === 0) {
      dialogVisible.value = false
      // 重新获取地址列表
      await fetchAddressList()
    }
  } catch (error) {
    console.error(isEdit.value ? '更新失败:' : '添加失败:', error)
    ElMessage.error(isEdit.value ? '更新失败，请稍后重试' : '添加失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAddressList()
})
</script>

<style scoped>
.address-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.address-box {
  width: 800px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #333;
}

.address-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.address-item:last-child {
  border-bottom: none;
}

.address-info {
  flex: 1;
}

.user-info {
  margin-bottom: 10px;
}

.name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
  color: #333;
}

.phone {
  color: #666;
  margin-right: 10px;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
