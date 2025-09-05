import request from '@/utils/request'

// 获取验证码
export function getSmsCode(data) {
  return request({
    url: '/jmzx-mgr/login/sendSmsCode',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/jmzx-mgr/login/checkSmsCode',
    method: 'post',
    data
  })
}