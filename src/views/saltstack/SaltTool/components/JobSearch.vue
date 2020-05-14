<template>
  <div class="salttool-jobsearch-container" >
    <el-row :gutter="20">
        <el-col :span="12" class="overflow_set">
          <el-form :model="jobStatus" ref="jobStatus" label-width="120px" label-position="right" style="padding-top:20px;">
            <el-form-item label="任务状态查询：" prop="data" :rules="[{required: true, message: 'JID不能为空', trigger: 'change'}]">
              <el-col :span="8" style="padding:0">
                <el-input v-model="jobStatus.data" placeholder="输入要查询的jid" clearable></el-input>
              </el-col>
              <el-col :span="3">
                <el-button class="filter-item" type="primary" size="small" :loading="jobStatusLoading" @click="handJobTool('jobStatus')">查询</el-button>
              </el-col>
              <span style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">提示：结果为true说明任务执行完成</span>
            </el-form-item>
          </el-form>
          <el-form :model="jobResult" ref="jobResult" label-width="120px" label-position="right" style="padding-top:20px;">
            <el-form-item label="任务结果查询：" prop="data" :rules="[{required: true, message: 'JID不能为空', trigger: 'change'}]">
              <el-col :span="8" style="padding:0">
                <el-input v-model="jobResult.data" placeholder="输入要查询的jid" clearable></el-input>
              </el-col>
              <el-col :span="3">
                <el-button class="filter-item" type="primary" size="small" :loading="jobResultLoading" @click="handJobTool('jobResult')">查询</el-button>
              </el-col>
              <span style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">提示：注意先确认任务是否执行完毕</span>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form class="salt-result" ref="dataForm"  label-position="top" label-width="130px">
              <el-form-item label="执行结果:">
                <pre class="saltexe_pre"  ref="salt_exe_result" v-html="salt_exe_result_data"
                v-loading="resultLoading"
                :element-loading-text="loadingText"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
                >{{salt_exe_result_data}}</pre>
              </el-form-item>
          </el-form>
        </el-col>
    </el-row>
  </div>
</template>

<script>
import { saltToolJobSearchStatus, saltToolJobSearchResult } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive

export default {
  directives: { waves },
  data() {
    return {
      jobStatus: {
        data: '',
      },
      jobResult: {
        data: '',
      },
      jobStatusLoading: false,
      jobResultLoading: false,
      salt_exe_result_data: '',
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
            this.salt_exe_result_data  = this.salt_exe_result_data + "<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.result_fun(v,data_count+1)
        }else if(Object.prototype.toString.call(v) === '[object Array]'){
            this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.result_fun(v,data_count+1)
        }else{
            this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='padding-left: "+(data_count+1)*25+"px;'>"+v+"</p>";
        }
      }
    },
    // 执行任务查询命令
    handJobTool(formName){
      console.log(formName);
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let data = {jid:'',}
          if(formName == 'jobStatus'){
            this.jobStatusLoading = true;
            this.loadingText = '任务状态查询执行中'
            this.resultLoading = true
            data.salt_tool_tag = 'search_jid_status'
            data.jid = this.jobStatus.data
            this.salt_exe_result_data = ''
            saltToolJobSearchStatus(data).then(response => {
              if(response.data.status){
                this.salt_exe_result_data = 'jid ' + data.jid + ' 任务状态查询:'
                let data_count = 0;
                for (let k in response.data.results){
                  let v = response.data.results[k]
                  if(Object.prototype.toString.call(v) === '[object Object]'){
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                    this.result_fun(v,data_count+1);
                  }
                  else if(Object.prototype.toString.call(v) === '[object Array]'){
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                    this.result_fun(v,data_count+1);
                    this.salt_exe_result_data  = this.salt_exe_result_data +'\n\n';
                  }else{
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #3FB8AF;font-weight: bold;'>"+k+":</p>";
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='padding-left: 25px;'>"+v+"</p>";
                    this.salt_exe_result_data  = this.salt_exe_result_data +'\n\n';
                  }
                }
              }
              else{
                this.salt_exe_result_data = ''
                this.salt_exe_result_data = this.salt_exe_result_data + "<p style='color: #bf0000;'>"+response.data.results+"</p>"
              }
              this.jobStatusLoading = false;
              this.resultLoading = false
            }).catch(error => {
              console.log('saltToolJobSearchStatus' + error);
            })
          }else if(formName == 'jobResult'){
            this.jobResultLoading = true
            this.loadingText = '任务结果查询执行中'
            this.resultLoading = true
            data.salt_tool_tag = 'search_jid_result'
            data.jid = this.jobResult.data
            this.salt_exe_result_data = ''
            saltToolJobSearchResult(data).then(response => {
              if(response.data.status){
                this.salt_exe_result_data = 'jid ' + data.jid + ' 任务结果查询:'
                let data_count = 0;
                for (let k in response.data.results){
                  let v = response.data.results[k]
                  if(Object.prototype.toString.call(v) === '[object Object]'){
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                    this.result_fun(v,data_count+1);
                  }
                  else if(Object.prototype.toString.call(v) === '[object Array]'){
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                    this.result_fun(v,data_count+1);
                    this.salt_exe_result_data  = this.salt_exe_result_data +'\n\n';
                  }else{
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='color: #3FB8AF;font-weight: bold;'>"+k+":</p>";
                    this.salt_exe_result_data  = this.salt_exe_result_data +"<p style='padding-left: 25px;'>"+v+"</p>";
                    this.salt_exe_result_data  = this.salt_exe_result_data +'\n\n';
                  }
                }
              }
              else{
                this.salt_exe_result_data = ''
                this.salt_exe_result_data = this.salt_exe_result_data + "<p style='color: #bf0000;'>"+response.data.results+"</p>"
              }
              this.jobResultLoading = false;
              this.resultLoading = false
            }).catch(error => {
              console.log('saltToolJobSearchResult' + error);
            })
          }
        } else {
          return false;
        }
      });
    },
  },
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.salttool-jobsearch-container{
  .overflow_set{
    height: calc(100vh - 250px);
    overflow: auto;
  }
  .salt-result{
    .saltexe_pre{
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