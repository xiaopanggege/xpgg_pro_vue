<template>
  <div class="app-container">
    <div class="filter-container">

      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddUserDailog">新增用户</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="getList" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-input placeholder="用户名" v-model="listQuery.search" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      <el-table-column label="用户名" prop="username" sortable="custom"  align="center" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="用户类型"   align="center" min-width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.is_superuser">超级管理员</span>
          <span v-else>普通用户</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="description"  align="center" min-width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.is_active">正常</el-tag>
          <el-tag type="info" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="300" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handUpdateUserDailog(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handUpdatePassDailog(scope.row)">重置密码</el-button>
          <el-button type="danger" size="mini" style="margin-right:10px;" @click="handDeleteAppGroup(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="UserControlForm"  :title="dialogUserFormTitle" width="750px" :visible.sync="dialogUserFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="UserDataForm" :rules="rules"  :model="UserData" label-position="right" label-width="130px" style="margin:0;" >
          <el-form-item label="用户名：" prop="username" :error="username_error" class="is-required">
            <el-input v-model="UserData.username" style="width:160px;" ref="username_focus" :readonly="dialogUserFormTitle=='编辑用户'"></el-input>
          </el-form-item>
          <el-form-item label="密码："  prop="password" class="is-required" v-show="dialogUserFormTitle=='新增用户'">
            <el-input type="password" style="width:160px;" v-model="UserData.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码：" prop="checkPassword" class="is-required" v-show="dialogUserFormTitle=='新增用户'">
            <el-input type="password" style="width:160px;" v-model="UserData.checkPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="用户类型：" prop="is_superuser"  class="is-required">
            <el-radio-group v-model="UserData.is_superuser">
              <el-radio :label='true'>超级管理员</el-radio>
              <el-radio :label='false'>普通用户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用户状态：" prop="is_active"  class="is-required">
            <el-radio-group v-model="UserData.is_active">
              <el-radio :label='true'>启用</el-radio>
              <el-radio :label='false'>禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用户头像：" >
            <el-upload
              class="avatar-uploader"
              :class="{hide:uploadHide}"
              ref="upload"
              action=""
              :auto-upload="false"
              :file-list="fileList"
              :on-change="handleChange"
              :on-remove="handleRemove"
              list-type="picture-card"
              :limit="1">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateLoading = false;addLoading = false;dialogUserFormVisible = false">取消</el-button>
        <el-button type="primary" v-show="dialogUserFormTitle=='新增用户'" @click="handleAddUser" :loading="addLoading">确 定</el-button>
        <el-button type="primary" v-show="dialogUserFormTitle=='编辑用户'" @click="handleUpdateUser" :loading="updateLoading">更 新</el-button>
        
        
      </div>
    </el-dialog>

    <!-- 密码重置单独一个提交 -->
    <el-dialog class="UpdatePassForm"  :title="'用户 ' +UserData.username + ' ' + dialogUserPassFormTitle" width="750px" :visible.sync="dialogUserPassFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="UpdatePassForm" :rules="updateRules"  :model="UserData" label-position="right" label-width="130px" style="margin:0;">
          <el-form-item label="密码："  prop="password" class="is-required" >
            <el-input type="password" style="width:160px;" v-model="UserData.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码：" prop="checkPassword" class="is-required" >
            <el-input type="password" style="width:160px;" v-model="UserData.checkPassword" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePassLoading = false;dialogUserPassFormVisible = false">取消</el-button>
        <el-button type="primary"  @click="handleUpdatePass" :loading="updatePassLoading">更 新</el-button>
        
        
      </div>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultUserData = {
  id:'',
  username: '',
  is_superuser: false,
  is_active: true,
  password: '',
  checkPassword: '',
  avatar: ''
}



export default {
  name: 'UserControl',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.UserData.checkPassword !== '') {
            if(typeof(this.UserData.checkPassword) !== "undefined"){
              this.$refs.UserDataForm.validateField('checkPassword');
            }
          }
          callback();
        }
      };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.UserData.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    // 更新密码验证
    var validateUpdatePass = (rule, value, callback) => {
      if (value === '' || !value) {
        callback(new Error('请输入密码'));
      } else {
        if (this.UserData.checkPassword !== '') {
          if(typeof(this.UserData.checkPassword) !== "undefined"){
            this.$refs.UpdatePassForm.validateField('checkPassword');
          }
        }
        callback();
      }
    };
    var validateUpdatePass2 = (rule, value, callback) => {
      if (value === '' || !value) {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.UserData.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      dialogUserFormVisible: false,
      UserData: Object.assign({}, defaultUserData),
      username_error: '',
      dialogUserFormTitle: '新增用户',
      // 表单验证
      rules: {
        username: [{message: '请输入用户名', trigger: 'blur'}],
        password: [
            { validator: validatePass, trigger: 'blur' }
          ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
      },
      // 更新密码表单验证
      updateRules: {
        password: [
            { validator: validateUpdatePass, trigger: 'blur' }
          ],
        checkPassword: [
          { validator: validateUpdatePass2, trigger: 'blur' }
        ],
      },
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        username: '',
        id: '',
        ordering: ''
      },
      addLoading: false,
      updateLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      listLoading: true,
      imageUrl: '',
      fileList: [],
      uploadHide: false,
      dialogUserPassFormTitle: '重置密码',
      dialogUserPassFormVisible: false,
      updatePassLoading: false
    }
  },
  watch:{
    // 弹出框关闭状态的时候清空上传的图片，本来是在下面方法里面删除，发现打开的时候之前的图片会缓慢消失。。动画效果太好了不需要
    dialogUserFormVisible: function(val, oldVal) {
      if(!val){
        this.fileList = [],
        this.uploadHide = false
      }
    }
  },
  created() {
    this.getList()
    
    
  },
  methods: {
    // 获取用户列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getUserList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取用户列表' + error);
      })
    },


    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 清空新增用户弹出框临时数据
    resetTemp() {
      this.UserData = Object.assign({}, defaultUserData);
      this.$refs['UserDataForm'].resetFields()
    },
    // 新增用户弹出框
    handleAddUserDailog(){
      this.dialogUserFormTitle = '新增用户'
      this.username_error = '';
      this.dialogUserFormVisible = true
      
      // 弹出框延时清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.$refs['username_focus'].focus();
        this.$refs['UserDataForm'].clearValidate()
        this.imageUrl = ''
      })
    },
    // 编辑用户弹出框
    handUpdateUserDailog(row){
      this.dialogUserFormTitle = '编辑用户'
      this.UserData = {...row}
      // 下面name的值我是随便设置的
      let pos = row.avatar.lastIndexOf('/')
      let name = row.avatar.substr(pos+1)
      // 头像的静态文件路径需要按实际外网来替换而不是直接取存数据库的头像url，因为存入数据库的可能是个内网url外网无法访问到，
      // 下面就是用process.env.VUE_APP_BASE_API来获取真实访问接口替换数据库的url，保证外网可以访问到图片
      let reg = /^http(s)?:\/\/(.*?)\//
      var ToReplace = process.env.VUE_APP_BASE_API + '/'
      row.avatar = row.avatar.replace(reg, ToReplace)
      this.fileList = [{name: name, url: row.avatar}, ]
      this.uploadHide = this.fileList.length > 0
      this.username_error = '';
      this.dialogUserFormVisible = true
      // 弹出框延时清空
      this.$nextTick(()=>{
        this.$refs['UserDataForm'].clearValidate()
      })
    },
    // 重置密码弹出框
    handUpdatePassDailog(row){
      this.UserData = {...row}
      this.dialogUserPassFormVisible = true
      // 弹出框延时清空
      this.$nextTick(()=>{
        this.$refs['UpdatePassForm'].clearValidate()
      })
    },
    // 新增用户
    handleAddUser() {
      this.$refs['UserDataForm'].validate((valid) => {
        if (valid) {
          const formData = new FormData()
          formData.append('username', this.UserData.username)
          formData.append('password', this.UserData.password)
          formData.append('is_superuser', this.UserData.is_superuser)
          formData.append('is_active', this.UserData.is_active)
          if(this.fileList.length>0 && this.fileList[0]['status'] === 'ready'){
            formData.append('avatar', this.fileList[0].raw)
          }
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.username_error = ''
          this.addLoading = true
          addUser(formData).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogUserFormVisible = false
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
            this.addLoading = false
            console.log('新增用户' + error);
          })
        } else{
          return false
        }
      });
      
    },
    // 更新用户
    handleUpdateUser() {
      this.$refs['UserDataForm'].validate((valid) => {
        if (valid) {
          const formData = new FormData()
          formData.append('is_superuser', this.UserData.is_superuser)
          formData.append('is_active', this.UserData.is_active)
          if(this.fileList.length>0 && this.fileList[0]['status'] === 'ready'){
            formData.append('avatar', this.fileList[0].raw)
          }
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.username_error = ''
          this.updateLoading = true
          updateUser(this.UserData.id, formData).then(response => {
            if(response.data.status){
              this.updateLoading = false
              this.dialogUserFormVisible = false
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
            this.updateLoading = false
            console.log('更新用户' + error);
          })
        } else{
          return false
        }
      });
      
    },
    // 重置密码
    handleUpdatePass() {
      this.$refs['UpdatePassForm'].validate((valid) => {
        if (valid) {
          const newPass = {'password': this.UserData.password}
          this.updatePassLoading = true
          updateUser(this.UserData.id, newPass).then(response => {
            if(response.data.status){
              this.updatePassLoading = false
              this.dialogUserPassFormVisible = false
              Message.success(response.data.results)
              this.getList()
            }
            else{
              this.updatePassLoading = false
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
            this.updatePassLoading = false
            console.log('重置密码' + error);
          })
        } else{
          return false
        }
      });
    },
    // 删除用户
    handDeleteAppGroup({ $index, row }){
      this.$confirm('确认要删除该用户吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
          this.listLoading = true
          try{
            await deleteUser(row.id)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.data_list.splice($index, 1)
            this.listLoading = false
          }catch(err) {
            console.log('删除用户' + err);
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

    handleRemove(file, fileList) {
      this.uploadHide = fileList.length > 0
      this.fileList = []
    },
    handleChange(file, fileList) {
      const fileTyep = ['image/jpeg', 'image/png']
      const isJPG = fileTyep.some(type => type === file.raw.type);
      const isLt2M = file.raw.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
        this.fileList = []
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        this.fileList = []
        return false
      }
      this.uploadHide = fileList.length > 0
      this.fileList = fileList
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
  


  // 上传相关样式
  .avatar-uploader /deep/ .el-upload {
    border: 1px dashed #d9d9d9!important;
    border-radius: 6px!important;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader /deep/ .el-upload:hover {
    border-color: #409EFF!important;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }

  .hide /deep/ .el-upload--picture-card {
    display: none;
  }

}


</style>