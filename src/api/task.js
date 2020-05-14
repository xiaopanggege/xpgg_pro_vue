import request from '@/utils/request'
import qs from 'qs'
// 任务调度接口

// 查询Clocked列表
export function getClockedList(query) {
  return request({
    url: '/periodic_task/clocked-schedule/',
    method: 'get',
    params: query
  })
}

// 新增date
export function addClocked(data) {
  return request({
    url: '/periodic_task/clocked-schedule/',
    method: 'post',
    data
  })
}

// 删除date
export function deleteClocked(id) {
  return request({
    url: `/periodic_task/clocked-schedule/${id}/`,
    method: 'delete'
  })
}

// 查询crontab列表
export function getCrontabList(query) {
  return request({
    url: '/periodic_task/crontab-schedule/',
    method: 'get',
    params: query
  })
}

// 新增crontab
export function addCrontab(data) {
  return request({
    url: '/periodic_task/crontab-schedule/',
    method: 'post',
    data
  })
}

// 删除crontab
export function deleteCrontab(id) {
  return request({
    url: `/periodic_task/crontab-schedule/${id}/`,
    method: 'delete'
  })
}

// 查询interval列表
export function getIntervalList(query) {
  return request({
    url: '/periodic_task/interval-schedule/',
    method: 'get',
    params: query
  })
}

// 新增interval
export function addInterval(data) {
  return request({
    url: '/periodic_task/interval-schedule/',
    method: 'post',
    data
  })
}

// 删除interval
export function deleteInterval(id) {
  return request({
    url: `/periodic_task/interval-schedule/${id}/`,
    method: 'delete'
  })
}

// 查询task列表
export function getTaskList(query) {
  return request({
    url: '/periodic_task/periodic-task/',
    method: 'get',
    params: query
  })
}

// 新增task
export function addTask(data) {
  return request({
    url: '/periodic_task/periodic-task/',
    method: 'post',
    data
  })
}

// 更新task
export function updateTask(data) {
  return request({
    url: `/periodic_task/periodic-task/${data.id}/`,
    method: 'patch',
    data
  })
}

// 删除task
export function deleteTask(id) {
  return request({
    url: `/periodic_task/periodic-task/${id}/`,
    method: 'delete'
  })
}


// 查询Clocked列表，不分页的那种
export function getClockedList_nopage() {
  return request({
    url: '/periodic_task/clocked-list/',
    method: 'get',
  })
}

// 查询Interval列表，不分页的那种
export function getIntervalList_nopage() {
  return request({
    url: '/periodic_task/interval-list/',
    method: 'get',
  })
}

// 查询Crontab列表，不分页的那种
export function getCrontabList_nopage() {
  return request({
    url: '/periodic_task/crontab-list/',
    method: 'get',
  })
}

// 立即执行task
export function runTask(data) {
  return request({
    url: '/periodic_task/run-task/',
    method: 'post',
    data
  })
}

// 查询task日志列表
export function getTaskLogList(query) {
  return request({
    url: '/periodic_task/task-log/',
    method: 'get',
    params: query
  })
}

// 删除task日志
export function deleteTaskLog(id) {
  return request({
    url: `/periodic_task/task-log/${id}/`,
    method: 'delete'
  })
}

// 批量删除task日志
export function multipleDeleteTaskLog(data) {
  return request({
    url: '/periodic_task/task-log/multiple_delete/',
    method: 'delete',
    params: data,
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false })
    }
  })
}