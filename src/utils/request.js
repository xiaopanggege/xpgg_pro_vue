import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: false // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// 阻止token失效后多次弹窗问题
var CancelToken = axios.CancelToken;
var source = CancelToken.source();

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent store.getters.token

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = `Bearer ${getToken()}` // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 全局添加cancelToken，为了token失效遇到多次请求多次弹窗使用
    config.cancelToken = source.token
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    console.log('请求发起出错了') // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */
  // 在使用mockjs的时候因为没有指定code等属性所以不能用下面的拦截器，所以直接response => response，以后如果是真的api接口可以开起来按规则来写
  // response => response,

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // 正常返回情况下response.data里可能没有status_code字段，只有在出现异常时候我后端一定会返回status_code，因为是异常所以status_code肯定不为200
    // msg是我后端定义的返回错误信息的字段
    if (res.status_code && res.status_code !== 200) {
      

      // 针对以下常见的错误码做处理
      if (res.status_code === 401) {
        // 取消其他请求操作
        source.cancel()
        // to re-login
        MessageBox.confirm('登录超时, 你可以取消并停留在当前页, 或者重新登录', '确认退出', {
          confirmButtonText: '重登',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        }).catch(() => {
                    
        })
      }
      else if(res.status_code === 400){
        Message({
          message: '用户名密码错误',
          type: 'warning',
          duration: 5 * 1000
        })
      }
      else{
        Message({
          message: res.msg || 'error',
          type: 'error',
          center: true,
          duration: 5 * 1000
        })
      }
      return Promise.reject(res.msg || 'error')
    } else {
      return response
    }
  },
  error => {
    if (axios.isCancel(error)) { // 取消请求的情况下，终端Promise调用链
        return new Promise(() => {});
    } else {
      console.log('err' + error) // for debug
      console.log('错误定位') // for debug
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error);
    }
  }
)

export default service
