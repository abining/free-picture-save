<template>
  <div class="image-list-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="排序方式">
          <el-select v-model="queryParams.order" placeholder="请选择" @change="handleSearch" style="width:150px;">
            <el-option label="最新" value="newest"></el-option>
            <el-option label="最早" value="earliest"></el-option>
            <el-option label="最大" value="utmost"></el-option>
            <el-option label="最小" value="least"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-select v-model="queryParams.permission" placeholder="请选择" @change="handleSearch" style="width:150px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="公开" value="public"></el-option>
            <el-option label="私有" value="private"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="相册">
          <el-select v-model="queryParams.album_id" placeholder="请选择" clearable @change="handleSearch" style="width:150px;">
            <el-option v-for="album in albumList" :key="album.id" :label="album.name" :value="album.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.q" placeholder="请输入关键字" clearable @keyup.enter="handleSearch" style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 & 表格区域 -->
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedImages.length === 0">批量删除</el-button>
      </div>
      <el-table :data="imageList" v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="缩略图" width="120">
          <template #default="{ row }">
            <el-image style="width: 80px; height: 80px" :src="row.links.thumbnail_url" fit="cover" :preview-src-list="[row.links.url]" preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
                {{ formatSize(row.size) }}
            </template>
        </el-table-column>
        <el-table-column prop="human_date" label="上传日期" width="180"></el-table-column>
        <el-table-column label="链接" width="150">
            <template #default="{ row }">
                <el-dropdown>
                    <el-button type="primary" link>
                        复制链接<el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="copyToClipboard(row.links.url, 'URL')">URL</el-dropdown-item>
                            <el-dropdown-item @click="copyToClipboard(row.links.html, 'HTML')">HTML</el-dropdown-item>
                            <el-dropdown-item @click="copyToClipboard(row.links.bbcode, 'BBCode')">BBCode</el-dropdown-item>
                            <el-dropdown-item @click="copyToClipboard(row.links.markdown, 'Markdown')">Markdown</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-popconfirm title="确定要删除这张图片吗？" @confirm="handleDelete(row.key)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="pagination.total > 0"
        class="pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        v-model:current-page="pagination.current_page"
        v-model:page-size="pagination.per_page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getImages, deleteImage, deleteImages } from '@/api/image';
import { getAlbums } from '@/api/album';
import { ElMessage, ElMessageBox } from 'element-plus';
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const loading = ref(true);
const imageList = ref([]);
const albumList = ref([]);
const selectedImages = ref([]);

const queryParams = reactive({
  page: 1,
  order: 'newest',
  permission: '',
  album_id: '',
  q: ''
});

const pagination = reactive({
  total: 0,
  current_page: 1,
  per_page: 15, 
});

const fetchImages = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams, page: pagination.current_page, per_page: pagination.per_page };
    if (!params.permission) delete params.permission;
    if (!params.album_id) delete params.album_id;

    const res = await getImages(params);
    imageList.value = res.data;
    pagination.total = res.total;
    pagination.current_page = res.current_page;
    pagination.per_page = res.per_page;
  } catch (error) {
    console.error("获取图片列表失败:", error);
    ElMessage.error('获取图片列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchAlbums = async () => {
    try {
        let currentPage = 1;
        let allAlbums = [];
        let totalPages = 1;

        // Fetch first page to get pagination info
        const firstPageRes = await getAlbums({ page: currentPage });
        allAlbums = firstPageRes.data;
        totalPages = firstPageRes.last_page;

        // Fetch remaining pages if they exist
        if (totalPages > 1) {
            const pagePromises = [];
            for (let i = 2; i <= totalPages; i++) {
                pagePromises.push(getAlbums({ page: i }));
            }
            const remainingPagesRes = await Promise.all(pagePromises);
            remainingPagesRes.forEach(res => {
                allAlbums = allAlbums.concat(res.data);
            });
        }
        
        albumList.value = allAlbums;
    } catch (error) {
        console.error("获取相册列表失败:", error);
    }
}

onMounted(() => {
  fetchImages();
  fetchAlbums();
});

const handleSearch = () => {
    pagination.current_page = 1;
    fetchImages();
};

const handleSelectionChange = (val) => {
    selectedImages.value = val;
};

const handleBatchDelete = async () => {
    const keys = selectedImages.value.map(img => img.key);
    if (keys.length === 0) {
        ElMessage.warning('请先选择要删除的图片');
        return;
    }

    try {
        await ElMessageBox.confirm(
            `确定要删除选中的 ${keys.length} 张图片吗？`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        loading.value = true;
        await deleteImages(keys);
        ElMessage.success('批量删除成功');
        fetchImages(); // Refresh list

    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '批量删除操作失败');
            console.error("批量删除失败:", error);
        }
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (key) => {
    try {
        await deleteImage(key);
        ElMessage.success('删除成功');
        fetchImages(); // 重新加载数据
    } catch (error) {
        ElMessage.error('删除失败');
        console.error("删除图片失败:", error);
    }
};

const handleSizeChange = (val) => {
    pagination.per_page = val;
    fetchImages();
};

const handleCurrentChange = (val) => {
    pagination.current_page = val;
    fetchImages();
};

const formatSize = (sizeInKB) => {
    const size = parseFloat(sizeInKB);
    if (isNaN(size)) return '0 KB';
    if (size < 1024) return `${size.toFixed(2)} KB`;
    const sizeInMB = size / 1024;
    return `${sizeInMB.toFixed(2)} MB`;
};

const copyToClipboard = async (text, type) => {
    try {
        await toClipboard(text);
        ElMessage.success(`${type} 链接已复制到剪贴板`);
    } catch (e) {
        ElMessage.error('复制失败');
        console.error(e);
    }
};
</script>

<style scoped>
.image-list-container {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.toolbar {
  margin-bottom: 15px;
}
</style>
