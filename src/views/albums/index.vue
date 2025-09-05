<template>
  <div class="album-list-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="排序方式">
          <el-select v-model="queryParams.order" placeholder="请选择" @change="handleSearch" style="width:150px;">
            <el-option label="最新" value="newest"></el-option>
            <el-option label="最早" value="earliest"></el-option>
            <el-option label="图片最多" value="most"></el-option>
            <el-option label="图片最少" value="least"></el-option>
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

    <!-- 表格区域 -->
    <el-card shadow="never">
      <el-table :data="albumList" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="intro" label="简介" show-overflow-tooltip></el-table-column>
        <el-table-column prop="image_num" label="图片数量" width="120"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-popconfirm title="确定要删除这个相册吗？" @confirm="handleDelete(row.id)">
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
import { getAlbums, deleteAlbum } from '@/api/album';
import { ElMessage } from 'element-plus';

const loading = ref(true);
const albumList = ref([]);

const queryParams = reactive({
  page: 1,
  order: 'newest',
  q: ''
});

const pagination = reactive({
  total: 0,
  current_page: 1,
  per_page: 15, 
});

const fetchAlbums = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams, page: pagination.current_page, per_page: pagination.per_page };
    const res = await getAlbums(params);
    albumList.value = res.data;
    pagination.total = res.total;
    pagination.current_page = res.current_page;
    pagination.per_page = res.per_page;
  } catch (error) {
    console.error("获取相册列表失败:", error);
    ElMessage.error('获取相册列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAlbums();
});

const handleSearch = () => {
    pagination.current_page = 1;
    fetchAlbums();
};

const handleDelete = async (id) => {
    try {
        await deleteAlbum(id);
        ElMessage.success('删除成功');
        fetchAlbums(); // 重新加载数据
    } catch (error) {
        ElMessage.error('删除失败');
        console.error("删除相册失败:", error);
    }
};

const handleSizeChange = (val) => {
    pagination.per_page = val;
    fetchAlbums();
};

const handleCurrentChange = (val) => {
    pagination.current_page = val;
    fetchAlbums();
};
</script>

<style scoped>
.album-list-container {
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
</style>
