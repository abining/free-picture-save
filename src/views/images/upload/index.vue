<template>
  <div class="upload-container">
    <el-card shadow="never">
       <template #header>
        <div class="card-header">
          <span>上传图片</span>
        </div>
      </template>
      <el-form :model="form" ref="formRef" label-width="100px" class="upload-form">
        <el-form-item label="图片文件" prop="file" :rules="[{ required: true, message: '请选择图片文件' }]">
           <el-upload
            ref="uploadRef"
            class="upload-dragger"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            :on-exceed="handleExceed"
            accept="image/gif,image/png,image/jpeg,image/webp"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传一张图片
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="权限" prop="permission">
          <el-radio-group v-model="form.permission">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="0">私有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="存储策略" prop="strategy_id">
          <el-select v-model="form.strategy_id" placeholder="请选择存储策略" clearable>
            <el-option v-for="item in strategyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属相册" prop="album_id">
          <el-select v-model="form.album_id" placeholder="请选择相册" clearable>
            <el-option v-for="item in albumList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间" prop="expired_at">
          <el-date-picker
            v-model="form.expired_at"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">立即上传</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getStrategies } from '@/api/strategy';
import { getAlbums } from '@/api/album';
import { uploadImage } from '@/api/image';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'

const formRef = ref(null);
const uploadRef = ref(null);
const loading = ref(false);
const strategyList = ref([]);
const albumList = ref([]);

const form = reactive({
  file: null,
  permission: 1,
  strategy_id: '',
  album_id: '',
  expired_at: ''
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
    const res = await getAlbums();
    albumList.value = res.data;
  } catch (error) {
    console.error("获取相册列表失败:", error);
  }
};

onMounted(() => {
  fetchStrategies();
  fetchAlbums();
});

const handleFileChange = (uploadFile) => {
  const isImage = uploadFile.raw.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    uploadRef.value.clearFiles(); // Clear the file list
    form.file = null;
    return;
  }
  form.file = uploadFile.raw;
};

const handleFileRemove = () => {
  form.file = null;
};

const handleExceed = (files) => {
    uploadRef.value.clearFiles();
    const file = files[0];
    uploadRef.value.handleStart(file);
}

const resetForm = () => {
    formRef.value.resetFields();
    uploadRef.value.clearFiles();
    form.file = null;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const formData = new FormData();
        formData.append('file', form.file);
        
        // 只添加有值的字段
        if (form.permission !== null) formData.append('permission', form.permission);
        if (form.strategy_id) formData.append('strategy_id', form.strategy_id);
        if (form.album_id) formData.append('album_id', form.album_id);
        if (form.expired_at) formData.append('expired_at', form.expired_at);

        await uploadImage(formData);
        ElMessage.success('上传成功');
        resetForm();
      } catch (error) {
        console.error("上传失败:", error);
        ElMessage.error('上传失败');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.upload-container {
  padding: 20px;
}
.upload-form {
  max-width: 600px;
}
.upload-dragger {
    width: 100%;
}
</style>
