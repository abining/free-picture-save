<template>
  <div class="lot-upload-container">
    <el-row :gutter="20">
      <!-- 左侧：上传设置 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>上传设置</span>
            </div>
          </template>
          <el-form :model="form" ref="formRef" label-width="80px" label-position="top">
            <el-form-item label="权限" prop="permission">
              <el-radio-group v-model="form.permission">
                <el-radio :label="1">公开</el-radio>
                <el-radio :label="0">私有</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="存储策略" prop="strategy_id">
              <el-select v-model="form.strategy_id" placeholder="请选择存储策略" clearable style="width: 100%;">
                <el-option v-for="item in strategyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属相册" prop="album_id">
              <el-select v-model="form.album_id" placeholder="请选择相册" clearable style="width: 100%;">
                <el-option v-for="item in albumList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：文件列表与上传 -->
      <el-col :span="16">
        <el-card shadow="never">
           <template #header>
             <div class="card-header">
                <span>文件列表</span>
             </div>
           </template>
           <el-upload
            ref="uploadRef"
            class="upload-dragger"
            drag
            multiple
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
          
           >
           <!-- accept="image/*" -->
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
          
          <div class="upload-progress" v-if="uploading">
            <el-progress :percentage="progress.percentage" :text-inside="true" stroke-width="20" />
            <div class="progress-stats">
                <span>总数: {{ progress.total }}</span>
                <span>成功: <span style="color: #67c23a;">{{ progress.success }}</span></span>
                <span>失败: <span style="color: #f56c6c;">{{ progress.failed }}</span></span>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="handleSubmit" :loading="uploading" :disabled="fileList.length === 0">开始上传</el-button>
            <el-button @click="handleClearFiles" :disabled="fileList.length === 0">清空列表</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getStrategies } from '@/api/strategy';
import { getAlbums } from '@/api/album';
import { uploadImages } from '@/api/image';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

const formRef = ref(null);
const uploadRef = ref(null);
const uploading = ref(false);
const strategyList = ref([]);
const albumList = ref([]);
const fileList = ref([]);

const form = reactive({
  permission: 1,
  strategy_id: '',
  album_id: ''
});

const progress = reactive({
    percentage: 0,
    success: 0,
    failed: 0,
    total: 0,
    processed: 0
});

onMounted(() => {
  fetchStrategies();
  fetchAlbums();
});

const fetchStrategies = async () => {
  try {
    const res = await getStrategies();
    strategyList.value = res.strategies;
  } catch (error) {
    console.error("获取存储策略失败:", error);
  }
};

const fetchAlbums = async () => {
  try {
    // 假设 getAlbums 返回的数据结构中列表在 data 字段
    const res = await getAlbums();
    albumList.value = res.data; 
  } catch (error) {
    console.error("获取相册列表失败:", error);
  }
};

const handleFileChange = (file, updatedFileList) => {
    const isImage = file.raw.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error(`文件 ${file.name} 不是图片格式！`);
        // 从列表中移除无效文件
        const index = updatedFileList.findIndex(f => f.uid === file.uid);
        if (index > -1) {
            updatedFileList.splice(index, 1);
        }
    }
    fileList.value = updatedFileList;
};

const handleClearFiles = () => {
    fileList.value = [];
};

const handleSubmit = async () => {
    if (fileList.value.length === 0) {
        ElMessage.warning('请先选择要上传的文件');
        return;
    }

    uploading.value = true;
    progress.percentage = 0;
    progress.success = 0;
    progress.failed = 0;
    progress.total = fileList.value.length;
    progress.processed = 0;

    const filesToUpload = fileList.value.map(f => f.raw);

    try {
        await uploadImages(filesToUpload, form, (p) => {
            progress.percentage = p.progress;
            progress.success = p.successCount;
            progress.failed = p.failureCount;
            progress.processed = p.processed;
        });
        ElMessage.success('批量上传任务完成！');
        handleClearFiles();
    } catch (error) {
        ElMessage.error(error.message || '批量上传任务出现错误');
    } finally {
        uploading.value = false;
    }
};
</script>

<style scoped>
.lot-upload-container {
  padding: 20px;
}
.upload-dragger {
  width: 100%;
  margin-bottom: 20px;
}
.action-buttons {
  margin-top: 20px;
  text-align: right;
}
.upload-progress {
    margin-top: 20px;
}
.progress-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 14px;
    color: #606266;
}
</style>
