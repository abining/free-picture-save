import request from '@/utils/request'

// 获取存储策略列表
export function getStrategies(params) {
  return request({
    url: '/strategies',
    method: 'get',
    params
  })
}
