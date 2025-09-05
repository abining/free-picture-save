import request from '@/utils/request'

// 获取图片列表
export function getImages(params) {
  return request({
    url: '/images',
    method: 'get',
    params
  })
}

// 删除图片
export function deleteImage(key) {
  return request({
    url: `/images/${key}`,
    method: 'delete'
  })
}

// 上传图片
// 注意：此函数需要传递一个 FormData 对象
export function uploadImage(data) {
  return request({
    url: '/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 批量删除图片
export async function deleteImages(keys) {
  const promises = keys.map(key => deleteImage(key));
  const results = await Promise.allSettled(promises);
  
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.length - successCount;

  if (failureCount > 0) {
      throw new Error(`${successCount} succeeded, ${failureCount} failed.`);
  }

  return { successCount, failureCount };
}
