import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/login/',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo() {
  return request({
    // url中最后的/1/是随便填写的，后端已经写死必须获取登录用户的信息了
    url: '/userinfo/1/',
    method: 'get',
    // params: { username }
  })
}

// 暂时没用到退出功能，而是直接vue删除缓存的token做退出
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
