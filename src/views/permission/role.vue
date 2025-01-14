<template>
  <div class="app-container">
    
    <div class="filter-container">
      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddRole">新增角色</el-button>
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
      <el-table-column align="header-center" label="描述" min-width="250">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEditUser(scope)">编辑用户</el-button>
          <el-button type="primary" size="mini" @click="handleEdit(scope)">编辑权限</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getRoles" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑权限':'新增角色'" :close-on-press-escape="false" width="800px" :close-on-click-modal="false">
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
        <!-- 取消直接新建角色的时候添加用户，因为当用户太多的时候这个选择框加载变得非常的卡，所以剥离出来单独做用户新增 -->
        <!-- <el-form-item label="用户:" prop="user_list" >
          <el-transfer
            ref="dataTransfer"
            filterable
            filter-placeholder="搜索用户"
            :titles="['用户选择', '已选用户']"
            v-model="temp.user_list"
            :data="user_list"
            target-order='push'>
          </el-transfer>
        </el-form-item> -->
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
        <!-- 权限选择，本来想把菜单和权限关联不过发现没什么好的做法所以只能分开了 -->
        <el-form-item label="权限:" prop="auth_list" class="authTransferClass">
          <el-transfer
            ref="dataTransfer"
            filterable
            filter-placeholder="搜索权限"
            :titles="['权限选择(默认权限不显示)', '已选权限']"
            v-model="temp.auth_list"
            :data="auth_list"
            target-order='push'>
            <span slot-scope="{ option }">
              <el-tooltip class="item" effect="light" :content="option.label" placement="right">
                <span>{{ option.label }}</span>
              </el-tooltip>
            </span>
          </el-transfer>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false;confirmLoading=false">取消</el-button>
        <el-button type="primary" @click="confirmRole" :loading="confirmLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户窗口 -->
    <el-dialog :visible.sync="dialogRoleUserVisible" :title="'角色：' + role.name+' 用户编辑'" width="990px" :close-on-press-escape="false" :close-on-click-modal="false">

        <div class="filter-container">
          <el-row class="saltminion_global">
              <el-button class="filter-item" type="primary" size="small" @click="handleAddRoleUser">新增用户</el-button>
              <el-button class="filter-item" type="danger" size="small" @click="handleMutRoleUserDelete">批量删除</el-button>
            <div style="float:right;">
              <el-select v-model="roleUserListQuery.is_active" clearable style="width: 140px" class="filter-item" placeholder="状态" @change="handleRoleUserFilter">
                <el-option label="启用" value="true"/>
                <el-option label="禁用" value="false"/>
              </el-select>
              <el-input placeholder="用户名称" v-model="roleUserListQuery.username" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleRoleUserFilter"/>
              <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleRoleUserFilter">搜索</el-button>
            </div>        
          </el-row>
        </div>
      <div class="overflow_set">
        <el-table 
          v-loading="listRoleUserLoading" 
          element-loading-text="Loading"
          :data="role_user_list" 
          style="width: 100%;" 
          border
          size='medium'
          fit
          highlight-current-row
          @sort-change="sortRoleUserChange"
          @selection-change="handleRoleUserSelectionChange"
          >
          <el-table-column type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column align="center" prop="id" sortable="custom" label="ID" width="120">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="username" sortable="custom" label="用户名称" width="220">
            <template slot-scope="scope">
              {{ scope.row.username }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="is_active" sortable="custom" label="用户状态" width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.is_active === true" class="status_success">启用</span>
              <span v-else class="status_error">禁用</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="100">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="handleRoleUserDelete(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="role_user_total>0" :total="role_user_total" :page.sync="roleUserListQuery.page" :page_size.sync="roleUserListQuery.page_size" @pagination="getRoleUsers" />
      </div>    
      <div style="text-align:right;">
        <el-button type="info" @click="dialogRoleUserVisible=false">关闭</el-button>
      </div>

      
      <!-- 嵌套新增用户 -->
      <el-dialog
        width="990px"
        title="新增用户(可重复添加但无效)"
        :visible.sync="dialogUserVisible"
        :close-on-press-escape="false" :close-on-click-modal="false"
        append-to-body>
        <div class="filter-container">
          <el-row class="saltminion_global">
            <el-button class="filter-item" type="primary" size="small" @click="handleMutUserAdd">批量添加</el-button>
            <div style="float:right;">
              <el-select v-model="userListQuery.is_active" clearable style="width: 140px" class="filter-item" placeholder="状态" @change="handleUserFilter">
                <el-option label="启用" value="true"/>
                <el-option label="禁用" value="false"/>
              </el-select>
              <el-input placeholder="用户名称" v-model="userListQuery.search" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleUserFilter"/>
              <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleUserFilter">搜索</el-button>
            </div>        
          </el-row>
        </div>
        <div class="overflow_set_sub">
          <el-table 
            v-loading="listUserLoading" 
            element-loading-text="Loading"
            :data="user_list" 
            style="width: 100%;" 
            border
            size='medium'
            fit
            highlight-current-row
            @sort-change="sortUserChange"
            @selection-change="handleUserSelectionChange"
            >
            <el-table-column type="selection" align="center" width="55">
            </el-table-column>
            <el-table-column align="center" prop="id" sortable="custom" label="ID" width="120">
              <template slot-scope="scope">
                {{ scope.row.id }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="username" sortable="custom" label="用户名称" width="220">
              <template slot-scope="scope">
                {{ scope.row.username }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="is_active" sortable="custom" label="用户状态" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.is_active === true" style="color: #40c984;">启用</span>
                <span v-else  style="color: #f4516c;">禁用</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="100">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="handleAddUser(scope)">加入</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="user_total>0" :total="user_total" :page.sync="userListQuery.page" :page_size.sync="userListQuery.page_size" @pagination="getUserList" />
        </div>    
        <div style="text-align:right;">
          <el-button type="info" @click="dialogUserVisible=false">关闭</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination'
import { getRoutes, getRoles, addRole, deleteRole, updateRole, getRoleUsers, getUserList, addRoleUser, deleteRoleUser, getViewApiAll } from '@/api/role'
import { Message } from 'element-ui'
import waves from '@/directive/waves' // Waves directive

const defaultRole = {
  id: '',
  name: '',
  description: '',
  routes: [],
  view_api: []
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
      dialogUserVisible: false,
      dialogRoleUserVisible: false,
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
      listUserLoading: false,
      listRoleUserLoading: false,
      user_list: [],
      auth_list: [],
      role_user_list: [],
      multipleRoleUserSelection: [],
      multipleUserSelection:[],
      temp: { auth_list:[], role:'' },
      total: 0,
      user_total: 0,
      role_user_total: 0,
      listQuery:{
        page: 1,
        page_size: 10,
        id: '',
        name:'',
        ordering: ''
      },
      userListQuery:{
        page: 1,
        page_size: 10,
        id: '',
        username:'',
        ordering: ''
      },
      roleUserListQuery:{
        page: 1,
        page_size: 10,
        role_id: '',
        username:'',
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
    this.getAuthList()
    // this.getUserList()
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
    // async await 和try catch连用才是标准写法
    async getUserList() {
      try {
        this.listUserLoading = true
        const res = await getUserList(this.userListQuery)
        this.user_list = res.data.results
        this.user_total = res.data.count
        this.listUserLoading = false
      }catch(err) {
        this.listUserLoading = false
        Message.error(err)
      }
    },

    // 获取view-api权限表
    async getAuthList() {
      try {
        this.listUserLoading = true
        // 获取所有api，因为表不大，如果后面很大那后端查询返回的字段做下精简
        const res = await getViewApiAll()
        const api_list = res.data
        api_list.forEach((data, index) => {
          if(!data.default_allow){
            this.auth_list.push({
              label: data.name,
              key: data.id
            });
          }
          
        });
        this.listLoading = false
      }catch(err) {
        this.listLoading = false
        Message.error(err)
      }
    },

    async getRoleUsers() {
      try {
        this.listRoleUserLoading = true
        const res = await getRoleUsers(this.roleUserListQuery)
        this.role_user_list = res.data.results
        this.role_user_total = res.data.count
        this.listRoleUserLoading = false
      }catch(err) {
        this.listRoleUserLoading = false
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
      this.temp.auth_list = []
      this.dialogVisible = true
      this.$nextTick(()=>{
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['roleForm'].resetFields()
        this.$refs['role_name_focus'].focus()
      })
    },

    // 打开编辑用户窗口
    async handleAddRoleUser() {
      
      this.dialogUserVisible = true
      this.$nextTick(()=>{
      //   this.$refs.dataTransfer.clearQuery("left")
      // 　this.$refs.dataTransfer.clearQuery("right")
        // this.$refs['roleForm'].resetFields()
        // this.$refs['role_name_focus'].focus()
        this.userListQuery = {
        page: 1,
        page_size: 10,
        id: '',
        username:'',
        ordering: ''
      }
        this.getUserList()
      })
    },

    // 打开编辑权限窗口
    async handleEdit(scope) {
      this.dialogType = 'edit'
      this.temp.auth_list = scope.row.view_api
      this.dialogVisible = true
      this.checkStrictly = true
      
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

    // 打开新增用户窗口
    async handleEditUser(scope) {
      this.dialogRoleUserVisible = true
      // this.temp.user_list = scope.row.user_list
      
      this.$nextTick(() => {
      //   this.$refs.dataTransfer.clearQuery("left")
      // 　this.$refs.dataTransfer.clearQuery("right")
        // this.$refs['roleForm'].resetFields()
        this.roleUserListQuery={
          page: 1,
          page_size: 10,
          role_id: '',
          username:'',
          ordering: ''
        },
        this.role = deepClone(scope.row)
        this.roleUserListQuery.role_id = this.role.id
        this.getRoleUsers()
      })
    },

    // 删除角色
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
    // 删除用户
    handleRoleUserDelete({ $index, row }) {
      this.$confirm('确认要删除该用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          this.listRoleUserLoading = true
          const temp_dict = {
            'role_id': this.role.id,
            'user_list': [row.id,]
          }
          const res = await deleteRoleUser(this.role.id,temp_dict)
          if(res.data.status){
            this.role_user_list.splice($index, 1)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }else{
            this.$message({
              type: 'error',
              message: '删除失败!'
            })
            // let result_data = res.data.results
            // console.log(JSON.stringify(result_data));
          }
          this.listRoleUserLoading = false
        }catch(err) {
          this.listRoleUserLoading = false
          Message.error(err)
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消'
        });       
      });
    },

    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleRoleUserSelectionChange(val) {
      this.multipleRoleUserSelection = val;
    },
    // 批量删除用户
    handleMutRoleUserDelete(){
      if(this.multipleRoleUserSelection.length === 0){
        Message.error('未选择任何用户，请选择后重试')
      }
      else{
        this.$confirm('确认要删除选中用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
        }).then(async() => {
          try {
            const user_list = []
            for(var row of this.multipleRoleUserSelection){
              user_list.push(row.id)
            };
            this.listRoleUserLoading = true
            const temp_dict = {
              'role_id': this.role.id,
              'user_list': user_list
            }
            const res = await deleteRoleUser(this.role.id,temp_dict)
            if(res.data.status){
              this.getRoleUsers()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }else{
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
              // let result_data = res.data.results
              // console.log(JSON.stringify(result_data));
            }
            this.listRoleUserLoading = false
          }catch(err) {
            this.listRoleUserLoading = false
            Message.error(err)
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消'
          });       
        });
      }
    },
    // 添加用户
    handleAddUser({ $index, row }) {
      this.$confirm('确认要添加该用户?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async() => {
        try {
          this.listUserLoading = true
          const temp_dict = {
            'role_id': this.role.id,
            'user_list': [row.id,]
          }
          const res = await addRoleUser(temp_dict)
          if(res.data.status){
            this.user_list.splice($index, 1)
            this.$message({
              type: 'success',
              message: '加入成功!'
            })
            this.getRoleUsers()
          }else{
            this.$message({
              type: 'error',
              message: '加入失败!'
            })
            // let result_data = res.data.results
            // console.log(JSON.stringify(result_data));
          }
          
          this.listUserLoading = false

          }catch(err) {
            this.listUserLoading = false
            Message.error(err)
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消'
          });       
      });
    },

    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleUserSelectionChange(val) {
      this.multipleUserSelection = val;
    },
    // 批量添加用户
    handleMutUserAdd(){
      if(this.multipleUserSelection.length === 0){
        Message.error('未选择任何用户，请选择后重试')
      }
      else{
        this.$confirm('确认要添加选中用户?', '信息', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
        }).then(async() => {
          try {
            const user_list = []
            for(var row of this.multipleUserSelection){
              user_list.push(row.id)
            }
            this.listUserLoading = true
            const temp_dict = {
              'role_id': this.role.id,
              'user_list': user_list
            }
            const res = await addRoleUser(temp_dict)
            if(res.data.status){
              this.getRoleUsers()
              this.$message({
                type: 'success',
                message: '添加成功!'
              })
            }else{
              this.$message({
                type: 'error',
                message: '添加失败!'
              })
              // let result_data = res.data.results
              // console.log(JSON.stringify(result_data));
            }
            this.listUserLoading = false
          }catch(err) {
            this.listUserLoading = false
            Message.error(err)
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消'
          });       
        });
      }
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
    // 新增和编辑权限确认提交
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
              post_data.view_api = this.temp.auth_list
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
              post_data.view_api = this.temp.auth_list
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

    // 用户搜索框操作
    handleUserFilter() {
      this.userListQuery.page = 1
      this.getUserList()
    },

    // 用户排序
    sortUserChange(data) {
      const { prop, order } = data
      if (prop === 'username') {
        if (order === 'ascending') {
          this.userListQuery.ordering = 'nausernameme'
        } else {
          this.userListQuery.ordering = '-username'
        }
      }else if (prop === 'id') {
        if (order === 'ascending') {
          this.userListQuery.ordering = 'id'
        } else {
          this.userListQuery.ordering = '-id'
        }
      }else if (prop === 'is_active') {
        if (order === 'ascending') {
          this.userListQuery.ordering = 'is_active'
        } else {
          this.userListQuery.ordering = '-is_active'
        }
      }
      this.handleUserFilter()
    },
    // 角色包含用户搜索框操作
    handleRoleUserFilter() {
      this.roleUserListQuery.page = 1
      this.getRoleUsers()
    },

    // 角色包含用户排序
    sortRoleUserChange(data) {
      const { prop, order } = data
      if (prop === 'username') {
        if (order === 'ascending') {
          this.roleUserListQuery.ordering = 'username'
        } else {
          this.roleUserListQuery.ordering = '-username'
        }
      }else if (prop === 'id') {
        if (order === 'ascending') {
          this.roleUserListQuery.ordering = 'id'
        } else {
          this.roleUserListQuery.ordering = '-id'
        }
      }else if (prop === 'is_active') {
        if (order === 'ascending') {
          this.roleUserListQuery.ordering = 'is_active'
        } else {
          this.roleUserListQuery.ordering = '-is_active'
        }
      }
      this.handleRoleUserFilter()
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
  .overflow_set{
    max-height: 745px;
    overflow: auto;
    .status_success {
      color: #40c984;
    }
    .status_error {
      color: #f4516c;
    }
  
  }
  .overflow_set_sub{
    max-height: 745px;
    overflow: auto;
  
  }

  // 穿梭框高度调整，
  .authTransferClass /deep/ .el-transfer{
    .el-transfer-panel{
      width: 270px;
    }
    .el-transfer-panel__body{
      height: 214px;
      .el-transfer-panel__list{
        height: 146px;
      }
    }
  }
}
</style>
