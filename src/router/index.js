import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   这个是定义是否显示在侧边栏的，默认false显示，比如login登录页显示个屁在侧边栏，当然要改成true拉，其他也是按需
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 *                                说简单点就是一个菜单有子菜单的时候，显示在侧边栏最上面那一层的菜单即路由
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 * 
 * 路由设置页面，说几点容易忘记的，第一点除了一些登录页面404页面以外，大部分页面都是在Layout这个框里的，所以第一级父菜单的组件都是Layout
 * 然后如果这一级的父菜单下面只有一个子菜单的话，如果没有设置参数alwaysShow: true那会直接把子菜单显示在页面左侧菜单中，就比如下面的form菜单
 */

//  这个是静态路由菜单，不需要在后台配置
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },

  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        // affix控制首页是否永久停留在多页面的标题上面不会被关闭
        meta: { title: '首页', icon: 'dashboard', noCache: true, affix: true }
      }
    ]
  }

]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
// 动态菜单，在后台也要配置，才能给非超级管理员以外的人员使用，超级管理员是直接使用下面的不需要调用后台
export const asyncRoutes = [

  // 因为form父菜单没有设置alwaysShow: true并且子菜单只有一个，所以会直接展示子菜单
  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'form', icon: 'form' }
  //     }
  //   ]
  // },

  {
    path: '/saltstack',
    component: Layout,
    redirect: '/saltstack/minion-table',
    name: 'Saltstack',
    meta: {
      title: 'Saltstack',
      icon: 'saltstack'
    },
    children: [
      {
        path: 'minion-table',
        component: () => import('@/views/saltstack/MinionTable'),
        name: 'SaltMinionTable',
        meta: { title: 'Minion管理', icon: 'submenu' }
      },
      {
        path: 'saltkey-table',
        component: () => import('@/views/saltstack/SaltKeyTable'),
        name: 'SaltKeyTable',
        meta: { title: 'SaltKey管理', icon: 'submenu' }
      },
      {
        path: 'saltcmd-table',
        component: () => import('@/views/saltstack/SaltCmdTable'),
        name: 'SaltCmdTable',
        meta: { title: 'Salt命令集', icon: 'submenu' }
      },
      {
        path: 'saltexe',
        component: () => import('@/views/saltstack/SaltExe'),
        name: 'SaltExe',
        meta: { title: 'Salt命令执行', icon: 'submenu' }
      },
      {
        path: 'saltool',
        component: () => import('@/views/saltstack/SaltTool'),
        name: 'SaltTool',
        meta: { title: 'Salt快捷工具', icon: 'submenu' }
      },
      {
        path: 'fileserver',
        component: () => import('@/views/saltstack/FileServer'),
        name: 'FileServer',
        meta: { title: '文件服务', icon: 'submenu' }
      },
    ]
  },

  {
    path: '/release',
    component: Layout,
    redirect: '/release/release-table',
    name: 'Release',
    meta: {
      title: '发布系统',
      icon: 'release'
    },
    children: [
      {
        path: 'release-table',
        component: () => import('@/views/release/ReleaseTable'),
        name: 'ReleaseTable',
        meta: { title: '应用发布', icon: 'submenu' }
      },
      {
        path: 'releasegroup-table',
        component: () => import('@/views/release/ReleaseGroupTable'),
        name: 'ReleaseGroupTable',
        meta: { title: '应用发布组', icon: 'submenu' }
      },
      {
        // 这个是动态路由的路径参数以冒号开头，使用方法不难先看下上面应用发布组的成员发布页按钮，然后看下面成员发布methods最前面2条，一看就懂
        // 注意也要看下created里获取从上面应用发布组传递过来参数的接收方法等
        path: 'releasemember-table/:id/:app_group_name',
        component: () => import('@/views/release/ReleaseGroupMemberTable'),
        name: 'ReleaseGroupMemberTable',
        meta: { title: '组成员发布', activeMenu: '/release/releasegroup-table'},
        hidden: true
      },
      {
        path: 'releaseauth-table',
        component: () => import('@/views/release/ReleaseAuthTable'),
        name: 'ReleaseAuthTable',
        meta: { title: '应用授权', icon: 'submenu' }
      },
    ]
  },

  // 任务调度
  {
    path: '/task',
    component: Layout,
    redirect: '/task/task-table',
    name: 'Task',
    meta: {
      title: '任务调度',
      icon: 'crontab'
    },
    children: [
      {
        path: 'task-table',
        component: () => import('@/views/task/TaskTable'),
        name: 'TaskTable',
        meta: { title: '任务列表', icon: 'submenu' }
      },
      {
        path: 'task-log',
        component: () => import('@/views/task/TaskLog'),
        name: 'TaskLog',
        meta: { title: '任务日志', icon: 'submenu' }
      },
      // 路由嵌套 多级子菜单写法参考下面这里
      {
        path: 'task-time',
        redirect: '/task/task-time/task-clocked',
        // 注意这个index必须有，他是作为多级菜单父级的一个容器div里包含route-view用的，另外我不想别人访问这个容器页面所以上一条设置了重定向
        // 当然你想显示也可以，不过就一个空壳
        component: () => import('@/views/task/TaskTime/index'),
        name: 'TaskTime',
        meta: { title: '任务时间', icon: 'submenu' },
        children: [
          {
            path: 'task-clocked',
            component: () => import('@/views/task/TaskTime/TaskClocked'),
            name: 'TaskClocked',
            meta: { title: 'Clocked', icon: 'submenu' }
          },
          {
            path: 'task-crontab',
            component: () => import('@/views/task/TaskTime/TaskCrontab'),
            name: 'TaskCrontab',
            meta: { title: 'Crontabs', icon: 'submenu' }
          },
          {
            path: 'task-interval',
            component: () => import('@/views/task/TaskTime/TaskInterval'),
            name: 'TaskInterval',
            meta: { title: 'Intervals', icon: 'submenu' }
          },
        ]
      },
    ]
  },

  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '授权管理',
      icon: 'lock',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: '角色权限',
          roles: ['admin'], icon: 'submenu'
          
        }
      }
    ]
  },

  // 系统管理
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    alwaysShow: true, // will always show the root menu
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'setting',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/UserControl'),
        name: 'UserControl',
        meta: {
          title: '用户管理',
          roles: ['admin'], icon: 'submenu'
        }
      }
    ]
  },


// 外链
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/xiaopanggege/xpgg_pro',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support,默认是网址栏那边有#的，加了这个就没了，不过要后端服务器支持，就nginx要配置，我还没上nginx是正常的哈
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
