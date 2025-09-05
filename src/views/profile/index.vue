<template>
  <div class="profile-container">
    <el-skeleton :rows="10" animated v-if="loading" />
    <div v-else-if="profileData">
      <el-row :gutter="20">
        <!-- 用户基本信息 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            <div class="user-info">
              <el-avatar :size="100" :src="profileData.avatar" />
              <el-descriptions :column="1" border class="user-details">
                <el-descriptions-item label="用户名">{{ profileData.username }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ profileData.name }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ profileData.email }}</el-descriptions-item>
                <el-descriptions-item label="个人主页">
                    <a :href="profileData.url" target="_blank">{{ profileData.url }}</a>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>

        <!-- 统计信息 -->
        <el-col :span="12">
            <el-card shadow="hover" class="stats-card">
                 <template #header>
                    <div class="card-header">
                        <span>统计信息</span>
                    </div>
                </template>
                <el-row :gutter="20">
                    <el-col :span="12" class="stat-item">
                        <div class="stat-value">{{ profileData.image_num }}</div>
                        <div class="stat-label">图片数量</div>
                    </el-col>
                    <el-col :span="12" class="stat-item">
                        <div class="stat-value">{{ profileData.album_num }}</div>
                        <div class="stat-label">相册数量</div>
                    </el-col>
                </el-row>
            </el-card>
            <el-card shadow="hover" class="capacity-card">
                <template #header>
                    <div class="card-header">
                        <span>容量信息</span>
                    </div>
                </template>
                <div class="capacity-info">
                    <span>{{ formatSize(profileData.size) }} / {{ formatSize(profileData.capacity) }}</span>
                    <el-progress :percentage="capacityPercentage" :stroke-width="15" striped />
                </div>
            </el-card>
        </el-col>
      </el-row>
    </div>
    <el-empty description="无法加载用户信息" v-else />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getProfile } from '@/api/user';

const loading = ref(true);
const profileData = ref(null);

onMounted(async () => {
  try {
    const data = await getProfile();
    profileData.value = data;
  } catch (error) {
    console.error("获取用户信息失败:", error);
  } finally {
    loading.value = false;
  }
});

const capacityPercentage = computed(() => {
  if (!profileData.value || profileData.value.capacity === 0) {
    return 0;
  }
  const percentage = (profileData.value.size / profileData.value.capacity) * 100;
  return parseFloat(percentage.toFixed(2));
});

// 格式化容量大小
const formatSize = (sizeInMB) => {
    if (sizeInMB === 0) return '0 B';
    const sizeInKB = sizeInMB * 1024;
    const i = Math.floor(Math.log(sizeInKB) / Math.log(1024));
    return parseFloat((sizeInKB / Math.pow(1024, i)).toFixed(2)) + ' ' + ['KB', 'MB', 'GB', 'TB'][i-1];
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}
.card-header {
  font-weight: bold;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-details {
  margin-left: 20px;
  flex: 1;
}
.stats-card, .capacity-card {
    margin-bottom: 20px;
}
.stat-item {
    text-align: center;
}
.stat-value {
    font-size: 24px;
    font-weight: bold;
}
.stat-label {
    color: #606266;
    margin-top: 5px;
}
.capacity-info {
    text-align: center;
}
.capacity-info .el-progress {
    margin-top: 10px;
}
</style>
