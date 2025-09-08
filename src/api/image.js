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

// 批量删除图片，带并发控制和进度回调
export async function deleteImages(keys, onProgress, concurrency = 5) {
  let successCount = 0;
  let failureCount = 0;
  const total = keys.length;
  const queue = [...keys]; // Create a mutable copy of keys to act as a queue
  let inFlight = 0;
  let processed = 0;

  return new Promise((resolve, reject) => {
    
    const updateProgress = () => {
        processed++;
        if (typeof onProgress === 'function') {
            const progress = Math.round((processed / total) * 100);
            onProgress({ progress, successCount, failureCount, total });
        }
        
        if (processed === total) {
            if (failureCount > 0) {
                reject(new Error(`删除完成，${successCount} 个成功，${failureCount} 个失败。`));
            } else {
                resolve({ successCount, failureCount });
            }
        }
    };

    const runNext = () => {
      while (inFlight < concurrency && queue.length > 0) {
        const key = queue.shift();
        inFlight++;
        
        deleteImage(key)
          .then(() => {
            successCount++;
          })
          .catch(error => {
            console.error(`Failed to delete image ${key}:`, error);
            failureCount++;
          })
          .finally(() => {
            inFlight--;
            updateProgress();
            runNext();
          });
      }
    };

    runNext();
  });
}
