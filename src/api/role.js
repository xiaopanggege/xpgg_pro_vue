import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes/',
    method: 'get'
  })
}

export function getRoles(query) {
  return request({
    url: '/roles/',
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/roles/',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/${id}/`,
    method: 'patch',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/roles/${id}/`,
    method: 'delete'
  })
}

// 查询view-api权限所有不分页
export function getViewApiAll() {
  return request({
    url: '/view-api-all/',
    method: 'get',
  })
}


// 查询角色包含的用户列表
export function getRoleUsers(query) {
  return request({
    url: '/roles-user/',
    method: 'get',
    params: query
  })
}


// 查询用户列表
export function getUserList(query) {
  return request({
    url: '/userinfo/',
    method: 'get',
    params: query
  })
}

// 添加用户
export function addRoleUser(data) {
  return request({
    url: '/roles-user/',
    method: 'post',
    data
  })
}


// 删除用户，后台是用更新的方式
export function deleteRoleUser(id, data) {
  return request({
    url: `/roles-user/${id}/`,
    method: 'delete',
    data
  })
}