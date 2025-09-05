import request from '@/utils/request'

// 获取相册列表
export function getAlbums(params) {
  return request({
    url: '/albums',
    method: 'get',
    params
  })
}

// 删除相册
export function deleteAlbum(id) {
  return request({
    url: `/albums/${id}`,
    method: 'delete'
  })
}
