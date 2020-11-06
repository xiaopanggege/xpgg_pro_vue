<template>
  <div class="app-container">
    <el-row :gutter="20">
        <el-col :span="12" class="overflow_set">
          <hr>
          <el-form :model="exeData"  :rules="rules"  ref="ruleForm" label-width="120px" label-position="right" >
            <el-form-item v-show="exeData.client!='runner'" label="执行对象类型：" prop="tgt_type" class="is-required">
              <el-row>
                <el-radio-group v-model="exeData.tgt_type">
                  <el-col :span="6">
                    <el-radio  label="any">所有</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="minion_list">Minion_ID</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="pcre">Minion正则</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="custom_group">自定义组</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="grain">Grain</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="grain_pcre">Grain正则</el-radio>
                  </el-col>
                  <el-col :span="6">
                    <el-radio  label="ip_address">IP</el-radio>
                  </el-col>
                </el-radio-group>

              </el-row>
            </el-form-item>
            <el-form-item label="执行对象：" prop="minion_list" v-show="exeData.tgt_type=='minion_list'&&exeData.client!='runner'" :error="minion_transfer_error" class="is-required">
              <el-transfer
                ref="dataTransfer"
                filterable
                filter-placeholder="搜索Minion ID"
                :titles="['Minion ID选择', '已选Minion ID']"
                v-model="exeData.minion_list"
                :data="minion_list"
                target-order='push'>
                <span slot-scope="{ option }">
                  <el-tooltip class="item" effect="light" :content="option.label" placement="right">
                    <span>{{ option.label }}</span>
                  </el-tooltip>
                </span>
              </el-transfer>
            </el-form-item>
            <!-- 执行对象输入框 -->
            <el-form-item  label='执行对象：' v-show="tgt_type_lable[exeData.tgt_type]&&exeData.client!='runner'"  prop="tgt" class="is-required">
              <el-input
                :placeholder="tgt_type_placeholder[exeData.tgt_type]"
                v-model="exeData.tgt"
                clearable style="width:350px">
              </el-input>
            </el-form-item>
            
            <el-form-item label="Client：">
              <el-select v-model="exeData.client" placeholder="命令" @change="handFilterModule">
                <el-option label="local" value="local"></el-option>
                <el-option label="local_async" value="local_async"></el-option>
                <el-option label="runner" value="runner"></el-option>
              </el-select>
              <span style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">{{salt_cmd_help[exeData.client]}}</span>
            </el-form-item>
            <el-form-item label="Module：">
              <el-select v-model="select_module" clearable filterable placeholder="请选择模块">
                <el-option
                  v-for="item in module_list"
                  :key="item.salt_cmd_module"
                  :label="item.salt_cmd_module"
                  :value="item.salt_cmd_module">
                </el-option>
              </el-select>
              <span style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">提示：如已知晓要执行的命令可省略</span>
            </el-form-item>
            <el-form-item label="Fun：" prop="fun">
              <el-autocomplete
                ref="salt_fun"
                v-model="exeData.fun"
                :fetch-suggestions="funSearch"
                :debounce=0
                placeholder="输入要执行的命令"
              ></el-autocomplete>
              <el-button type="primary" size="mini" @click="getCmdInfo">命令帮助</el-button>
            </el-form-item>
            <el-form-item label="Arg：" prop="arg">
              <el-col :span="16"  v-for="(val,key) in arg_count" :key="key" style="padding:0 0 2px 0;">
                <el-input
                  :placeholder="'请输入参数'+val"
                  v-model="args[val-1]"
                  clearable>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-button type="primary" icon="el-icon-plus" @click="addArg" circle></el-button>
                <el-button type="danger" icon="el-icon-minus" v-if="arg_count>1" @click="delArg" circle></el-button>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="handSaltExe" :loading="exeLoading">执行命令</el-button>
              <el-button v-waves size="small" @click="exeLoading=false">取消</el-button>
            </el-form-item>
            <el-form-item label="" >
              <el-collapse  >
                <el-collapse-item >
                  <template slot="title">
                    <span style="color: red;font-weight: bold;">Arg填写帮助信息<i class="header-icon el-icon-info"></i></span>
                  </template>
                    <h4>平台调用的是salt-api所以Arg参数写法与命令行下有所不同</h4>
                    <p>例1： 命令：ps.proc_info 从命令帮助中可以看到CLI下是这样的：</p>
                    <p>salt '*' ps.proc_info 2322 attrs='["pid", "name"]' 其中参数是：<span style="color: red">2322 </span>和<span style="color: red">attrs='["pid", "name"]'</span></p>
                    <p>平台需要写成：参数1:<span style="color: red">pid=2322 </span>参数2:<span style="color: red">attrs=["pid","name"]</span>   # 注意第二个参数列表外的引号不需要</p>
                    <p>例2： 命令：salt '*' state.sls myslsfile pillar="{foo: 'Foo!', bar: 'Bar!'}"</p>
                    <p>平台需要写成：参数1:<span style="color: red">myslsfile </span>参数2:<span style="color: red">pillar={foo: 'Foo!', bar: 'Bar!'}</span>   # 注意第二个参数列表外的引号不需要</p> 
                </el-collapse-item>
              </el-collapse>
            </el-form-item>
          </el-form>
          <hr>
        </el-col>
        <el-col :span="12">
          <el-form class="salt-result" ref="dataForm"  :model="exeData" label-position="top" label-width="130px">
              <el-form-item label="执行结果:">
                <pre class="saltexe_pre"  ref="salt_exe_result" v-html="salt_exe_result_data"
                v-loading="resultLoading"
                :element-loading-text="loadingText"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)">{{salt_exe_result_data}}</pre>
              </el-form-item>
          </el-form>
        </el-col>
    </el-row>

    <el-dialog v-el-drag-dialog :visible.sync="dialogInfoVisible" :title="infoTemp.salt_cmd" width="40%">
      <el-input class="saltcmd-info-textarea" type="textarea" :autosize="{ minRows: 8, maxRows: 25}" readonly v-model="infoTemp.salt_cmd_doc"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogInfoVisible = false">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getMinionIdList, getSaltCmdModuleList, getSaltCmdCmdList, getSaltCmdList, saltExe } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive




export default {
  name: 'SaltExe',
  directives: { elDragDialog, waves },
  data() {
    var checkTgt = (rule, value, callback) => {
      if(this.exeData.client != 'runner'){
        if (this.exeData.tgt_type != 'any' && !value) {
          if(this.exeData.tgt_type != 'minion_list'){
            callback(new Error('请选择执行对象'));
          }else{
            callback();
          }
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkTgtType = (rule, value, callback) => {
      if(this.exeData.client != 'runner'){
        if (!value) {
          callback(new Error('请选择执行对象类型'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    return {
      arg_count:1,
      args:[],
      salt_cmd_type: {local: 'module', local_async: 'module', runner: 'runner',},
      salt_cmd_help: {local: '提示：等同命令行salt命令', local_async: '提示：等同命令行salt --async异步命令', runner: '提示：等同命令行salt-run命令,salt-run不需要执行对象参数',},
      temp_module: '',
      select_module: '',
      fun_list: [],
      module_list: [],
      minion_list: [],
      dialogInfoVisible: false,
      tgt_type: '',
      tgt_type_lable: {pcre: 'Minion正则：', custom_group:'自定义组：', grain: 'Grain：', grain_pcre: 'Grain正则：', ip_address: 'IP：'},
      tgt_type_placeholder: {
        pcre: '正则匹配Minion id', 
        custom_group:'自定义组功能开发中。。。：', 
        grain: '例：os:CentOS 或os:Windows', 
        grain_pcre: '例：os:Cent*', 
        ip_address: 'ip/ip段，例：192.168.1.1 or 192.168.1.0/24'
      },
      exeData: {
        client: 'local',
        tgt: '',
        minion_list: [],
        tgt_type: '',
        fun: '',
      },
      rules: {
        client: {required: true, message: '请选择salt命令', trigger: 'change'},
        tgt_type: {validator: checkTgtType, trigger: 'change'},
        fun: {required: true, message: '请输入命令', trigger: 'change'},
        tgt: {validator: checkTgt, trigger: 'change'},
      },
      // 命令帮助信息存放
      infoTemp: {},
      // 用来对应真实后端tgt_type的
      post_tgt_type: {any: 'glob', minion_list: 'list', grain: 'grain', grain_pcre: 'grain_pcre', ip_address: 'ipcidr', pcre: 'pcre'},
      // 存放执行结果
      salt_exe_result_data:'',
      exeLoading: false,
      resultLoading: false,
      loadingText:'命令执行中',
      minion_transfer_error: '',
    }
  },
  watch: {
    'exeData.tgt_type': {
      handler: function (val, oldVal) {
        if(this.minion_list.length === 0 && val === 'minion_list'){
          this.getIdList();
        }
      }
    },
    'exeData.minion_list': {
      handler: function (val, oldVal) {
        if(val.length > 0 ){
          this.minion_transfer_error = ''
        }
      } 
    },
  },
  created() {
    this.searchModule()
  },
  methods: {
    addArg(){
      this.arg_count = this.arg_count+1
    },
    delArg(){
      if(this.arg_count >= 2){
        this.arg_count = this.arg_count-1
        this.args.pop()
      }
    },
    searchModule(){
      getSaltCmdModuleList(this.salt_cmd_type[this.exeData.client]).then(response => {
        this.module_list = response.data
      }).catch(error => {
        console.log('searchModule' + error);
      })
    },
    handFilterModule(){
      this.select_module = '';
      this.searchModule()
    },
    // 下面3个方法是Fun命令框输入带建议的操作
    funSearch(queryString, cb) {
      if(this.temp_module != this.select_module){
        this.temp_module = this.select_module;
        getSaltCmdCmdList(this.salt_cmd_type[this.exeData.client], this.select_module).then(response => {
          this.fun_list = [];
          for(let item of response.data){
            this.fun_list.push({"value": item.salt_cmd})
          }
          var funRestaurants = this.fun_list;
          var results = queryString ? funRestaurants.filter(this.createFilter(queryString)) : funRestaurants;
          // 调用 callback 返回建议列表的数据
          cb(results);
        }).catch(error => {
          console.log('getSaltCmdCmdList' + error);
        })
      }else {
        var funRestaurants = this.fun_list;
        var results = queryString ? funRestaurants.filter(this.createFilter(queryString)) : funRestaurants;
        // 调用 callback 返回建议列表的数据
        cb(results);
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
      };
    },
    // 获取minion id字段列表
    getIdList(){
      getMinionIdList().then(response =>{
        const minionList = response.data.results;
        minionList.forEach((minion_id, index) => {
        this.minion_list.push({
          label: minion_id,
          key: minion_id
          });
        });
      }).catch(error => {
        console.log('获取minion id字段列表' + error);
      })
    },
    // 获取命令帮助
    getCmdInfo() {
      let data = {
        salt_cmd_type:'',
        salt_cmd: ''
      }
      this.infoTemp = {};
      data.salt_cmd_type = this.salt_cmd_type[this.exeData.client]
      data.salt_cmd = this.exeData.fun
      if(data.salt_cmd){
        getSaltCmdList(data).then(response => {
          this.infoTemp = Object.assign({}, response.data.results[0])
          this.dialogInfoVisible = true
        }).catch(error => {
          console.log('获取命令帮助' + error);
        })
      }else{
        this.$refs['salt_fun'].focus();
      }
      
    },
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
    // 执行salt命令
    handSaltExe(){
      this.exeLoading = true;
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let data = {
            client: this.exeData.client, 
            tgt: this.exeData.tgt, 
            tgt_type: this.post_tgt_type[this.exeData.tgt_type], 
            fun: this.exeData.fun, 
            arg: []
          }
          for(let arg of this.args){
            if(arg.trim()){
              data.arg.push(arg)
            }
          }
          if(this.exeData.tgt_type === 'minion_list'){
            if (this.exeData.minion_list.length) {
              data.tgt = []
              for(let minion of this.exeData.minion_list){
                data.tgt.push(minion)
              }
            }
            else {
              this.minion_transfer_error = '请至少选择一个Minion ID'
              this.exeLoading = false
              return false;
            }
          }else if(this.exeData.tgt_type === 'any'){
            data.tgt = '*'
          }

          this.resultLoading = true
          data.salt_exe_tag = 'salt_exe'
          this.salt_exe_result_data = ''
          saltExe(data).then(response => {
            if(response.data.status){
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
            this.exeLoading = false;
            this.resultLoading = false
          }).catch(error => {
            console.log('执行salt命令' + error);
          })
        } else {
          this.exeLoading = false;
          this.resultLoading = false
          return false;
        }
      });
    },
  },
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .overflow_set{
    height: calc(100vh - 170px);
    overflow: auto;
  }
  .salt-result{
    .saltexe_pre{
      font-size: 14px;
      resize: none;
      line-height: 100%;
      height: calc(100vh - 230px);
      margin: 0;
      background-color: #000;
      color: #47c032;
      overflow-y: auto;
      white-space: pre-wrap;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 6px 12px;
      font-family: Menlo,Monaco,Consolas,"Courier New",monospace;
    }
    
  }
  .el-radio-group{
    .el-radio{
      padding-bottom: 10px;
    }
  }
  .saltcmd-info-textarea /deep/ .el-textarea__inner{
    background-color: #000;
    color: #00B600;
  }
}


</style>