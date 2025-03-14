<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

const router = useRouter()
const addresses = ref<Address[]>([])
const loading = ref(false)

onMounted(() => {
  fetchAddresses()
})

const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await userApi.getAddressList()
    addresses.value = res.data as unknown as Address[]
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddAddress = () => {
  router.push('/user/address/add')
}

const handleEditAddress = (id: string) => {
  router.push(`/user/address/edit/${id}`)
}

const handleDeleteAddress = (id: string) => {
  ElMessageBox.confirm('确定要删除该地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await userApi.deleteAddress(id)
        ElMessage.success('删除地址成功')
        fetchAddresses()
      } catch (error) {
        console.error('删除地址失败:', error)
        ElMessage.error('删除地址失败')
      }
    })
    .catch(() => {})
}

const handleSetDefault = async (id: string) => {
  try {
    await userApi.setDefaultAddress(id)
    ElMessage.success('设置默认地址成功')
    fetchAddresses()
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败')
  }
}

const formatAddress = (address: Address) => {
  return `${address.province} ${address.city} ${address.district} ${address.detail}`
}
</script>

<template>
  <div class="address-container">
    <el-card class="address-card">
      <template #header>
        <div class="card-header">
          <span>收货地址管理</span>
          <el-button type="primary" @click="handleAddAddress">添加新地址</el-button>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :rows="3" :count="2">
        <template #default>
          <div v-if="addresses.length === 0" class="empty-address">
            <el-empty description="暂无收货地址">
              <el-button type="primary" @click="handleAddAddress">添加新地址</el-button>
            </el-empty>
          </div>

          <div v-else class="address-list">
            <el-card
              v-for="address in addresses"
              :key="address.id"
              class="address-item"
              shadow="hover"
            >
              <div class="address-content">
                <div class="address-info">
                  <div class="address-header">
                    <span class="address-name">{{ address.name }}</span>
                    <span class="address-phone">{{ address.phone }}</span>
                    <el-tag v-if="address.is_default" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">{{ formatAddress(address) }}</div>
                </div>

                <div class="address-actions">
                  <el-button type="primary" link @click="handleEditAddress(address.id)"
                    >编辑</el-button
                  >
                  <el-button type="danger" link @click="handleDeleteAddress(address.id)"
                    >删除</el-button
                  >
                  <el-button
                    v-if="!address.is_default"
                    type="success"
                    link
                    @click="handleSetDefault(address.id)"
                    >设为默认</el-button
                  >
                </div>
              </div>
            </el-card>
          </div>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<style scoped>
.address-container {
  padding: 20px;
}

.address-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-address {
  padding: 40px 0;
  text-align: center;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  margin-bottom: 0;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info {
  flex: 1;
}

.address-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-name {
  font-weight: bold;
  font-size: 16px;
}

.address-phone {
  color: #666;
}

.address-detail {
  color: #333;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 10px;
}
</style>
