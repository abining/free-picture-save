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
          <el-select v-model="queryParams.album_id" placeholder="请选择" clearable @change="handleSearch"
            style="width:150px;">
            <el-option v-for="album in albumList" :key="album.id" :label="album.name" :value="album.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.q" placeholder="请输入关键字" clearable @keyup.enter="handleSearch"
            style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 & 表格区域 -->
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="danger" @click="handleBatchDelete"
          :disabled="selectedImages.length === 0">批量删除</el-button><el-button type="primary"
          @click="handleGenerateScript" :disabled="selectedImages.length === 0">生成下载脚本</el-button>
        <el-button type="danger" plain @click="handleClearAll">清空图床</el-button>
      </div>
      <el-table :data="imageList" v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange"
        @row-click="handleRowClick" ref="tableRef" border :row-style="{ height: 'auto' }">
        <el-table-column type="selection" width="55" />
        <el-table-column label="缩略图" width="120">
          <template #default="{ row }">
            <el-image  :src="row.links.thumbnail_url" fit="cover"
              :preview-src-list="[row.links.url]" preview-teleported></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" show-overflow-tooltip resizable></el-table-column>
        <el-table-column prop="size" label="大小" width="120" resizable>
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="human_date" label="上传日期" width="180" resizable></el-table-column>
        <el-table-column label="链接" width="150" resizable>
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
      <el-pagination v-if="pagination.total > 0" class="pagination" background
        layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
        v-model:current-page="pagination.current_page" v-model:page-size="pagination.per_page"
        @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>
    </el-card>

    <!-- 进度条弹窗 -->
    <el-dialog v-model="progressDialog.visible" :title="progressDialog.title" :close-on-click-modal="false"
      :show-close="false" width="400px">
      <div class="progress-content">
        <el-progress :percentage="progressDialog.percentage" :text-inside="true" stroke-width="20" />
        <div class="progress-stats">
          <span>总数: {{ progressDialog.total }}</span>
          <span>成功: <span style="color: #67c23a;">{{ progressDialog.success }}</span></span>
          <span>失败: <span style="color: #f56c6c;">{{ progressDialog.failed }}</span></span>
        </div>
      </div>
    </el-dialog>

    <!-- 生成脚本弹窗 -->
    <el-dialog v-model="scriptDialog.visible" title="批量下载脚本" width="600px">
      <el-tabs v-model="scriptDialog.activeTab">
        <el-tab-pane label="cURL (macOS/Linux)" name="curl">
          <pre class="script-box"><code>{{ scriptDialog.scripts.curl }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="Wget (Linux)" name="wget">
          <pre class="script-box"><code>{{ scriptDialog.scripts.wget }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="PowerShell (Windows)" name="powershell">
          <pre class="script-box"><code>{{ scriptDialog.scripts.powershell }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="URL 列表" name="urls">
          <pre class="script-box"><code>{{ scriptDialog.scripts.urls }}</code></pre>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scriptDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleCopyScript">复制脚本</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getImages, deleteImage, deleteImages } from '@/api/image';
import { getAlbums } from '@/api/album';
import { ElMessage, ElMessageBox } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const { toClipboard } = useClipboard();

const loading = ref(true);
const imageList = ref([]);
const albumList = ref([]);
const selectedImages = ref([]);
const tableRef = ref(null);

const progressDialog = reactive({
  visible: false,
  title: '',
  percentage: 0,
  success: 0,
  failed: 0,
  total: 0
});

const scriptDialog = reactive({
  visible: false,
  activeTab: 'curl',
  scripts: {
    curl: '',
    wget: '',
    powershell: '',
    urls: ''
  }
});

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

const handleRowClick = (row) => {
  if (tableRef.value) {
    tableRef.value.toggleRowSelection(row);
  }
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

    // 初始化并显示进度条弹窗
    progressDialog.visible = true;
    progressDialog.percentage = 0;
    progressDialog.success = 0;
    progressDialog.failed = 0;
    progressDialog.total = keys.length;

    await deleteImages(keys, ({ progress, successCount, failureCount }) => {
      progressDialog.percentage = progress;
      progressDialog.success = successCount;
      progressDialog.failed = failureCount;
    });

    ElMessage.success('批量删除操作完成');

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除操作出现错误');
      console.error("批量删除失败:", error);
    }
  } finally {
    progressDialog.visible = false;
    fetchImages(); // Refresh list
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

const handleClearAll = async () => {
    // 1. 动态生成提示信息
    let confirmationMessage = '';
    const totalImages = pagination.total;
    const albumName = queryParams.album_id ? albumList.value.find(a => a.id === queryParams.album_id)?.name : null;

    if (albumName) {
        confirmationMessage = `此操作将删除相册【${albumName}】下的全部 ${totalImages} 张图片，`;
    } else if (queryParams.q) {
        confirmationMessage = `此操作将删除关键字【${queryParams.q}】匹配的全部 ${totalImages} 张图片，`;
    } else {
        confirmationMessage = `此操作将删除图床中的全部 ${totalImages} 张图片，`;
    }

    try {
        // 2. 第一次确认
        await ElMessageBox.confirm(
            `${confirmationMessage}此操作不可逆！`,
            '危险操作警告',
            {
                confirmButtonText: '我已知晓，继续',
                cancelButtonText: '取消',
                type: 'error',
            }
        );
        
        // 3. 第二次带输入框的确认
        const { value } = await ElMessageBox.prompt(
            '为防止误操作，请输入“确定清空”以确认执行删除操作。',
            '最终确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                inputPattern: /^确定清空$/,
                inputErrorMessage: '输入不正确，操作已取消',
            }
        );

        if (value === '确定清空') {
            loading.value = true;
            
            const allKeys = await fetchAllImageKeys();

            if (allKeys.length === 0) {
                ElMessage.info('没有找到可清空的图片');
                return;
            }

            progressDialog.visible = true;
            progressDialog.percentage = 0;
            progressDialog.success = 0;
            progressDialog.failed = 0;
            progressDialog.total = allKeys.length;

            await deleteImages(allKeys, ({ progress, successCount, failureCount }) => {
                progressDialog.percentage = progress;
                progressDialog.success = successCount;
                progressDialog.failed = failureCount;
            });

            ElMessage.success('清空操作完成');
        }

    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.info('操作已取消或输入不正确');
            console.error("清空图床失败或取消:", error);
        } else {
            ElMessage.info('操作已取消');
        }
    } finally {
        progressDialog.visible = false;
        loading.value = false;
        fetchImages(); // Refresh list
    }
};

const fetchAllImageKeys = async () => {
    const total = pagination.total;
    if (total === 0) return [];
    
    // 使用当前的筛选条件来获取所有 key
    const params = { ...queryParams, per_page: 40 }; 
    if (!params.permission) delete params.permission;
    if (!params.album_id) delete params.album_id;

    const totalPages = Math.ceil(total / params.per_page);
    const allKeys = [];

    const pagePromises = [];
    for (let i = 1; i <= totalPages; i++) {
        pagePromises.push(getImages({ ...params, page: i }));
    }

    const results = await Promise.all(pagePromises);
    
    for (const res of results) {
        if (res && res.data) {
            res.data.forEach(img => {
                allKeys.push(img.key);
            });
        }
    }
    
    return allKeys;
};


const handleGenerateScript = () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请先选择要生成的图片');
    return;
  }

  const scripts = {
    curl: selectedImages.value.map(img => `curl -O "${img.links.url}"`).join('\n'),
    wget: selectedImages.value.map(img => `wget "${img.links.url}"`).join('\n'),
    powershell: selectedImages.value.map(img => `Invoke-WebRequest -Uri "${img.links.url}" -OutFile "${img.name}"`).join('\n'),
    urls: selectedImages.value.map(img => img.links.url).join('\n')
  };

  scriptDialog.scripts = scripts;
  scriptDialog.visible = true;
};

const handleCopyScript = async () => {
  const scriptToCopy = scriptDialog.scripts[scriptDialog.activeTab];
  if (scriptToCopy) {
    try {
      await toClipboard(scriptToCopy);
      ElMessage.success('脚本已成功复制到剪贴板！');
      scriptDialog.visible = false;
    } catch (e) {
      ElMessage.error('复制失败，请手动复制。');
      console.error('复制脚本失败:', e);
    }
  }
};
</script>

<style scoped>
.image-list-container {
  width: 100%;
  height: 100%;
  overflow: scroll;
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

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.progress-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.script-box {
  background-color: #f5f5f5;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 确保表格行高适应缩略图 */
:deep(.el-table__row) {
  height: auto !important;
}

:deep(.el-table__cell) {
  padding: 12px 0 !important;
  vertical-align: middle;
}

:deep(.el-table__body tr) {
  height: auto !important;
}
</style>
