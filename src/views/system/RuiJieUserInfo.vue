<template>
  <div class="app-container">
    <div class="filter-container">

      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="getList" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-select v-model="listQuery.disabled" clearable style="width: 140px" class="filter-item" placeholder="状态" @change="handleFilter">
                <el-option label="启用" value="false"/>
                <el-option label="禁用" value="true"/>
              </el-select>
          <el-input placeholder="部门" v-model="listQuery.department" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="casID" v-model="listQuery.UserID" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="用户名" v-model="listQuery.UserName" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      class="group_table">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom"  align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="UserName" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUserInfoDailog(scope.row)">{{ scope.row.UserName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="casID" prop="UserID" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.UserID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门" prop="department" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.department }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="disabled" sortable="custom" label="用户状态" width="120">
        <template slot-scope="scope">
          <el-tag type="info" v-if="scope.row.disabled">禁用</el-tag>
          <el-tag type="success" v-else>启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="IsLeader" sortable="custom" label="是否为领导" width="120">
        <template slot-scope="scope">
          <el-tag type="info" v-if="scope.row.IsLeader">否</el-tag>
          <el-tag type="success" v-else>是</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUserInfoDailog(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="UserControlForm"  :title="dialogUserFormTitle" width="950px" :visible.sync="dialogUserFormVisible"  >
      
      <div>
        <el-form ref="UserDataForm"   :model="UserData" label-position="right" label-width="180px" style="margin:0;" >
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="用户名" prop="UserName">
                <el-input v-model="UserData.UserName" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="专业组长名称" prop="LeaderName">
                <el-input v-model="UserData.LeaderName" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="工号" prop="UserNum">
                <el-input v-model="UserData.UserNum" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="专业组编码" prop="DeptCode">
                <el-input v-model="UserData.DeptCode" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="专业组ID" prop="DeptId">
                <el-input v-model="UserData.DeptId" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="casID" prop="UserID">
                <el-input v-model="UserData.UserID" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="专业组长casID" prop="LeaderCode">
                <el-input v-model="UserData.LeaderCode" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="HR系统ID" prop="hrDataId">
                <el-input v-model="UserData.hrDataId" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="联系方式" prop="Tel">
                <el-input v-model="UserData.Tel" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="是否禁用(是为禁用)" prop="disabled">
                <el-input v-model="UserData.disabled" style="width:160px;" readonly></el-input>
              </el-form-item>
              
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否领导(否为领导)" prop="IsLeader">
                <el-input v-model="UserData.IsLeader" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="二级部门路径" prop="department">
                <el-input v-model="UserData.department" style="width:230px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="入司时间" prop="entryDate">
                <el-input v-model="UserData.entryDate" style="width:230px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="离职时间" prop="leaveDate">
                <el-input v-model="UserData.leaveDate" style="width:230px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="转正时间" prop="conversionDate">
                <el-input v-model="UserData.conversionDate" style="width:230px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="上级主管casID" prop="SuperiorLeaderCode">
                <el-input v-model="UserData.SuperiorLeaderCode" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="上级主管名称" prop="SuperiorLeaderName">
                <el-input v-model="UserData.SuperiorLeaderName" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="工作地" prop="taxAddress">
                <el-input v-model="UserData.taxAddress" style="width:230px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="用户类型" prop="userType">
                <el-input v-model="UserData.userType" style="width:160px;" readonly></el-input>
              </el-form-item>
              <el-form-item label="用户状态" prop="Status">
                <el-input v-model="UserData.Status" style="width:160px;" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUserFormVisible = false">关闭</el-button>
        
      </div>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getUserList, addUser, updateUser, deleteUser, getRuiJieUserList } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'
import { parseTime } from '@/utils'

// 懒得写了，字段很多没写全哈哈
const defaultUserData = {
  id:'',
  UserName: '',
  disabled: true,
  IsLeader: '',
}



export default {
  name: 'RuiJieUserInfo',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      dialogUserFormVisible: false,
      UserData: Object.assign({}, defaultUserData),
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        UserName: '',
        id: '',
        ordering: ''
      },
      tableKey: 0,
      data_list: null,
      total: 0,
      listLoading: true,
      imageUrl: '',
      fileList: [],
      dialogUserFormTitle: '用户详情',
      // uploadHide: false,
      // dialogUserPassFormTitle: '重置密码',
      // dialogUserPassFormVisible: false,
    }
  },
  created() {
    this.getList()
    
    
  },
  methods: {
    // 获取锐捷用户列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getRuiJieUserList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取锐捷用户列表' + error);
      })
    },


    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 查看用户弹出框
    handleUserInfoDailog(row){
      this.dialogUserFormTitle = '用户详情'
      this.UserData = {...row}
      let StatusMap = new Map()
      StatusMap.set(0,'试用')
      StatusMap.set(1, '正式')
      StatusMap.set(2, '离职')
      StatusMap.set(3, '离岗')
      StatusMap.set(4, '实习生')
      StatusMap.set(5, '特殊人员')
      StatusMap.set(-1, '未入职')
      this.UserData.Status = StatusMap.get(this.UserData.Status)? StatusMap.get(this.UserData.Status): '未知状态'
      let userTypeMap = new Map()
      userTypeMap.set(0,'应届')
      userTypeMap.set(1,'社招')
      userTypeMap.set(2,'实习生')
      userTypeMap.set(3,'外包')
      userTypeMap.set(4,'回聘')
      userTypeMap.set(5,'未入职')
      userTypeMap.set(6,'项目外编')
      userTypeMap.set(7,'合作商驻场编制')
      userTypeMap.set(8,'劳务编')
      userTypeMap.set(-1,'外编')
      this.UserData.userType = userTypeMap.get(this.UserData.userType)? userTypeMap.get(this.UserData.userType): '未知类型'
      this.UserData.disabled = this.UserData.disabled?'禁用': '启用'
      this.UserData.IsLeader = this.UserData.IsLeader?'否': '是'
      this.UserData.entryDate = this.UserData.entryDate?parseTime(this.UserData.entryDate,'{y}-{m}-{d} {h}:{i}'): ''
      this.UserData.leaveDate = this.UserData.leaveDate?parseTime(this.UserData.leaveDate,'{y}-{m}-{d} {h}:{i}'): ''
      this.UserData.conversionDate = this.UserData.conversionDate?parseTime(this.UserData.conversionDate,'{y}-{m}-{d} {h}:{i}'): ''
      this.dialogUserFormVisible = true
      // 弹出框延时清空
      this.$nextTick(()=>{
        
      })
    },
    
    
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'UserName') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'UserName'
        } else {
          this.listQuery.ordering = '-UserName'
        }
      }
      else if(prop === 'id'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'id'
        } else {
          this.listQuery.ordering = '-id'
        }
      }
      else if(prop === 'UserID'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'UserID'
        } else {
          this.listQuery.ordering = '-UserID'
        }
      }
      else if(prop === 'disabled'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'disabled'
        } else {
          this.listQuery.ordering = '-disabled'
        }
      }
      else if(prop === 'IsLeader'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'IsLeader'
        } else {
          this.listQuery.ordering = '-IsLeader'
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

}


</style>