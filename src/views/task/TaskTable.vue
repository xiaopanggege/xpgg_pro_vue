<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">
      <el-row class="">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddTaskDailog">新增Task</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="handleRunTask" :loading="exeLoading">执行Task</el-button>
        <div style="float:right;">
          <el-input placeholder="名称" v-model="listQuery.search" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        </div>        
      </el-row>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="data_list"
      size='medium'
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      class="">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom"  align="center" min-width="40">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" prop="name" sortable="custom" align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" align="center" min-width="90">
        <template slot-scope="scope">
          <i style="color: #67c23a;" v-show="scope.row.enabled" class="el-icon-success"></i>
          <i style="color: #ff4949;" v-show="!scope.row.enabled" class="el-icon-error"></i>
        </template>
      </el-table-column>
      <el-table-column label="执行次数" align="center" min-width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.total_run_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近执行时间" align="center" min-width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.last_run_at">{{ scope.row.last_run_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="150" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click.native="handUpdateTaskDailog(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handTaskLogDailog(scope.row)">日志</el-button>
          <el-button  type="danger" size="mini" @click="handleDeleteTask(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="TaskForm"  :title="dialogTaskFormTitle" width="1220px" :visible.sync="dialogTaskFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="taskForm" :rules="rules"  :model="task" label-position="right" label-width="130px" style="width: 1175px; margin:0;">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="任务名称：" prop="name" :error="name_error">
                <el-input v-model="task.name" style="width:260px;" ref="task_name_focus"></el-input>
              </el-form-item>
              <el-form-item label="任务命令：" prop="task">
                <el-radio-group v-model="task.task">
                  <el-radio label="命令" >Shell</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="执行对象类型：" prop="tgt_type" class="is-required">
                <el-row>
                  <el-radio-group v-model="task.tgt_type">
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
              <el-form-item label="执行对象：" prop="minion_list" v-show="task.tgt_type=='minion_list'" :error="minion_transfer_error" class="is-required">
                <el-transfer
                  ref="dataTransfer"
                  filterable
                  filter-placeholder="搜索Minion ID"
                  :titles="['Minion ID选择', '已选Minion ID']"
                  v-model="task.minion_list"
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
              <el-form-item  label='执行对象：' v-show="tgt_type_lable[task.tgt_type]"  prop="tgt" class="is-required">
                <el-input
                  :placeholder="tgt_type_placeholder[task.tgt_type]"
                  v-model="task.tgt"
                  clearable style="width:350px">
                </el-input>
              </el-form-item>
              <el-form-item label="启用：" prop="enabled">
                <el-switch v-model="task.enabled"></el-switch>
                <span v-show="!task.enabled" style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">提示：禁用最近执行时间会清空，只有启用才会显示</span>
              </el-form-item>
              <el-form-item label="命令：" prop="execute_cmd" class="is-required">
                <el-input type="textarea" v-model="task.execute_cmd"></el-input>
              </el-form-item>
              <el-form-item label="只运行一次：" prop="one_off">
                <el-switch v-model="task.one_off"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调度方式：" prop="scheduler">
                <el-radio-group v-model="task.scheduler">
                <el-radio label="Clocked">Clocked</el-radio>
                <el-radio label="Crontab">Crontab</el-radio>
                <el-radio label="Interval">Interval</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="task.scheduler+ '：'" :prop="task.scheduler.toLowerCase()" class="is-required" :error="scheduler_error">
                <el-select v-model="task.clocked" v-show="task.scheduler=='Clocked'" placeholder="请选择" class="is-required" style="width:260px;" >
                  <el-option
                    v-for="item in clocked_list"
                    :key="item.id"
                    :label="item.clocked_time | parseTime('{y}-{m}-{d} {h}:{i}')"
                    :value="item.id">
                  </el-option>
                </el-select>
                <el-select v-model="task.crontab" v-show="task.scheduler=='Crontab'" placeholder="请选择" class="is-required" style="width:350px;" >
                  <el-option
                    v-for="item in crontab_list"
                    :key="item.id"
                    :label="item.minute+' '+item.hour+' '+item.day_of_week+' '+item.day_of_month+' '+item.month_of_year+'(m/h/d/dM/MY) '+item.timezone"
                    :value="item.id">
                  </el-option>
                </el-select>
                <el-select v-model="task.interval" v-show="task.scheduler=='Interval'" placeholder="请选择" class="is-required" style="width:260px;" >
                  <el-option
                    v-for="item in interval_list"
                    :key="item.id"
                    :label="'every '+ item.every + ' ' + item.period"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="描述：" prop="description" >
                <el-input type="textarea" v-model="task.description" ></el-input>
              </el-form-item>
            </el-col> 
          </el-row>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="addLoading = false;dialogTaskFormVisible = false">关闭</el-button>
        <el-button type="primary" v-show="dialogTaskFormTitle=='新增Task'" @click="handleAddTask" :loading="addLoading">确 定</el-button>
        <el-button type="primary" v-show="dialogTaskFormTitle=='编辑Task'" @click="handleUpdateTask" :loading="updateLoading">更 新</el-button>
      </div>
    </el-dialog>

    <!-- 任务日志 -->
    <el-dialog v-el-drag-dialog :visible.sync="dialogInfoVisible" width="800px">
      <span slot="title" class="el-dialog__title">
        <span>{{ logTitle + ' 日志' }}</span>
        <el-button size="small" type="primary" @click="getLogList" style="margin-left:560px;" :loading="logLoading">刷新</el-button>
      </span>
      <el-row style="padding-bottom:10px;">
        <el-col :span="8" style="text-align:center;"><span style="font-weight:bold;">完成时间：</span><span>{{logData.date_done | parseTime('{y}-{m}-{d} {h}:{i}')}}</span></el-col>
        <el-col :span="8" style="text-align:center;"><span style="font-weight:bold;">任务状态：</span><span>{{logData.status}}</span></el-col>
      </el-row>
      <el-row>
        <pre class="taskLog_pre" v-loading="logLoading" v-html="logData.log" element-loading-spinner="el-icon-loading" element-loading-text="loading..." element-loading-background="rgba(0, 0, 0, 0.8)"></pre>
        <pagination style="margin:0;padding:10px 16px 10px 16px;" v-show="logTotal>0" :total="logTotal" :page.sync="logListQuery.page" :page_size.sync="logListQuery.page_size" layout="total, prev, pager, next, jumper" @pagination="getLogList" />
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogInfoVisible = false">确定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { addTask, updateTask, deleteTask, getTaskList, getCrontabList_nopage, getClockedList_nopage, getIntervalList_nopage, runTask, getTaskLogList } from '@/api/task'
import { getMinionIdList } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultTaskData = {
  id: '',
  name: '',
  task: '命令',
  enabled: true,
  one_off: false,
  interval: null,
  crontab: null,
  clocked: null,
  scheduler: 'Clocked',  // 调度方式，非提交参数
  execute_cmd: '',
  tgt: '',
  minion_list: [],
  tgt_type: '',
  description: ''
  
}


export default {
  name: 'TaskTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    var checkTgt = (rule, value, callback) => {
      if (this.task.tgt_type != 'any' && !value) {
        if(this.task.tgt_type != 'minion_list'){
          callback(new Error('请选择执行对象'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkTgtType = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择执行对象类型'));
      }else{
        callback();
      }
    };
    var checkScheduler = (rule, value, callback) => {
      if (this.task.scheduler == 'Clocked') {
        if(!value){
          this.scheduler_error = '请选择调度Clocked'
        }else{
          callback();
        }
      }else if(this.task.scheduler == 'Crontab'){
        if(!value){
          this.scheduler_error = '请选择调度Crontab'
        }else{
          callback();
        }
      }else if(this.task.scheduler == 'Interval'){
        if(!value){
          this.scheduler_error = '请选择调度Interval'
        }else{
          callback();
        }
      }else{
        callback();
      }
    };


    return {
      task: Object.assign({}, defaultTaskData),
      clocked_list: [],
      crontab_list: [],
      interval_list: [],
      dialogTaskFormVisible: false,
     
      // 表单验证
      rules: {
        name: {required: true, message: '不为空', trigger: 'blur'},
        tgt_type: {validator: checkTgtType, trigger: 'change'},
        tgt: {validator: checkTgt, trigger: 'change'},
        clocked: {validator: checkScheduler, trigger: 'change'},
        crontab: {validator: checkScheduler, trigger: 'change'},
        interval: {validator: checkScheduler, trigger: 'change'},
        execute_cmd: {required: true, message: '不为空', trigger: 'blur'},
      },
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        ordering: ''
      },
      allLoading: false,
      addLoading: false,
      updateLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      tgt_type: '',
      tgt_type_lable: {pcre: 'Minion正则：', custom_group:'自定义组：', grain: 'Grain：', grain_pcre: 'Grain正则：', ip_address: 'IP：'},
      // 用来对应真实后端tgt_type的
      post_tgt_type: {any: 'glob', minion_list: 'list', grain: 'grain', grain_pcre: 'grain_pcre', ip_address: 'ipcidr', pcre: 'pcre'},
      // 用来对前端tgt_type的
      get_tgt_type: {glob: 'any', list: 'minion_list', grain: 'grain', grain_pcre: 'grain_pcre', ipcidr: 'ip_address', pcre: 'pcre'},
      tgt_type_placeholder: {
        pcre: '正则匹配Minion id', 
        custom_group:'自定义组功能开发中。。。：', 
        grain: '例：os:CentOS 或os:Windows', 
        grain_pcre: '例：os:Cent*', 
        ip_address: 'ip/ip段，例：192.168.1.1 or 192.168.1.0/24'
      },
      minion_list: [],
      minion_transfer_error: '',
      scheduler_error: '',
      dialogTaskFormTitle: '新增Task',
      listLoading: true,
      name_error: '',
      logData: {},
      dialogInfoVisible: false,
      logListQuery: {
        page: 1,
        page_size: 1,
        task_name: '',
      },
      logTotal: 0,
      logTitle: '',
      logLoading: false,
      exeLoading: false,
    }
  },
  watch:{
    'task.tgt_type': {
      handler: function (val, oldVal) {
        if(this.minion_list.length === 0 && val === 'minion_list'){
          // 编辑Task我单独写获取minion-id的操作
          if(this.dialogTaskFormTitle != '编辑Task'){
            this.getIdList();
          }
          
        }
      }
    },
    'task.minion_list': {
      handler: function (val, oldVal) {
        if(val.length > 0 ){
          this.minion_transfer_error = ''
        }
      } 
    },
    'task.clocked': {
      handler: function (val, oldVal) {
        if(this.scheduler == 'Clocked' && val.length > 0 ){
          this.scheduler_error = ''
        }
      } 
    },
    'task.crontab': {
      handler: function (val, oldVal) {
        if(this.scheduler == 'Crontab' && val.length > 0 ){
          this.scheduler_error = ''
        }
      } 
    },
    'task.interval': {
      handler: function (val, oldVal) {
        if(this.scheduler == 'Interval' && val.length > 0 ){
          this.scheduler_error = ''
        }
      } 
    },
  },
  created() {
    this.getList()
    this.getClockedList()
    this.getCrontabList()
    this.getIntervalList()
    
  },
  methods: {
    // 获取Task时间列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getTaskList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        this.listLoading = false
      })
    },
    
    // 获取clocked列表
    async getClockedList() {
      try {
        const res = await getClockedList_nopage()
        this.clocked_list = res.data;
      }catch(err) {
        Message.error(err)
      }
    },

    // 获取crontab列表
    async getCrontabList() {
      try {
        const res = await getCrontabList_nopage()
        this.crontab_list = res.data;
      }catch(err) {
        Message.error(err)
      }
    },

    // 获取Interval列表
    async getIntervalList() {
      try {
        const res = await getIntervalList_nopage()
        this.interval_list = res.data;
      }catch(err) {
        Message.error(err)
      }
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

    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 清空新增Task弹出框临时数据
    resetTemp() {
      this.minion_list = [];
      this.$refs['taskForm'].resetFields()
    },
    // 新增Task弹出框
    handleAddTaskDailog(){
      this.dialogTaskFormTitle='新增Task'
      this.dialogTaskFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.$refs['task_name_focus'].focus();
      　this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['taskForm'].clearValidate()
        this.minion_transfer_error = ''
        this.scheduler_error = ''
        this.name_error = ''
        this.resetTemp()
      })
    },
    
    // 新增Task
    handleAddTask() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          let data = {...this.task}
          data.enabled = data.enabled ? 1:0
          data.one_off = data.one_off ? 1:0
          if(data.scheduler == 'Clocked'){
            delete data.interval
            delete data.crontab
          }else if(data.scheduler == 'Interval'){
            delete data.clocked
            delete data.crontab
          }else if(data.scheduler == 'Crontab'){
            delete data.clocked
            delete data.interval
          }
          if(data.tgt_type === 'minion_list'){
            if (data.minion_list.length) {
              data.tgt = []
              for(let minion of data.minion_list){
                data.tgt.push(minion)
              }
            }
            else {
              this.minion_transfer_error = '请至少选择一个Minion ID'
              return false;
            }
          }else if(data.tgt_type === 'any'){
            data.tgt = '*'
          }
          data.tgt_type = this.post_tgt_type[data.tgt_type]
          data.kwargs = JSON.stringify({"periodic_name":data.name,"tgt":data.tgt,"tgt_type":data.tgt_type,"execute_cmd":data.execute_cmd})
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.minion_transfer_error = ''
          this.scheduler_error = ''
          this.name_error = ''
          this.addLoading = true
          addTask(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogTaskFormVisible = false
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
          })
        } else{
          return false
        }
      });
      
    },

    // 编辑Task弹出框
    handUpdateTaskDailog(row){
      this.dialogTaskFormTitle = '编辑Task'
      let data = {...row}
      this.minion_transfer_error = ''
      this.scheduler_error = ''
      this.name_error = ''
      this.dialogTaskFormVisible = true

      // 弹窗数据填充,this.$nextTick会等待this.dialogTaskFormVisible = true即弹窗生成完成后再开始填充数据
      this.$nextTick(()=>{
        data.kwargs = JSON.parse(data.kwargs)
        data.tgt_type = this.get_tgt_type[data.kwargs.tgt_type]
        if(data.tgt_type == 'any'){
          data.tgt = ''
        }
        else if(data.tgt_type == 'minion_list'){
          data.minion_list = data.kwargs.tgt
          // 如果data.tgt_type == 'minion_list'那么data.kwargs.tgt肯定是个列表，
          // 不能把列表给data.tgt因为data.tgt赋值到 执行对象输入框 会报错（input输入框只能赋值字符串）
          data.tgt = ''
        }else{
          // 这里如果不是minion_list也要给他赋值一个空列表，因为我上面watch里有做data.minion_list的length判断
          data.minion_list = []
          data.tgt = data.kwargs.tgt
        }
        data.execute_cmd = data.kwargs.execute_cmd
        data.enabled = data.enabled?true:false
        data.one_off = data.one_off?true:false
        if(data.clocked){
          data.scheduler = 'Clocked'
        }else if(data.interval){
          data.scheduler = 'Interval'
        }else if(data.crontab){
          data.scheduler = 'Crontab'
        }
        
        this.task = data;
        
        // 穿梭框数据填充
        this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['taskForm'].clearValidate()

        let tmp_minion_list = this.task.minion_list
        this.task.minion_list = []
        getMinionIdList().then(response =>{
            const minionList = response.data.results;
            minionList.forEach((minion_id, index) => {
            this.minion_list.push({
              label: minion_id,
              key: minion_id
              });
            });
            this.task.minion_list = tmp_minion_list
        }).catch(error => {
          console.log('getMinionIdList' + error);
        })
      })
      
    },

     // 更新Task
    handleUpdateTask() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          let data = {...this.task}
          data.enabled = data.enabled ? 1:0
          data.one_off = data.one_off ? 1:0
          if(data.scheduler == 'Clocked'){
            data.interval = null
            data.crontab = null
          }else if(data.scheduler == 'Interval'){
            data.clocked = null
            data.crontab = null
          }else if(data.scheduler == 'Crontab'){
            data.clocked = null
            data.interval = null
          }
          if(data.tgt_type === 'minion_list'){
            if (data.minion_list.length) {
              data.tgt = []
              for(let minion of data.minion_list){
                data.tgt.push(minion)
              }
            }
            else {
              this.minion_transfer_error = '请至少选择一个Minion ID'
              return false;
            }
          }else if(data.tgt_type === 'any'){
            data.tgt = '*'
          }
          data.tgt_type = this.post_tgt_type[data.tgt_type]
          data.kwargs = JSON.stringify({"periodic_name":data.name,"tgt":data.tgt,"tgt_type":data.tgt_type,"execute_cmd":data.execute_cmd})
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.minion_transfer_error = ''
          this.scheduler_error = ''
          this.name_error = ''
          this.updateLoading = true
          updateTask(data).then(response => {
            if(response.data.status){
              this.updateLoading = false
              this.dialogTaskFormVisible = false
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
          })
        } else{
          return false
        }
      });
      
    },
    

    // 删除Task
    handleDeleteTask({ $index, row }){
      this.$confirm('确认要删除该Task吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try{
          await deleteTask(row.id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.data_list.splice($index, 1)
          this.getList()
        }catch(err) {
          this.listLoading = false
          console.log('删除Task' + err);
          this.$message({
            type: 'info',
            message: '删除Task' + err
          });  
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消'
        });       
      });
    },

    // 立即执行选中的Task
    handleRunTask(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何Task，请选择')
      }
      else{
        this.exeLoading = true
        let id_list = []
        for(var row of this.multipleSelection){
          id_list.push(row.id)
        }
        let data = {}
        data.id_list = id_list
        runTask(data).then(response => {
            if(response.data.status){
              Message.success(response.data.results)
            }
            else{
              let result_data = response.data.results
              console.log(JSON.stringify(result_data));
              Message.error(JSON.stringify(result_data))
            }
            this.exeLoading = false
          }).catch(error => {
            this.exeLoading = false
          })
      }
    },

    // 排序
    sortChange(data) {
      const { prop, order } = data
      if(prop === 'id'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'id'
        } else {
          this.listQuery.ordering = '-id'
        }
      }else if(prop === 'name'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'name'
        } else {
          this.listQuery.ordering = '-name'
        }
      }
      this.handleFilter()
    },

    // 结果格式化方法
    logFun(data,data_count) {
      if(!data) return;
      for (let k in data){
        let v = data[k];
        if(Object.prototype.toString.call(v) === '[object Object]'){
            this.logData.log  = this.logData.log + "<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.logFun(v,data_count+1)
        }else if(Object.prototype.toString.call(v) === '[object Array]'){
            this.logData.log  = this.logData.log +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.logFun(v,data_count+1)
        }else{
            this.logData.log  = this.logData.log +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.logData.log  = this.logData.log +"<p style='padding-left: "+(data_count+1)*25+"px;'>"+v+"</p>";
        }
      }
    },

    // 日志查询
    getLogList() {
      this.logLoading = true
      this.logData = {};
      getTaskLogList(this.logListQuery).then(response => {
        this.logData = response.data.results[0]
        this.logTotal = response.data.count
        if(this.logData !== undefined){
          if(Object.prototype.toString.call(JSON.parse(this.logData.result)) !== '[object String]'){
            let data_count = 0;
            let data = JSON.parse(this.logData.result)
            this.logData = {log: ''}
            for(let k in data){
              let v = data[k]
              // 因为只是执行的cmd.run其实大部分结果都是字符串，应该没有对象或者列表类型哈，但是在saltEXE页面就有
              if(Object.prototype.toString.call(v) === '[object Object]'){
                this.logData.log  = this.logData.log +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                this.logFun(v,data_count+1);
              }
              else if(Object.prototype.toString.call(v) === '[object Array]'){
                this.logData.log  = this.logData.log +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
                this.logFun(v,data_count+1);
                this.logData.log  = this.logData.log +'\n\n';
              }else{
                this.logData.log  = this.logData.log +"<p style='color: #3FB8AF;font-weight: bold;'>"+k+":</p>";
                this.logData.log  = this.logData.log +"<p style='padding-left: 25px;'>"+v+"</p>";
                this.logData.log  = this.logData.log +'\n\n';
              }
            }
          }
          else{
            this.logData = {log: ''}
            this.logData.log = this.logData.log + "<p style='color: #bf0000;'>"+JSON.parse(this.logData.result)+"</p>"
          }
        }
        else{
          this.logData = {log: '还未执行过'}
        }
        setTimeout(() => {
          this.logLoading = false
        }, 0.2 * 1000)
      }).catch(error => {
        console.log('任务日志查询' + error);
        this.logData = {log: ''}
        this.logData.log = this.logData.log + "<p style='color: #bf0000;'>"+error+"</p>"
        setTimeout(() => {
          this.logLoading = false
        }, 0.2 * 1000)
      })
    },

    // 日志弹出框
    handTaskLogDailog(row){
      this.logListQuery.page = 1;
      this.logListQuery.search = row.name;
      this.logTitle = row.name;
      this.getLogList()
      this.dialogInfoVisible = true;
    },

    

  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{

  // 弹出框的高度调整
  .TaskForm /deep/.el-dialog{
    margin-top: 5vh!important;
  }

  .taskLog_pre{
    font-size: 14px;
    font-size: inherit;
    resize: none;
    line-height: 100%;
    height: 520px;
    font-weight: bold;
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


</style>