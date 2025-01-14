import request from '@/utils/request'
// OP工具集接口

// 新增用户
export function szxAdd(data) {
  return request({
    url: '/ruijie_telnet/szx-add/',
    method: 'post',
    data
  })
}
