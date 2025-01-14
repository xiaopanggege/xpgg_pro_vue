<template>
  <div class="app-container">
    <div class="op-tools-container" >
      <el-row :gutter="20">
          <el-col :span="12" class="overflow_set">
            <el-form :inline="true" :model="sxzAllow" :rules="szx_rules" ref="sxzAllow" label-width="140px" label-position="right" style="padding-top:20px;">
              <el-form-item label="双子星外网放通：" prop="sxz_username" >
                  <el-input v-model="sxzAllow.sxz_username" placeholder="名称(如小明1.1.1.1)" clearable></el-input>
              </el-form-item>
              <el-form-item  prop="sxz_ip" >
                  <el-input v-model="sxzAllow.sxz_ip" placeholder="放通的IP(如1.1.1.1)" clearable></el-input>
              </el-form-item>
              <el-form-item>
                  <el-button class="filter-item" type="primary" size="small" :loading="sxzAllowLoading" @click="handszxAllow">添加</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form class="exe-result" ref="dataForm"  label-position="top" label-width="130px">
                <el-form-item label="执行结果:">
                  <pre class="exe_pre"  ref="exe_result" v-html="tool_exe_result_data"
                  v-loading="resultLoading"
                  :element-loading-text="loadingText"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)"
                  ></pre>
                </el-form-item>
            </el-form>
          </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { szxAdd } from '@/api/auto-tool'
import waves from '@/directive/waves' // Waves directive

export default {
  directives: { waves },
  data() {
    var validateszxIP = (rule, value, callback) => {
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      if (!value) {
        callback(new Error('IP不能为空'));
      }else if(value.match(reg)==null){
        callback(new Error('IP格式不合法'));
      }else{
        callback();
      }
    };
    return {
      sxzAllow: {
        sxz_username: '',
        sxz_ip: '',
      },
      szx_rules: {
        sxz_username: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过个50字符', trigger: 'blur' }
        ],
        sxz_ip: [{ validator: validateszxIP, trigger: 'blur' },]
      },
      sxzAllowLoading: false,
      tool_exe_result_data: '',
      resultLoading: false,
      loadingText:'执行中',
    }
  },
  methods: {
    // 结果格式化方法
    result_fun(data,data_count) {
      if(!data) return;
      for (let k in data){
        let v = data[k];
        if(Object.prototype.toString.call(v) === '[object Object]'){
            this.tool_exe_result_data  = this.tool_exe_result_data + "<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.result_fun(v,data_count+1)
        }else if(Object.prototype.toString.call(v) === '[object Array]'){
            this.tool_exe_result_data  = this.tool_exe_result_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.result_fun(v,data_count+1)
        }else{
            this.tool_exe_result_data  = this.tool_exe_result_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.tool_exe_result_data  = this.tool_exe_result_data +"<p style='padding-left: "+(data_count+1)*25+"px;'>"+v+"</p>";
        }
      }
    },
    // 执行双子星放通外网操作
    handszxAllow(){
      this.$refs.sxzAllow.validate((valid) => {
        this.sxzAllowLoading = true;
        if (valid) {
          let data = {username:'',ip:''}
          data.username = this.sxzAllow.sxz_username
          data.ip = this.sxzAllow.sxz_ip
          this.loadingText = '正在给双子星EG添加放通IP...'
          this.resultLoading = true
          this.tool_exe_result_data = ''
          szxAdd(data).then(response => {
            if(response.data.status){
              this.tool_exe_result_data = '双子星放通外网结果:'
              this.tool_exe_result_data  = this.tool_exe_result_data +"<p style='color: #3FB8AF;font-weight: bold;'>"+response.data.results+"</p>";
            }
            else{
              this.tool_exe_result_data = '双子星放通外网结果:'
              this.tool_exe_result_data = this.tool_exe_result_data + "<p style='color: #bf0000;'>"+response.data.results+"</p>"
            }
            this.sxzAllowLoading = false;
            this.resultLoading = false
          }).catch(error => {
            console.log('szxAllowhStatus' + error);
            this.sxzAllowLoading = false;
            this.resultLoading = false
          })
        }else{
          this.sxzAllowLoading = false;
          this.resultLoading = false
        }
      });
    },
  },
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.op-tools-container{
  .overflow_set{
    height: calc(100vh - 250px);
    overflow: auto;
  }
  .exe-result{
    .exe_pre{
      font-size: 15px;
      resize: none;
      line-height: 100%;
      height: calc(100vh - 310px);
      margin: 0;
      background-color: #000;
      color: #47c032;
      overflow-y: auto;
      white-space: pre-wrap;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
  }
}
</style>