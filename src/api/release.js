import request from '@/utils/request'



export function releaseAdd(data) {
  return request({
    url: '/release/release-base/',
    method: 'post',
    data
  })
}

export function releaseGetList(query) {
  return request({
    url: '/release/release-base/',
    method: 'get',
    params: query
  })
}

export function releaseUpdate(data) {
  return request({
    url: `/release/release-base/${data.id}/`,
    method: 'patch',
    data
  })
}

export function releaseOpt(data) {
  return request({
    url: '/release/release-opt/',
    method: 'post',
    data
  })
}

export function releaseDel(data) {
  return request({
    url: '/release/release-del/',
    method: 'post',
    data
  })
}


export function releaseLog(query) {
  return request({
    url: '/release/release-log/',
    method: 'get',
    params: query
  })
}

// 单独获取应用id 和app_name字段列表
export function releaseGetAppList() {
  return request({
    url: '/release/release-base/1/',
    method: 'get'
  })
}
// 单独获取应用组id 和app_group_name字段列表
export function releaseGetAppGroupList() {
  return request({
    url: '/release-group/1/',
    method: 'get'
  })
}


// 应用发布组api
export function releaseGroupAdd(data) {
  return request({
    url: '/release-group/',
    method: 'post',
    data
  })
}

export function releaseGroupGetList(query) {
  return request({
    url: '/release-group/',
    method: 'get',
    params: query
  })
}

export function releaseGroupUpdate(data) {
  return request({
    url: `/release-group/${data.id}/`,
    method: 'patch',
    data
  })
}


export function releaseGroupDel(id) {
  return request({
    url: `/release-group/${id}/`,
    method: 'delete',
  })
}

// 组成员列表获取
export function releaseGroupMemberGetList(query) {
  return request({
    url: '/release-member/',
    method: 'get',
    params: query
  })
}


// 应用授权列表获取
export function releaseAuthGetList(query) {
  return request({
    url: '/release-auth/',
    method: 'get',
    params: query
  })
}

// 应用授权 单独获取不存在与应用授权的用户ID username字段列表
export function releaseAuthIdNameList() {
  return request({
    url: '/release-auth/1/',
    method: 'get'
  })
}

// 新增授权用户
export function releaseAuthAdd(data) {
  return request({
    url: '/release-auth/',
    method: 'post',
    data
  })
}

export function releaseAuthUpdate(data) {
  return request({
    url: `/release-auth/${data.id}/`,
    method: 'patch',
    data
  })
}


export function releaseAuthDel(id) {
  return request({
    url: `/release-auth/${id}/`,
    method: 'delete',
  })
}