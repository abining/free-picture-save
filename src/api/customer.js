import request from '@/utils/request'

/**
 * 查询客户列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 客户名称
 * @param {string} [params.billNo] - 计费号
 * @param {string} [params.city] - 归属地市
 * @param {string} [params.status] - 客户状态
 * @param {string} [params.startDate] - 开始日期
 * @param {string} [params.endDate] - 结束日期
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise}
 */
// export function getCustomerList(params) {
//   return request({
//     url: '/customer/list',
//     method: 'get',
//     params
//   })
// }

/**
 * 新增客户
 * @param {Object} data - 客户信息
 * @returns {Promise}
 */
export function addCustomer(data) {
  return request({
    url: '/jmzx-mgr/customerMgr/addCustomer',
    method: 'post',
    data
  })
}
// queryAllAreaOption复制接口复制文档复制地址
// POST
// /jmzx-mgr/customerMgr/queryAllAreaOption
// 请求数据类型application/x-www-form-urlencoded
export function queryAllAreaOption(data) {
  return request({
    url: '/jmzx-mgr/customerMgr/queryAllAreaOption',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
// queryCustomerListByPage复制接口复制文档复制地址
// POST
// /jmzx-mgr/customerMgr/queryCustomers
export function queryCustomerListByPage(data) {
  return request({
    url: '/jmzx-mgr/customerMgr/queryCustomers',
    method: 'post',
    data
  })
}
// queryUserArea复制接口复制文档复制地址
// POST
// /jmzx-mgr/customerMgr/queryUserArea
// 请求数据类型application/json
export function queryUserArea(data) {
  return request({
    url: '/jmzx-mgr/customerMgr/queryUserArea',
    method: 'post',
    data
  })
}

// updateUserArea复制接口复制文档复制地址
// POST
// /jmzx-mgr/customerMgr/updateUserArea
export function updateUserArea(data) {
  return request({
    url: '/jmzx-mgr/customerMgr/updateUserArea',
    method: 'post',
    data
  })
}

