import router from './router'
import store from './store'
import { Message, MessageBox } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, getCas } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Cookies from 'js-cookie'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // 不需要重定向的白名单 whitelist

// 这里的router是router目录下index里面export的router变量实际上是默认路由constantRoutes的内容，然后通过下面的逻辑添加动态路由部分
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断一下store是否存储了roles角色，并且角色是否为空
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 下面是动态获取路由表的过程
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          // 从store的user/getInfo里获取到用户的角色和是否是超级管理员信息
          const { roles, is_superuser } = await store.dispatch('user/getInfo')
          // generate accessible routes map based on roles
          // 从store的permission/generateRoutes方法里获取到对应的路由表
          const accessRoutes = await store.dispatch('permission/generateRoutes', {roles, is_superuser})
          // 动态添加到路由表
          router.addRoutes(accessRoutes)
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 判断是否有cas的ticket
    const hasCas = getCas()
    // 留一个直接访问login页面方通接口给
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    }
    // 判断如果有ticket就跳转
    else if (hasCas){
      const ukey = hasCas
      store.dispatch('user/casLogin', {ukey, path: to.query.next}).then((next_page) => {
        if (next_page) {
          next({ path: next_page });
        } else {
          // 如果没有 next_page，处理默认跳转逻辑
          next({ path: '/' }); // 或者其他默认路径
        }
        NProgress.done()
      }).catch((error) => {
        console.log(error)
      })
      
    }
    else{
      Message.warning('登录超时请重新登录')
      // 跳转到登陆页
      next(`/login?redirect=${to.path}`)
      // 跳转到cas单点登录,现在不跳了，作为第三方登录显示在默认登录页面上了，需要的时候就手动点击哈
      // window.location.href = `https://sid.ruijie.com.cn/login?service=http://yfxpgg.ruijie.com.cn/cas-login/?next=${this.redirect || '/dashboard'}`
      NProgress.done()
    }
    

    
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
