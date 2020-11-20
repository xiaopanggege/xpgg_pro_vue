import request from '@/utils/request'
// 用户管理接口

// 查询用户列表
export function getUserList(query) {
  return request({
    url: '/userinfo/',
    method: 'get',
    params: query
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/userinfo/',
    method: 'post',
    headers: {
      "Content-Type": "multipart/form-data;charset=utf-8"
    },
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/userinfo/${id}/`,
    method: 'patch',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/userinfo/${id}/`,
    method: 'delete'
  })
}

// 修改密码 查询旧密码是否正确
export function passAuth(data) {
  return request({
    url: '/passauth/',
    method: 'post',
    data
  })
}