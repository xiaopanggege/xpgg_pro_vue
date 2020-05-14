import { asyncRoutes, constantRoutes } from '@/router'
import { routerMap } from '@/router/routerMap' //我自己新增的动态路由component的映射关系
import { getRoutes } from '@/api/role'
import { deepClone } from '@/utils'


/**
 * 通过meta.role判断是否与当前用户权限匹配
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */

//  这个是判断是route是否有meta.roles属性，如果有看有没有和传递进来的roles匹配，匹配就返回真，
// 如果最终都没有匹配就返回假，如果没有meta.roles属性则说明这个路由不需要权限控制直接为真运行访问
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      // 如果有嵌套路由则递归再判断
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

 // 获取后端动态菜单
 export function  GetRoutes() {
  return new Promise((resolve, reject) => {
    getRoutes().then(response => {
      const data = response.data
      resolve(data)
    }).catch(error => {
      reject(error)
    })
  })
}
// 生成映射好的动态菜单
export function mapRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.children) {
      route.children = mapRoutes(route.children)
    }
    if(route.component){
      route.component = routerMap[route.component]
    }
    
    res.push(route)
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 在src目录同层的permission.js中调用这个方法来获取路由动态添加
  generateRoutes({ commit }, data) {
    return new Promise(resolve => {
      let accessedRoutes
      // 判断是否为超级用户，如果是直接采用前端定义好的所有菜单，而不需要去后端获取角色菜单列表
      if (data.is_superuser) {
        accessedRoutes = asyncRoutes || []
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      } else {
        getRoutes().then(response => {
          let serviceRoutes = deepClone(response.data)
          serviceRoutes = mapRoutes(serviceRoutes)
          // 404页面按照这个框架的要求要放到整个路由的最后，所以手动在这里添加
          serviceRoutes.push({ path: '*', redirect: '/404', hidden: true })
          accessedRoutes = filterAsyncRoutes(serviceRoutes, data.roles)
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
      }
      // commit('SET_ROUTES', accessedRoutes)
      // resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
