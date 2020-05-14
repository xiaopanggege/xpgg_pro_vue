<template>
  <div class="app-container">
    <div class="filter-container">

      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddAppGroupDailog">新增应用组</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="init" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-input placeholder="应用组名称" v-model="listQuery.app_group_name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="应用组成员" v-model="listQuery.app_name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      <el-table-column label="ID" prop="id" sortable="custom"  align="center" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用组名称" prop="app_group_name" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.app_group_name }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="成员名单"   align="center" min-width="300">
        <template slot-scope="scope">
          <span>{{ scope.row.app_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description"  align="center" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="300" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handUpdateAppGroupDailog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" style="margin-right:10px;" @click="handDeleteAppGroup(scope)">删除</el-button>
          <router-link :to="'/release/releasemember-table/'+scope.row.id + '/' + scope.row.app_group_name">
            <el-button type="primary" size="mini" >成员发布页<i class="el-icon-d-arrow-right el-icon--right"></i></el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="init" />

    <el-dialog class="AppGroupForm"  :title="dialogAppGroupFormTitle" width="750px" :visible.sync="dialogAppGroupFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="appGroupDataForm" :rules="rules"  :model="appGroupData" label-position="right" label-width="130px" style="margin:0;" class="operationTransferClass">
              <el-form-item label="应用组名称：" prop="app_group_name" :error="app_group_name_error" class="is-required">
                <el-input v-model="appGroupData.app_group_name" style="width:160px;" ref="app_group_name_focus" ></el-input>
              </el-form-item>
              <el-form-item label="应用列表：" prop="app_id">
                <el-transfer
                  ref="dataTransfer"
                  filterable
                  filter-placeholder="搜索应用名称"
                  :titles="['应用选择', '已选应用']"
                  v-model="appGroupData.app_id"
                  :data="serviceAppList"
                  target-order='push'>
                </el-transfer>
              </el-form-item>
              <el-form-item label="备注：" prop="description" >
                <el-input v-model="appGroupData.description" style="width:260px;"></el-input>
              </el-form-item>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateLoading = false;addLoading = false;dialogAppGroupFormVisible = false">取消</el-button>
        <el-button type="primary" v-show="dialogAppGroupFormTitle=='新增应用组'" @click="handleAddAppGroup" :loading="addLoading">确 定</el-button>
        <el-button type="primary" v-show="dialogAppGroupFormTitle=='编辑应用组'" @click="handleUpdateAppGroup" :loading="updateLoading">更 新</el-button>
        
        
      </div>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getMinionIdList } from '@/api/saltstack'
import { releaseGetAppList} from '@/api/release'
import { releaseGroupAdd, releaseGroupGetList, releaseGroupUpdate, releaseGroupDel} from '@/api/release'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultAppGroupData = {
  app_group_name: '',
  app_id: [],
  app_name: '',
  description: ''
}



export default {
  name: 'ReleaseGroupTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      dialogAppGroupFormVisible: false,
      appGroupData: Object.assign({}, defaultAppGroupData),
      app_group_name_error: '',
      dialogAppGroupFormTitle: '新增应用组',
      serviceAppList: [],
      // 表单验证
      rules: {
        app_group_name: {required: true, message: '请输入应用组名称', trigger: 'blur'},
      },
      listQuery:{
        page: 1,
        page_size: 10,
        app_group_name: '',
        app_name: '',
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
    // 获取应用组列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      releaseGroupGetList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取应用组列表' + error);
      })
    },
    // 获取应用发布列表
    async getReleaseGetAppList() {
      try {
        const response = await releaseGetAppList()
        const appList_temp = response.data.results;
        this.serviceAppList = []
        this.serviceAppDict = {}
        appList_temp.forEach((data, index) => {
          this.serviceAppList.push({
            label: data.app_name,
            key: data.id
            });
        })
      }catch(err) {
        // Message.error(err)
        console.log(' 获取应用发布列表' + err);
      }
    },

    // 初始化的时候需要按顺序执行所以用了这个
    async init() {
      this.listLoading = true
      await this.getReleaseGetAppList()
      await this.getList()
      
    },


    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 清空新增应用组弹出框临时数据
    resetTemp() {
      this.appGroupData = Object.assign({}, defaultAppGroupData);
      this.$refs['appGroupDataForm'].resetFields()
    },
    // 新增应用组弹出框
    handleAddAppGroupDailog(){
      this.dialogAppGroupFormTitle = '新增应用组'
      this.app_group_name_error = '';
      this.dialogAppGroupFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.$refs['app_group_name_focus'].focus();
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['appGroupDataForm'].clearValidate()
      })
    },
    // 编辑应用组弹出框
    handUpdateAppGroupDailog(row){
      this.dialogAppGroupFormTitle = '编辑应用组'
      this.appGroupData = {...row}
      this.app_group_name_error = '';
      this.dialogAppGroupFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['appGroupDataForm'].clearValidate()
      })
    },
    // 新增应用组
    handleAddAppGroup() {
      this.$refs['appGroupDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.appGroupData}
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.app_group_name_error = ''
          this.addLoading = true
          releaseGroupAdd(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogAppGroupFormVisible = false
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
            console.log('新增应用组' + error);
          })
        } else{
          return false
        }
      });
      
    },
    // 更新应用组
    handleUpdateAppGroup() {
      this.$refs['appGroupDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.appGroupData}
          // data.app_group_members = JSON.stringify(data.app_group_members)
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.app_group_name_error = ''
          this.updateLoading = true
          releaseGroupUpdate(data).then(response => {
            if(response.data.status){
              this.updateLoading = false
              this.dialogAppGroupFormVisible = false
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
              }else{
                Message.error(response.data.results)
              }
            }
          }).catch(error => {
            console.log('更新应用组' + error);
          })
        } else{
          return false
        }
      });
      
    },
    // 删除应用组
    handDeleteAppGroup({ $index, row }){
      this.$confirm('确认要删除该应用组吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
          this.listLoading = true
          try{
            await releaseGroupDel(row.id)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.data_list.splice($index, 1)
            this.listLoading = false
          }catch(err) {
            console.log('删除应用组' + err);
          }
        }).catch(() => {
          this.listLoading = false
          this.$message({
            type: 'info',
            message: '删除失败'
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
      if (prop === 'app_group_name') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'app_group_name'
        } else {
          this.listQuery.ordering = '-app_group_name'
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
  .transfer_error{
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
  
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