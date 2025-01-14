<template>
  <div class="app-container">
    <div>
      <el-tabs type="border-card">
        <el-tab-pane label="邮箱配置">
          <el-form ref="emailDataForm" :rules="rules"  :model="emailData" label-position="right" label-width="130px" style="margin:0;" >
            <el-form-item label="邮箱账号" prop="email">
              <el-input v-model="emailData.email" style="width:260px;" ></el-input>
            </el-form-item>
            <el-form-item label="邮箱密码"  prop="password">
              <el-input type="password" style="width:260px;" v-model="emailData.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱服务器地址" prop="smtp_addr">
              <el-input v-model="emailData.smtp_addr" style="width:260px;" ></el-input>
            </el-form-item>
            <el-form-item label="邮箱服务器端口" prop="smtp_port">
              <el-input v-model="emailData.smtp_port" style="width:260px;" ></el-input>
            </el-form-item>
            <el-form-item label="安全相关" prop="security">
              <el-checkbox-group v-model="emailData.security" :max="1">
                <el-checkbox label="ssl">开启SSL</el-checkbox>
                <el-checkbox label="tls">开启TLS</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="发件人名称" prop="email_name" >
              <el-input v-model="emailData.email_name" style="width:260px;" ></el-input>
            </el-form-item>
            <el-divider content-position="left">其他</el-divider>
            <el-form ref="emailTestDataForm" :inline="true" :rules="testRules" hide-required-asterisk  :model="emailTestData" label-position="right" label-width="130px" style="margin:0;" >
              <el-form-item label="测试收件邮箱" prop="tmail_name" >
                <el-input v-model="emailTestData.tmail_name" style="width:260px;" ></el-input>
              </el-form-item>
              <el-button type="primary" round @click="handleEmailTest" :loading="updateEmailLoading">测试邮件</el-button>
            </el-form>
            <el-form-item>
              <el-button type="info" round @click="resetEmailForm" :loading="updateEmailLoading">重置</el-button>
              <el-button type="primary" round @click="handleEmailUpdate" :loading="updateEmailLoading">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>


        <el-tab-pane label="配置管理">配置管理</el-tab-pane>
        <el-tab-pane label="角色管理">角色管理</el-tab-pane>
        <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
      </el-tabs>

      
    </div>

  


  </div>
</template>

<script>
import { getSysInfo, createSys, updateSys, emailTest } from '@/api/sysconf'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // Waves directive
import { Message } from 'element-ui'

const defaultemailData = {
  email:'',
  password: '',
  smtp_addr: '',
  smtp_port: '',
  security: [],
  email_name: '',
  tmail_name: '',
}

export default {
  name: 'SysConfig',
  directives: { waves },
  data() {
    return {
      emailData: Object.assign({}, defaultemailData),
      // 表单验证
      rules: {
        email: [
          {required: true, type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur'] }
        ],
        password:[
          {required: true, message: '请输入邮箱密码', trigger: ['blur'] }
        ],
        smtp_addr:[
          {required: true, message: '请输入邮箱服务器地址', trigger: ['blur'] }
        ],
        smtp_port:[
          {required: true, message: '请输入邮箱服务器端口', trigger: ['blur'] }
        ],
        tmail_name: [
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur'] }
        ],
      },
      testRules: {
        tmail_name: [
          {required: true, type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur'] }
        ],
      },
      emailTestData: {},
      email_check:true,
      updateEmailLoading: false,
      listLoading: true,
      tmail_name_error:'',
    }
  },
  watch:{
    
  },
  created() {
    this.getEmailInfo()
    
    
  },
  methods: {
    // 获取邮件信息,第一次进入好看加点loading
    getEmailInfo() {
      this.listLoading = true
      const query = {'name':'email'}
      getSysInfo(query).then(response => {
        if(response.data.results.length){
          this.emailData = JSON.parse(response.data.results[0].value)
          
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 0.5 * 1000)
        }else{
          // 如果没有获取到数据，就说明email在数据库还是空的，做个标记等下提交操作改成创建而不是更新
          this.email_check = false
        }
      }).catch(error => {
        console.log('获取邮件信息' + error);
      })
    },

    // 重置邮件配置
    resetEmailForm() {
      this.$refs['emailDataForm'].resetFields();
      this.$refs['emailDataForm'].clearValidate();
    },

    // 提交更新用户
    handleEmailUpdate() {
      this.$refs['emailDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.emailData}
          delete data.tmail_name
          data = JSON.stringify(data)
          this.$confirm('确定要提交当前变更吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
              this.updateEmailLoading = true
              if(this.email_check){
                updateSys('email', {'value':data}).then(response => {
                  if(response.data.status){
                    this.updateEmailLoading = false
                    Message.success('邮件配置成功')
                  }
                  else{
                    this.updateEmailLoading = false
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
                  this.updateEmailLoading = false
                  console.log('邮件配置提交出错：' + error);
                })
              }
              else{
                let email_data = {'name':'email','key':'email','value':data, 'description':'邮件配置信息'}
                console.log(email_data);
                createSys(email_data).then(response => {
                  if(response.data.status){
                    this.updateEmailLoading = false
                    Message.success('邮件配置成功')
                  }
                  else{
                    this.updateEmailLoading = false
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
                  this.updateEmailLoading = false
                  console.log('邮件配置提交出错：' + error);
                })
              } 
              
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '取消'
              });          
            });
        } else{
          return false
        }
      });
    },

// 邮件测试
    handleEmailTest() {
      this.$refs['emailDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.emailData}
          this.$refs['emailTestDataForm'].validate((valid) => {
            if (valid) {
              data.tmail_name = this.emailTestData.tmail_name
              this.$confirm('测试当前配置吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                  this.updateEmailLoading = true
                  emailTest(data).then(response => {
                    if(response.data.status){
                      this.updateEmailLoading = false
                      Message.success(response.data.results)
                    }
                    else{
                      this.updateEmailLoading = false
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
                    this.updateEmailLoading = false
                    console.log('邮件测试提交出错：' + error);
                  })
                  
                  
                }).catch(() => {
                  this.$message({
                    type: 'info',
                    message: '取消'
                  });          
                });
            } else{
              return false
            }
          })
          
        } else{
          return false
        }
      });
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