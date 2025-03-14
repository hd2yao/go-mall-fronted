<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const isEdit = ref(false)

const addressForm = reactive({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
})

const rules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  district: [{ required: true, message: '请选择区/县', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
}

// 省市区数据
const provinces = ref<string[]>([])
const cities = ref<Record<string, string[]>>({})
const districts = ref<Record<string, string[]>>({})

// 当前选择的省市
const selectedProvince = ref('')
const selectedCity = ref('')

onMounted(async () => {
  // 加载省市区数据
  await loadRegionData()

  // 判断是否为编辑模式
  const addressId = route.params.id as string
  if (addressId && addressId !== 'add') {
    isEdit.value = true
    await fetchAddressDetail(addressId)
  }
})

const loadRegionData = async () => {
  try {
    // 这里应该从API获取省市区数据
    // 为了演示，使用模拟数据
    provinces.value = ['北京市', '上海市', '广东省', '江苏省', '浙江省']

    cities.value = {
      北京市: ['北京市'],
      上海市: ['上海市'],
      广东省: ['广州市', '深圳市', '佛山市', '东莞市'],
      江苏省: ['南京市', '苏州市', '无锡市', '常州市'],
      浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市'],
    }

    districts.value = {
      北京市: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
      上海市: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区'],
      广州市: ['越秀区', '海珠区', '荔湾区', '天河区', '白云区'],
      深圳市: ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区'],
      杭州市: ['上城区', '下城区', '江干区', '拱墅区', '西湖区'],
    }
  } catch (error) {
    console.error('加载地区数据失败:', error)
    ElMessage.error('加载地区数据失败')
  }
}

const fetchAddressDetail = async (id: string) => {
  loading.value = true
  try {
    const res = await userApi.getAddressDetail(id)
    Object.assign(addressForm, res.data)

    // 设置选中的省市
    selectedProvince.value = addressForm.province
    selectedCity.value = addressForm.city
  } catch (error) {
    console.error('获取地址详情失败:', error)
    ElMessage.error('获取地址详情失败')
  } finally {
    loading.value = false
  }
}

const handleProvinceChange = () => {
  addressForm.city = ''
  addressForm.district = ''
  selectedCity.value = ''
}

const handleCityChange = () => {
  addressForm.district = ''
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await userApi.updateAddress(addressForm)
      ElMessage.success('更新地址成功')
    } else {
      await userApi.addAddress(addressForm)
      ElMessage.success('添加地址成功')
    }
    router.push('/user/address')
  } catch (error) {
    console.error(isEdit.value ? '更新地址失败:' : '添加地址失败:', error)
    ElMessage.error(isEdit.value ? '更新地址失败' : '添加地址失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/user/address')
}
</script>

<template>
  <div class="address-edit-container">
    <el-card class="address-edit-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑收货地址' : '添加收货地址' }}</span>
        </div>
      </template>

      <el-form :model="addressForm" :rules="rules" label-width="100px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>

        <el-form-item label="所在地区" required>
          <div class="region-select">
            <el-form-item prop="province" class="region-item">
              <el-select
                v-model="addressForm.province"
                placeholder="请选择省份"
                @change="handleProvinceChange"
              >
                <el-option
                  v-for="province in provinces"
                  :key="province"
                  :label="province"
                  :value="province"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="city" class="region-item">
              <el-select
                v-model="addressForm.city"
                placeholder="请选择城市"
                :disabled="!addressForm.province"
                @change="handleCityChange"
              >
                <el-option
                  v-for="city in cities[addressForm.province] || []"
                  :key="city"
                  :label="city"
                  :value="city"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item prop="district" class="region-item">
              <el-select
                v-model="addressForm.district"
                placeholder="请选择区/县"
                :disabled="!addressForm.city"
              >
                <el-option
                  v-for="district in districts[addressForm.city] || []"
                  :key="district"
                  :label="district"
                  :value="district"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>

        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址，如街道、门牌号等"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="addressForm.is_default">设为默认收货地址</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.address-edit-container {
  padding: 20px;
}

.address-edit-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.region-select {
  display: flex;
  gap: 10px;
}

.region-item {
  margin-bottom: 0;
  flex: 1;
}
</style>
