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

// 个人中心
// 更新用户,这个和上面更新用户区分开了是为了权限控制，个人只能修改自己的信息
export function updatePersonal(id, data) {
  return request({
    url: `/personal/${id}/`,
    method: 'patch',
    data
  })
}
// 个人修改密码 查询旧密码是否正确
export function passAuth(data) {
  return request({
    url: '/personal/',
    method: 'post',
    data
  })
}



// 查询锐捷用户列表
export function getRuiJieUserList(query) {
  return request({
    url: '/ruijieuserinfo/',
    method: 'get',
    params: query
  })
}