import request from '@/utils/request'
// 首页接口，很多接口都是从其他api里抽过来，毕竟首页很多信息是用其他页面中的数据



// 查询task日志列表
export function getTaskLogList(query) {
  return request({
    url: '/periodic_task/task-log/',
    method: 'get',
    params: query
  })
}

// 查询发布日志列表
export function releaseLog(query) {
  return request({
    url: '/release/release-log/',
    method: 'get',
    params: query
  })
}

// 查询首页信息
export function dashboard(data) {
  return request({
    url: '/dashboard/',
    method: 'post',
    data
  })
}
