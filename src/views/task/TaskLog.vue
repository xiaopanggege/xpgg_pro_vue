<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">
      <el-row class="">
          <el-button class="filter-item" type="primary" size="small" @click="handleMultipleDeleteDailog">批量删除</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="getList" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-input placeholder="任务名称" v-model="listQuery.search" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      <el-table-column label="ID" sortable="custom" prop="id"  align="center" min-width="40">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" sortable="custom" prop="task_name"  align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.task_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间"  align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.date_done | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态"  align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="150" >
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleTaskLogInfo(scope.row)">结果</el-button>
          <el-button type="danger" size="mini" @click="handleDeleteTaskLog(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog v-el-drag-dialog :visible.sync="dialogInfoVisible" :title="result_title" width="40%">
      <pre class="taskLog_pre"  ref="info_data" v-html="info_data"></pre>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogInfoVisible = false">确定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { deleteTaskLog, getTaskLogList, multipleDeleteTaskLog } from '@/api/task'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'


export default {
  name: 'TaskLog',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      taskLog: {},
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        ordering: '-id'
      },
      allLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
      info_data: '',
      result_title: '',
      dialogInfoVisible: false,
    }
  },
  watch:{
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取task日志列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getTaskLogList(this.listQuery).then(response => {
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
    

    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },


    // 删除Task日志
    handleDeleteTaskLog({ $index, row }){
      this.$confirm('确认要删除该记录吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try{
          await deleteTaskLog(row.id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.data_list.splice($index, 1)
          this.getList()
        }catch(err) {
          this.listLoading = false
          console.log('删除记录' + err);
          this.$message({
            type: 'info',
            message: '删除记录' + err
          });  
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消'
        });       
      });
    },

    // 批量删除日志
    handleMultipleDeleteDailog(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何记录，请选择')
      }
      else{
        let id_list = []
        for(var row of this.multipleSelection){
          id_list.push(row.id)
        }
        let data = {}
        data.id_list = id_list
        console.log(data);
        multipleDeleteTaskLog(data).then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.getList()
            }
            else{
              let result_data = response.data.results
              console.log(JSON.stringify(result_data));
              Message.error(JSON.stringify(result_data))
            }
          }).catch(error => {
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
      }else if(prop === 'task_name'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'task_name'
        } else {
          this.listQuery.ordering = '-task_name'
        }
      }
      this.handleFilter()
    },

    // 结果格式化方法
    info_fun(data,data_count) {
      if(!data) return;
      for (let k in data){
        let v = data[k];
        if(Object.prototype.toString.call(v) === '[object Object]'){
            this.info_data  = this.info_data + "<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.info_fun(v,data_count+1)
        }else if(Object.prototype.toString.call(v) === '[object Array]'){
            this.info_data  = this.info_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.info_fun(v,data_count+1)
        }else{
            this.info_data  = this.info_data +"<p style='color: #3FB8AF;padding-left: "+data_count*25+"px;'>"+k+":</p>";
            this.info_data  = this.info_data +"<p style='padding-left: "+(data_count+1)*25+"px;'>"+v+"</p>";
        }
      }
    },

    // 结果显示
    handleTaskLogInfo(row) {
      this.result_title = row.task_name
      this.info_data = ''
      if(Object.prototype.toString.call(JSON.parse(row.result)) !== '[object String]'){
        let data_count = 0;
        let data = JSON.parse(row.result)
        for(let k in data){
          let v = data[k]
          // 因为只是执行的cmd.run其实大部分结果都是字符串，应该没有对象或者列表类型哈，但是在saltEXE页面就有
          if(Object.prototype.toString.call(v) === '[object Object]'){
            this.info_data  = this.info_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
            this.info_fun(v,data_count+1);
          }
          else if(Object.prototype.toString.call(v) === '[object Array]'){
            this.info_data  = this.info_data +"<p style='color: #45ddd4;font-weight: bold;'>"+k+":</p>";
            this.info_fun(v,data_count+1);
            this.info_data  = this.info_data +'\n\n';
          }else{
            this.info_data  = this.info_data +"<p style='color: #3FB8AF;font-weight: bold;'>"+k+":</p>";
            this.info_data  = this.info_data +"<p style='padding-left: 25px;'>"+v+"</p>";
            this.info_data  = this.info_data +'\n\n';
          }
        }
      }
      else{
        this.info_data = ''
        this.info_data = this.info_data + "<p style='color: #bf0000;'>"+JSON.parse(row.result)+"</p>"
      }
      this.dialogInfoVisible = true
    },

  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{

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