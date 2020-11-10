<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-row class="saltminion_global">
          <el-button type="primary" size="small" @click="handleAddRole">新增角色</el-button>
        <div style="float:right;">
          <el-input placeholder="角色名称" v-model="listQuery.name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        </div>        
      </el-row>
    </div>

    <el-table 
      v-loading="listLoading" 
      element-loading-text="Loading"
      :data="rolesList" 
      style="width: 100%;" 
      border
      size='medium'
      fit
      highlight-current-row
      @sort-change="sortChange"
      >
      <!-- 我不需要显示id -->
      <el-table-column align="center" prop="id" sortable="custom" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="name" sortable="custom" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述" width="450">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit(scope)">编辑权限</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getRoles" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑权限':'新增角色'">
      <el-form ref="roleForm" :model="role" :rules="rules" label-width="80px" label-position="left">
        <el-form-item label="角色名" prop="name" :error="name_error">
          <el-input v-model="role.name" placeholder="角色名" ref="role_name_focus" style="width:240px;"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="用户:" prop="user_list" >
          <el-transfer
            ref="dataTransfer"
            filterable
            filter-placeholder="搜索用户"
            :titles="['用户选择', '已选用户']"
            v-model="temp.user_list"
            :data="user_list"
            target-order='push'>
          </el-transfer>
        </el-form-item>
        <el-form-item label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false;confirmLoading=false">取消</el-button>
        <el-button type="primary" @click="confirmRole" :loading="confirmLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination'
import { getRoutes, getRoles, addRole, deleteRole, updateRole, getUsers } from '@/api/role'
import { Message } from 'element-ui'
import waves from '@/directive/waves' // Waves directive

const defaultRole = {
  id: '',
  name: '',
  description: '',
  routes: []
}

export default {
  name: 'RolePermission',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      routes_id: [],
      rules: {
        name: {required: true, message: '请输入角色名称', trigger: 'blur'},
      },
      name_error: '',
      listLoading: false,
      dialogUsersVisible: false,
      user_list: [],
      temp: { user_list:[], role:'' },
      total: 0,
      listQuery:{
        page: 1,
        page_size: 10,
        id: '',
        name:'',
        ordering: ''
      },
      confirmLoading: false,
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getRoutes()
    this.getRoles()
    this.getUsers()
  },
  methods: {
    async getRoutes() {
      this.listLoading = true
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data)
      this.listLoading = false
    },
    async getRoles() {
      this.listLoading = true
      const res = await getRoles(this.listQuery)
      this.rolesList = res.data.results
      this.total = res.data.count
      this.listLoading = false
    },
    async getUsers() {
      try {
        const res = await getUsers()
        const user_list = res.data;
        user_list.forEach((data, index) => {
        this.user_list.push({
          label: data.username,
          key: data.id
          });
        })
      }catch(err) {
        Message.error(err)
      }
    },

    // 重新调整路由结构，使其看起来与边栏相同
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { route.meta.title = route.meta.title + ' (不显示在侧边栏)' }
          
        //  if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title

        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    async handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.temp.user_list = []
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['roleForm'].resetFields()
        this.$refs['role_name_focus'].focus()
      })
    },
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.temp.user_list = scope.row.user_list
      
      this.$nextTick(() => {
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['roleForm'].resetFields()
        this.role = deepClone(scope.row)
        const routes = this.generateRoutes(this.role.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认要删除该角色?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
          this.listLoading = true
          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.listLoading = false
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消'
          });       
      });
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
          // 额外对route id进行赋值，因为源代码返回内容太复杂不适合后端处理所以加了这个返回路由的id方便处理
          this.routes_id.push(route.id)
        }
      }
      return res
    },
    // 新增和编辑确认提交
    confirmRole() {
      this.$refs['roleForm'].validate((valid) => {
        if(valid){
            const isEdit = this.dialogType === 'edit'
            const checkedKeys = this.$refs.tree.getCheckedKeys()
            // 表单提交之前重置一下自定义错误，不然只有第一次提交会提示错误，后面都不会
            this.name_error = ''

            // 初始化id列表，然后下面对他进行赋值
            this.routes_id = []
            this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)
            if (isEdit) {
              const post_data = deepClone(this.role)
              post_data.routes = this.routes_id
              post_data.user_list = this.temp.user_list
              this.confirmLoading = true
              updateRole(this.role.id, post_data).then(response =>{
                this.confirmLoading = false
                if(response.data.status){
                  this.dialogVisible = false
                  Message.success(response.data.results)
                  this.getRoles()
                }else{
                  let result_data = response.data.results
                  // console.log(JSON.stringify(result_data));
                  if(Object.prototype.toString.call(result_data) === '[object Object]'){
                    for (let k in result_data){
                      this[`${k}_error`] = result_data[k][0]
                    }
                  }else{
                    Message.error(JSON.stringify(result_data))
                  }
                }
              })
            } else {
              const post_data = deepClone(this.role)
              post_data.routes = this.routes_id
              post_data.user_list = this.temp.user_list
              this.confirmLoading = true
              addRole(post_data).then(response =>{
                this.confirmLoading = false
                const data = response.data
                if(data.status){
                  this.dialogVisible = false
                  Message.success(data.results)
                  this.getRoles()
                }else{
                  let result_data = data.results
                  // console.log(JSON.stringify(result_data));
                  if(Object.prototype.toString.call(result_data) === '[object Object]'){
                    for (let k in result_data){
                      this[`${k}_error`] = result_data[k][0]
                    }
                  }else{
                    Message.error(JSON.stringify(result_data))
                  }
                }
              })
          }
        } else{
          return false
        }
      })
      
        
        
      
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    },

    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getRoles()
    },

    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'name') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'name'
        } else {
          this.listQuery.ordering = '-name'
        }
      }else if (prop === 'id') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'id'
        } else {
          this.listQuery.ordering = '-id'
        }
      }
      this.handleFilter()
    },
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
