import request from '@/utils/request'
// 系统配置接口

// 查询系统配置信息 
export function getSysInfo(query) {
  return request({
    url: '/sysconf/sysconf-base/',
    method: 'get',
    params: query
  })
}

// 新增系统配置
export function createSys(data) {
  return request({
    url: '/sysconf/sysconf-base/',
    method: 'post',
    data
  })
}

// 更新系统配置
export function updateSys(name, data) {
  return request({
    url: `/sysconf/sysconf-base/${name}/`,
    method: 'patch',
    data
  })
}


// 测试邮件发送
export function emailTest(data) {
  return request({
    url: '/sysconf/email-test/',
    method: 'post',
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



// 查询锐捷用户列表
export function getRuiJieUserList(query) {
  return request({
    url: '/ruijieuserinfo/',
    method: 'get',
    params: query
  })
}