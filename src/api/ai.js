import request from "@/utils/request";
import { useMainStore } from '@/stores'
const store = useMainStore();
// 1. 登录接口
// 2. 获取验证码接口。

// // 1. 新增nesma文档接口
// // 2. 文件上传接口
// // 3. nesma列表接口
// // post
// /ai-api/nesma/getTaskList
// 入参：page，pageSize

// // 创建任务,使用multipart/form-data传入参数
// /ai-api/nesma/createTask
// 入参：taskId,taskDescription,taskName,file

// // get
// // 生成随机id作为任务id
// /ai-api/nesma/getRandID
// // 入参：无，返回随机id作为taskId

// 获取任务列表
export function getTaskList(data) {
  return request({
    url: "/ai-api/nesma/getTaskList",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
}

// 创建任务
export function createTask(data) {
  return request({
    url: "/ai-api/nesma/createTask",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 获取随机ID
export function getRandID() {
  return request({
    url: "/ai-api/nesma/getRandID",
    method: "get",
  });
}

export async function downloadWord(params) {
  const store = useMainStore();
  const token = store.user?.token || '';

  // 拼接 query 参数
  const query = new URLSearchParams(params).toString();
  const url = `/ai-api/nesma/downloadWord?${query}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  // 检查响应类型
  if (!response.ok) {
    throw new Error('文件下载失败');
  }
  return await response.blob();
}
// /ai-api/nesma/getUserMail，get，获取用户邮箱
export function getUserMail(data) {
  return request({
    url: "/ai-api/nesma/getUserMail",
    method: "get",
    params: data,
  });
}

// /ai-api/nesma/pushNesmaExcelToMail,application/x-www-form-urlencoded
// /ai-api/nesma/pushExcelToMail
export function pushNesmaExcelToMail(data) {
  return request({
    url: "/ai-api/nesma/pushExcelToMail",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// /ai-api/nesma/getNesmaTaskDetail,get
export function getNesmaTaskDetail(data) {
  return request({
    url: "/ai-api/nesma/getNesmaTaskDetail",
    method: "get",
    params: data,
  });
}
// GET
// /ai-api/nesma/getNesmaTaskDocContent
export function getNesmaTaskDocContent(data) {
  return request({
    url: "/ai-api/nesma/getNesmaTaskDocContent",
    method: "get",
    params: data,
  });
}

// getNesmaTaskDetailList复制接口复制文档复制地址，获取nesma列表，post
export function getNesmaTaskDetailList(data) {
  return request({
    url: "/ai-api/nesma/getNesmaTaskDetailList",
    method: "post",
    data,
  });
}
// snap文件上传复制接口复制文档复制地址
// POST
// /ai-api/snap/uploadFile
// 请求数据类型multipart/form-data
export function uploadFile(data) {
  return request({
    url: "/ai-api/snap/uploadFile",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// snap任务查询复制接口复制文档复制地址
// POST
// /ai-api/snap/selectTaskList
// 请求数据类型application/json
export function selectTaskList(data) {
  return request({
    url: "/ai-api/snap/selectTaskList",
    method: "post",
    data,
  });
}
// snap输入及输出文件下载复制接口复制文档复制地址
// POST
// /ai-api/snap/downloadFile
// 请求数据类型application/json
export function downloadFile(data) {
  return request({
    url: "/ai-api/snap/downloadFile",
    method: "post",
    data,
  });
}
// snap任务创建复制接口复制文档复制地址
// POST
// /ai-api/snap/createTask
// 请求数据类型application/json
export function createSnapTask(data) {
  return request({
    url: "/ai-api/snap/createTask",
    method: "post",
    data,
  });
}