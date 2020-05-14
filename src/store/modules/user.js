import { login, logout, getInfo } from '@/api/login'
import { getRoutes } from '@/api/role'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: [],
  is_superuser: false
}

const mutations = {
  // 其实这个store里的token没有用，因为用了js-cookie来存取token了实际上
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_SUPERUSER: (state, is_superuser) => {
    state.is_superuser = is_superuser
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const username = userInfo.username.trim()
    return new Promise((resolve, reject) => {
      login(username, userInfo.password).then(response => {
        const data = response.data
        commit('SET_TOKEN', data.access)
        commit('SET_NAME', username)
        setToken(response.data.access)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const data = response.data

        if (!data) {
          reject('验证失败请重新登陆.')
        }
        let { roles, username, avatar, is_superuser } = data

        // 判断用户的角色如果为空列表就报错，初始时候django只有一个超级用户，所以加个判断如果是超级用户则赋予admin角色
        // 这里注意了，设置角色为superman是为了在src/permission.js里hasRoles的判断值为true使用，防止role为空判断失败
        // 并且superman可以改成任意名称，即使和授权页面的角色名称一致也不影响，因为在获取动态菜单的代码src/store/modules/permission.js里generateRoutes方法做了django用户是否是is_superuser的判断
        if (is_superuser){
          roles = [ 'superman' ]
          data.roles = [ 'superman' ]
        }else if (!roles || roles.length <= 0) {
          reject('账户未授权，无法获取可访问的页面菜单，请联系管理员进行角色授权.')
        }
        

        commit('SET_ROLES', roles)
        commit('SET_NAME', username)
        // 这个头像地址正常在生产环境用nginx的时候，会指定静态文件路径，到时候可能替换
        commit('SET_AVATAR', avatar)
        commit('SET_SUPERUSER', is_superuser)
        resolve(data)
      }).catch(error => {
        console.log('获取用户信息失败');
        console.log(error);
        // reject(error)
      })
    })
  },


  // 前端退出登录
  logout({ commit }) {
    return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_AVATAR', '')
        commit('SET_SUPERUSER', false)
        removeToken()
        resetRouter()
        resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_AVATAR', '')
      commit('SET_SUPERUSER', false)
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

