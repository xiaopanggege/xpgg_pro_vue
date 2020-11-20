<template>
  <div class="app-container">
    <div>
      <el-form ref="UserDataForm" :rules="rules"  :model="UserData" label-position="right" label-width="130px" style="margin:0;" >
        <el-form-item label="用户名：" >
          <span>{{ UserData.username }}</span>
        </el-form-item>
        <el-form-item label="密码：" >
          <!-- <el-button type="primary" size="small" @click="handleUpdatePass" :loading="updateLoading">修改密码</el-button> -->
           <el-button type="primary" size="mini" @click="dialogUserPassFormVisible=true">重置密码</el-button>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="UserData.email" style="width:160px;" ></el-input>
        </el-form-item>
        <el-form-item label="创建时间：" >
          <span>{{ UserData.date_joined | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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
        <el-form-item>
          <el-button type="primary" round @click="handleUpdateUser" :loading="updateLoading">提交更新</el-button>
        </el-form-item>
      </el-form>
    </div>

  

    <!-- 密码重置单独一个提交 -->
    <el-dialog class="UpdatePassForm"  :title="'用户 ' +UserData.username + ' ' + dialogUserPassFormTitle" width="750px" :visible.sync="dialogUserPassFormVisible" :close-on-click-modal="false" 
    @close="closeUpdatePassDialog">
      
      <div>
        <el-form ref="UpdatePassForm" :rules="updateRules"  :model="passData" label-position="right" label-width="130px" style="margin:0;">
          <el-form-item label="旧密码："  prop="oldPassword" class="is-required" :error="password_error">
            <el-input type="password" style="width:160px;" v-model="passData.oldPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="新密码："  prop="newPassword" class="is-required" >
            <el-input type="password" style="width:160px;" v-model="passData.newPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码：" prop="checkPassword" class="is-required" >
            <el-input type="password" style="width:160px;" v-model="passData.checkPassword" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUserPassFormVisible=false">取消</el-button>
        <el-button type="primary"  @click="handleUpdatePass" :loading="updatePassLoading">更 新</el-button>
        
        
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getUserList, addUser, updateUser, deleteUser, passAuth } from '@/api/user'
import { getInfo } from '@/api/login'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // Waves directive
import { Message } from 'element-ui'

const defaultUserData = {
  id:'',
  username: '',
  is_superuser: false,
  is_active: true,
  avatar: '',
  email: '',
  date_joined: '',
}



export default {
  name: 'UserData',
  directives: { waves },
  data() {
    // 更新密码验证
    var validateUpdatePass1 = (rule, value, callback) => {
      if (value === '' || !value) {
        callback(new Error('请输入旧密码'));
      } else {
        callback();
      }
    };
    var validateUpdatePass2 = (rule, value, callback) => {
      if (value === '' || !value) {
        callback(new Error('请输入新密码'));
      } else {
        if (this.passData.checkPassword !== '') {
          if(typeof(this.passData.checkPassword) !== "undefined"){
            this.$refs.UpdatePassForm.validateField('checkPassword');
          }
        }
        callback();
      }
    };
    var validateUpdatePass3 = (rule, value, callback) => {
      if (value === '' || !value) {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.passData.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      UserData: Object.assign({}, defaultUserData),
      // 表单验证
      rules: {
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
      },
      // 更新密码表单验证
      updateRules: {
        oldPassword: [
            { validator: validateUpdatePass1, trigger: 'blur' } 
          ],
        newPassword: [
            { validator: validateUpdatePass2, trigger: 'blur' }
          ],
        checkPassword: [
          { validator: validateUpdatePass3, trigger: 'blur' }
        ],
      },
      updateLoading: false,
      listLoading: true,
      imageUrl: '',
      fileList: [],
      uploadHide: false,
      passData: { oldPassword: '', newPassword: '', checkPassword: ''},
      dialogUserPassFormTitle: '重置密码',
      dialogUserPassFormVisible: false,
      updatePassLoading: false,
      password_error: ''
    }
  },
  watch:{
    
  },
  created() {
    this.getUserInfo()
    
    
  },
  methods: {
    // 获取用户列表,第一次进入好看加点loading
    getUserInfo() {
      this.listLoading = true
      getInfo().then(response => {
        this.UserData = response.data
        let pos = this.UserData.avatar.lastIndexOf('/')
        let name = this.UserData.avatar.substr(pos+1)
        // 头像的静态文件路径需要按实际外网来替换而不是直接取存数据库的头像url，因为存入数据库的可能是个内网url外网无法访问到，
        // 下面就是用process.env.VUE_APP_BASE_API来获取真实访问接口替换数据库的url，保证外网可以访问到图片
        let reg = /^http(s)?:\/\/(.*?)\//
        var ToReplace = process.env.VUE_APP_BASE_API + '/'
        this.UserData.avatar = this.UserData.avatar.replace(reg, ToReplace)
        this.fileList = [{name: name, url: this.UserData.avatar}, ]
        this.uploadHide = this.fileList.length > 0
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取用户' + error);
      })
    },


    // 提交更新用户
    handleUpdateUser() {
      this.$refs['UserDataForm'].validate((valid) => {
        if (valid) {
          const formData = new FormData()
          formData.append('email', this.UserData.email)
          if(this.fileList.length>0 && this.fileList[0]['status'] === 'ready'){
            formData.append('avatar', this.fileList[0].raw)
          }

          this.$confirm('确定要提交当前变更吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
              this.updateLoading = true
              updateUser(this.UserData.id, formData).then(response => {
              if(response.data.status){
                this.updateLoading = false
                Message.success(response.data.results)
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
              console.log('提交更新出错：' + error);
              })
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消更新'
              });          
            });
        } else{
          return false
        }
      });
    },

    // 关闭密码弹出框，清空数据
    closeUpdatePassDialog(row){
      this.$refs['UpdatePassForm'].resetFields()
      this.dialogUserPassFormVisible = false
    },

    // 重置密码
    handleUpdatePass() {
      this.$refs['UpdatePassForm'].validate((valid) => {
        if (valid) {
          const oldPass = {'password': this.passData.oldPassword}
          const newPass = {'password': this.passData.newPassword}
          this.updatePassLoading = true
          this.password_error = ''
          passAuth(oldPass).then(response => {
            if(response.data.status){
              updateUser(this.UserData.id, newPass).then(response => {
              if(response.data.status){
                this.updatePassLoading = false
                this.dialogUserPassFormVisible = false
                Message.success(response.data.results)
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
          }
          else{
            this.updatePassLoading = false
            let result_data = response.data.results
            console.log(JSON.stringify(result_data));
            this.password_error = result_data
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