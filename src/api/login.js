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
    url: '/personal/1/',
    method: 'get'
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


// cas单点登录验证（登录的话是post方法，get方法是验证）
export function casLogin(ticket, next) {
  return request({
    url: '/cas-login/',
    method: 'get',
    params: { next, ticket }
  });
}

// cas单点登录退出，没用上，cas服务端不支持跨域退出，只能直接访问cas的登出页面
// export function casLogout() {
//   return request({
//     url: '/cas-logout/',
//     method: 'get'
//   });
// }