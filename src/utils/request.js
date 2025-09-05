import axios from "axios";
import { useMainStore } from "@/stores";
import router from '@/router/index.js';
import { ElMessage } from 'element-plus';

const service = axios.create({
  // baseURL: '/epcloud/social-worker',
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json;",
    "Accept": "application/json",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const store = useMainStore();
    const token = store.getUser?.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 根据 PICUI 接口文档， `status: true` 代表请求成功
    if (res.status === true) {
      // 接口返回的实际数据在 `data` 属性中
      return res.data;
    } else {
      // `status` 为 false 表示业务失败，弹出 `message` 中的错误信息
      ElMessage.error(res.message || 'Error');
      return Promise.reject(new Error(res.message || 'Error'));
    }
  },
  (error) => {
    // 处理 HTTP 层面的错误 (例如: 401, 403, 500)
    console.error('HTTP Error:', error); 

    // 优先使用接口返回的错误信息
    const message = error.response?.data?.message || error.message || '网络请求失败';
    
    // 特别处理 401 未授权错误
    if (error.response?.status === 401) {
        const store = useMainStore();
        store.clearUser(); // 清除本地的用户信息
        router.replace('/login');
        ElMessage.error('授权失败或已过期，请重新登录');
    } else {
        ElMessage.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default service;
