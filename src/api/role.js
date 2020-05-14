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

export function getUsers() {
  return request({
    url: '/users/',
    method: 'get'
  })
}
