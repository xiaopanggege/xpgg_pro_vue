// 因为从后端获取菜单的时候参数：路由地址和组件地址，写法是普通的/views/tree/index，而到了vue必须是()=>import('@/views/tree/index')
// 所以获取到后端的菜单列表后，把它们的路由地址和组件地址作为key和下面的对照换成相应的value
// 注意每一个后端出现的组件都要写哦，别漏了
export const routerMap={
  // login:require('login/index').default, // 同步的方式
  '/layout/Layout':()=>import('@/layout/index'),      // 异步的方式
  '/views/saltstack/MinionTable':()=>import('@/views/saltstack/MinionTable'),
  '/views/saltstack/SaltKeyTable':()=>import('@/views/saltstack/SaltKeyTable'),
  '/views/saltstack/SaltCmdTable':()=>import('@/views/saltstack/SaltCmdTable'),
  '/views/saltstack/SaltExe':()=>import('@/views/saltstack/SaltExe'),
  '/views/saltstack/SaltTool':()=>import('@/views/saltstack/SaltTool'),
  '/views/saltstack/FileServer':()=>import('@/views/saltstack/FileServer'),
  '/views/release/ReleaseTable':()=>import('@/views/release/ReleaseTable'),
  '/views/release/ReleaseGroupTable':()=>import('@/views/release/ReleaseGroupTable'),
  '/views/release/ReleaseGroupMemberTable':()=>import('@/views/release/ReleaseGroupMemberTable'),
  '/views/release/ReleaseAuthTable':()=>import('@/views/release/ReleaseAuthTable'),
  '/views/task/TaskTable':()=>import('@/views/task/TaskTable'),
  '/views/task/TaskLog':()=>import('@/views/task/TaskLog'),
  '/views/task/TaskTime/index':()=>import('@/views/task/TaskTime/index'),
  '/views/task/TaskTime/TaskClocked':()=>import('@/views/task/TaskTime/TaskClocked'),
  '/views/task/TaskTime/TaskCrontab':()=>import('@/views/task/TaskTime/TaskCrontab'),
  '/views/task/TaskTime/TaskInterval':()=>import('@/views/task/TaskTime/TaskInterval'),
  '/views/permission/role':()=>import('@/views/permission/role'),
  '/views/system/UserInfo':()=>import('@/views/system/UserInfo'),
  '/views/system/UserControl':()=>import('@/views/system/UserControl'),
  // '':()=>import('@'),
 }

 