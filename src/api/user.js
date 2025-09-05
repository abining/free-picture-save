import request from '@/utils/request'

// 获取用户资料，用于验证 token
export function getProfile() {
  return request({
    url: '/profile',
    method: 'get'
  })
}
