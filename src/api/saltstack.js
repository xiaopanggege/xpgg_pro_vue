import request from '@/utils/request'


// 公共操作
// 获取minion_id列表，穿梭框用到的接口
export function getMinionIdList(query) {
  return request({
    url: '/saltstack/salt-minion/1/',
    method: 'get',
    params: query
  })
}

// saltkey操作
export function getSaltKeyList(query) {
  return request({
    url: '/saltstack/salt-key/',
    method: 'get',
    params: query
  })
}

export function flushSaltKeyList() {
  return request({
    url: '/saltstack/salt-key/',
    method: 'post',
    data:{
      "salt_key_tag": "global_flush_salt_key"
    }
  })
}

export function acceptSaltKey(minion_id) {
  return request({
    url: '/saltstack/salt-key-opt/accept/',
    method: 'post',
    data:{
      "salt_key_tag": "accept_salt_key",
      "minion_id": minion_id
    }
  })
}

export function deleteSaltKey(minion_id) {
  return request({
    url: '/saltstack/salt-key-opt/delete/',
    method: 'post',
    data:{
      "salt_key_tag": "delete_salt_key",
      "minion_id": minion_id
    }
  })
}

export function deleteDeniedSaltKey(minion_id) {
  return request({
    url: '/saltstack/salt-key-opt/del-denied/',
    method: 'post',
    data:{
      "salt_key_tag": "delete_denied_salt_key",
      "minion_id": minion_id
    }
  })
}

export function rejectSaltKey(minion_id) {
  return request({
    url: '/saltstack/salt-key-opt/reject/',
    method: 'post',
    data:{
      "salt_key_tag": "reject_salt_key",
      "minion_id": minion_id
    }
  })
}

export function testSaltKey(minion_id) {
  return request({
    url: '/saltstack/salt-key/'+minion_id+'/',
    method: 'get'
  })
}


// minion管理操作
export function getSaltMinionList(query) {
  return request({
    url: '/saltstack/salt-minion/',
    method: 'get',
    params: query
  })
}

export function updateMinionList() {
  return request({
    url: '/saltstack/salt-minion/',
    method: 'post',
    data:{
      "salt_minion_tag": "global_update_salt_minion_list"
    }
  })
}

export function updateMinionStatus() {
  return request({
    url: '/saltstack/salt-minion-opt/status-update/',
    method: 'post',
    data:{
      "salt_minion_tag": "global_update_salt_minion_status"
    }
  })
}

export function updateMinion(minion_id) {
  return request({
    url: '/saltstack/salt-minion-opt/update/',
    method: 'post',
    data:{
      "salt_minion_tag": "update_salt_minion",
      "minion_id":minion_id
    }
  })
}

// salt命令集管理操作
export function getSaltCmdList(query) {
  return request({
    url: '/saltstack/salt-cmd/',
    method: 'get',
    params: query
  })
}

export function updateSaltCmdList(data) {
  return request({
    url: '/saltstack/salt-cmd/',
    method: 'post',
    data:{
      "salt_cmd_tag": "collection_info",
      "collection_style": data.collection_style,
      "minions": data.minions
    }
  })
}

export function deleteSaltCmd() {
  return request({
    url: '/saltstack/salt-cmd-opt/delete/',
    method: 'post',
    data:{
      "salt_cmd_tag": "salt_cmd_delete"
    }
  })
}

export function getSaltCmdModuleList(type) {
  return request({
    url: '/saltstack/salt-cmd-opt/get-module/',
    method: 'get',
    params: {
      "salt_cmd_type": type
    }
  })
}

export function getSaltCmdCmdList(type, module) {
  return request({
    url: '/saltstack/salt-cmd-opt/get-cmd/',
    method: 'get',
    params: {
      "salt_cmd_type": type,
      "salt_cmd_module": module
    }
  })
}

export function saltExe(data) {
  return request({
    url: '/saltstack/salt-exe/',
    method: 'post',
    data
  })
}

export function saltToolJobSearchStatus(data) {
  return request({
    url: '/saltstack/salt-tool/job-search/status/',
    method: 'post',
    data
  })
}

export function saltToolJobSearchResult(data) {
  return request({
    url: '/saltstack/salt-tool/job-search/result/',
    method: 'post',
    data
  })
}


// 文件服务api
// 获取目录树
export function getFileTree(data) {
  return request({
    url: '/saltstack/file-manage/file-tree/',
    method: 'post',
    data
  })
}

// 获取文件内容
export function getFileContent(data) {
  return request({
    url: '/saltstack/file-manage/file-content/',
    method: 'post',
    data
  })
}

// 更新文件
export function getFileUpdate(data) {
  return request({
    url: '/saltstack/file-manage/file-update/',
    method: 'post',
    data
  })
}

// 创建文件或者文件夹
export function getFileCreate(data) {
  return request({
    url: '/saltstack/file-manage/file-create/',
    method: 'post',
    data
  })
}

// 重命名文件或者文件夹
export function getFileRename(data) {
  return request({
    url: '/saltstack/file-manage/file-rename/',
    method: 'post',
    data
  })
}

// 删除文件或者文件夹
export function getFileDelete(data) {
  return request({
    url: '/saltstack/file-manage/file-delete/',
    method: 'post',
    data
  })
}

// 上传文件
export function getFileUpload(data) {
  return request({
    url: '/saltstack/file-manage/file-upload/',
    method: 'post',
    data
  })
}