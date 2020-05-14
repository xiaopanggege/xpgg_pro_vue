<template>
  <div class="app-container">
    <div class="filter-container">

      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddUserDailog">添加用户</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="init" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-input placeholder="应用名称" v-model="listQuery.app_name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="应用组成员" v-model="listQuery.app_group_name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        </div>        
      </el-row>
    </div>

    <el-table
      v-loading="listLoading"
      element-loading-text="Loading"
      :key="tableKey"
      :data="data_list"
      size='medium'
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      class="group_table">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="用户" prop="username" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="应用权限"   align="center" min-width="300">
        <template slot-scope="scope">
          <span>{{ scope.row.app_name }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="应用组权限"   align="center" min-width="300">
        <template slot-scope="scope">
          <span>{{ scope.row.app_group_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description"  align="center" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="300" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handUpdateAppAuthDailog(scope.row)">编辑权限</el-button>
          <el-button type="danger" size="mini" @click="handDeleteAppAuth(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="init" />


    <el-dialog class="AppAuthForm"  :title="dialogAppAuthFormTitle" width="700px" :visible.sync="dialogAppAuthFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="appAuthDataForm" :rules="rules"  :model="appAuthData" label-position="right" label-width="130px" style="margin:0;">
          <el-form-item label="用户：" prop="index" :error="username_error" class="is-required">
            <el-select v-model="appAuthData.index" filterable placeholder="请选择用户">
              <el-option
                v-for="item in user_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="管理员：" prop="manager">
            <el-radio-group v-model="appAuthData.manager">
              <el-radio :label='true'>是</el-radio>
              <el-radio :label='false'>否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注：" prop="description" >
            <el-input v-model="appAuthData.description" style="width:260px;"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="addLoading = false;dialogAppAuthFormVisible = false">取消</el-button>
        <el-button type="primary"  @click="handleAddAppAuth" :loading="addLoading">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog class="UpdateAuthForm"  :title="dialogUpdateAuthFormTitle" width="750px" :visible.sync="dialogUpdateAuthFormVisible" :close-on-click-modal="false" >
      <div>
        <el-form ref="appAuthUpdataForm"  :model="appAuthData" label-position="right" label-width="130px" style="margin:0;" class="operationTransferClass">
          <el-form-item label="管理员：" prop="manager">
            <el-radio-group v-model="appAuthData.manager">
              <el-radio :label='true'>是</el-radio>
              <el-radio :label='false'>否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="应用列表：" prop="app_id">
            <el-transfer
              ref="dataAppTransfer"
              filterable
              filter-placeholder="搜索应用名称"
              :titles="['应用选择', '已选应用']"
              v-model="appAuthData.app_id"
              :data="serviceAppList"
              target-order='push'>
            </el-transfer>
          </el-form-item>
          <el-form-item label="应用组列表：" prop="app_group_id">
            <el-transfer
              ref="dataAppGroupTransfer"
              filterable
              filter-placeholder="搜索应用组名称"
              :titles="['应用组选择', '已选应用组']"
              v-model="appAuthData.app_group_id"
              :data="serviceAppGroupList"
              target-order='push'>
            </el-transfer>
          </el-form-item>
          <el-form-item label="备注：" prop="description" >
            <el-input v-model="appAuthData.description" style="width:260px;"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateLoading = false;dialogUpdateAuthFormVisible = false">取消</el-button>
        <el-button type="primary"  @click="handleUpdateAppAuth" :loading="updateLoading">确 定</el-button>
        
        
      </div>
    </el-dialog>

    

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getMinionIdList } from '@/api/saltstack'
import { releaseGetAppList, releaseAuthGetList, releaseAuthIdNameList, releaseAuthAdd, releaseAuthUpdate, releaseAuthDel, releaseGetAppGroupList} from '@/api/release'
import { releaseGroupAdd, releaseGroupGetList, releaseGroupUpdate, releaseGroupDel} from '@/api/release'
import { getUsers } from '@/api/role'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultappAuthData = {
  username: '',
  app_id: [],
  app_name: '',
  app_group_id: [],
  app_group_name: '',
  manager: false,
  description: ''
}



export default {
  name: 'ReleaseAuthTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      user_list: [],
      dialogAppAuthFormVisible: false,
      dialogUpdateAuthFormVisible: false,
      appAuthData: Object.assign({}, defaultappAuthData),
      username_error: '',
      dialogAppAuthFormTitle: '添加授权用户',
      dialogUpdateAuthFormTitle: '',
      serviceAppList: [],
      serviceAppGroupList: [],
      // 表单验证
      rules: {
        username: {required: true, message: '请选择授权用户', trigger: 'blur'},
      },
      listQuery:{
        page: 1,
        page_size: 10,
        username: '',
        app_name: '',
        app_group_name: '',
        ordering: ''
      },
      addLoading: false,
      updateLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      listLoading: true,
    }
  },
  watch:{
  },
  created() {
    this.init()
  },
  methods: {
    // 获取应用授权列表,第一次进入好看加点loading
    async getList() {
      try {
        this.listLoading = true
        const response = await releaseAuthGetList(this.listQuery)
        this.data_list = response.data.results
        this.total = response.data.count
        // 同时获取用户列表
        const res = await releaseAuthIdNameList()
        const results = res.data.results
        this.user_list = []
        results.forEach((data, index) => {
        this.user_list.push({
          label: data.username,
          value: index,
          id: data.id
          });
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }catch(err) {
        // Message.error(err)
        console.log('获取应用授权列表' + err);
      }
    },

        // 获取应用发布列表
    async getReleaseGetAppList() {
      try {
        const response = await releaseGetAppList()
        const appList_temp = response.data.results;
        this.serviceAppList = []
        appList_temp.forEach((data, index) => {
          this.serviceAppList.push({
            label: data.app_name,
            key: data.id
            });
        })
      }catch(err) {
        // Message.error(err)
        console.log('获取应用发布列表' + err);
      }
    },

    // 获取应用发布组列表
    async getReleaseGetAppGroupList() {
      try {
        const response = await releaseGetAppGroupList()
        const data_temp = response.data.results
        this.serviceAppGroupList = []
        data_temp.forEach((data, index) => {
        this.serviceAppGroupList.push({
          label: data.app_group_name,
          key: data.id
          });
        })
      }catch(err) {
        // Message.error(err)
        console.log(' 获取应用发布组列表' + err);
      }
    },

    // 初始化的时候需要按顺序执行所以用了这个
    async init() {
        this.listLoading = true
        await this.getReleaseGetAppList()
        await this.getReleaseGetAppGroupList()
        await this.getList()
    },

    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 清空添加用户弹出框临时数据
    resetTemp() {
      this.appAuthData = Object.assign({}, defaultappAuthData);
      this.$refs['appAuthDataForm'].resetFields()
    },
    // 添加授权用户弹出框
    handleAddUserDailog(){
      this.dialogAppAuthFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.$refs['appAuthDataForm'].clearValidate()
      })
    },
    // 编辑应用授权弹出框
    handUpdateAppAuthDailog(row){
      this.dialogUpdateAuthFormTitle = '编辑授权'
      this.appAuthData = {...row}
      
      this.dialogUpdateAuthFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.$refs.dataAppTransfer.clearQuery("left")
      　this.$refs.dataAppTransfer.clearQuery("right")
        this.$refs.dataAppGroupTransfer.clearQuery("left")
      　this.$refs.dataAppGroupTransfer.clearQuery("right")
        this.$refs['appAuthUpdataForm'].clearValidate()
      })
    },
    // 新增授权用户
    handleAddAppAuth() {
      this.$refs['appAuthDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.appAuthData}
          data.username = this.user_list[data.index].label
          data.my_user_id = this.user_list[data.index].id
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.username_error = ''
          this.addLoading = true
          releaseAuthAdd(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogAppAuthFormVisible = false
              Message.success(response.data.results)
              this.getList()
            }
            else{
              this.addLoading = false
              let result_data = response.data.results
              console.log(JSON.stringify(result_data));
              if(Object.prototype.toString.call(result_data) === '[object Object]'){
                for (let k in result_data){
                  this[`${k}_error`] = result_data[k][0]
                }
              }else{
                Message.error(response.data.results)
              }
            }
          }).catch(error => {
            // 放空是为了处理请求异常时候不报错，不然会报没有catch捕获异常的错误
          })
        } else{
          return false
        }
      });
    },
    // 更新授权
    handleUpdateAppAuth() {
      let data = {...this.appAuthData}
      this.updateLoading = true
      releaseAuthUpdate(data).then(response => {
        if(response.data.status){
          this.updateLoading = false
          this.dialogUpdateAuthFormVisible = false
          Message.success(response.data.results)
          this.getList()
        }
        else{
          this.updateLoading = false
          let result_data = response.data.results
          console.log(JSON.stringify(result_data));
          if(Object.prototype.toString.call(result_data) === '[object Object]'){
            for (let k in result_data){
              this[`${k}_error`] = result_data[k][0]
            }
            Message.error(response.data.results)
          }else{
            Message.error(response.data.results)
          }
        }
      }).catch(error => {
        // 放空是为了处理请求异常时候不报错，不然会报没有catch捕获异常的错误
      })
      
    },
    // 删除应用授权
    handDeleteAppAuth({ $index, row }){
      this.$confirm('确认要删除该授权吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try{
          await releaseAuthDel(row.id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.data_list.splice($index, 1)
          this.getList()
        }catch(err) {
          this.listLoading = false
          console.log('删除授权' + err);
          this.$message({
            type: 'info',
            message: '删除授权' + err
          });  
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消'
        });       
      });
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'username') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'username'
        } else {
          this.listQuery.ordering = '-username'
        }
      }
      else if(prop === 'id'){
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


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  // 穿梭框高度调整，
  .operationTransferClass /deep/ .el-transfer{
    .el-transfer-panel{
      width: 230px;
    }
    .el-transfer-panel__body{
      height: 204px;
      .el-transfer-panel__list{
        height: 156px;
      }
    }
  }
}


</style>