<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">
      <el-row class="">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddIntervalDailog">新增Interval</el-button>
        <div style="float:right;">
          <el-input placeholder="ID" v-model="listQuery.id" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      <el-table-column label="ID" sortable="custom"  align="center" min-width="40">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="INTERVAL" align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ 'every '+ scope.row.every + ' ' + scope.row.period }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="50" >
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="handleDeleteInterval(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="IntervalForm"  title="新增Interval" width="620px" :visible.sync="dialogIntervalFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="intervalForm" :rules="rules"  :model="interval" label-position="right" label-width="170px" style="width: 475px; margin:0;">
          <el-row :gutter="10">
              <el-form-item label="Every：" prop="every" >
                <el-input-number v-model="interval.every" controls-position="right"  :min="1" ></el-input-number>
              </el-form-item>
              <el-form-item label="Interval Period" prop="period">
                <el-select v-model="interval.period" >
                  <el-option label="Days" value="days"></el-option>
                  <el-option label="Hours" value="hours"></el-option>
                  <el-option label="Minutes" value="minutes"></el-option>
                  <el-option label="Seconds" value="seconds"></el-option>
                  <el-option label="Microseconds" value="microseconds"></el-option>
                </el-select>
              </el-form-item>
          </el-row>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="addLoading = false;dialogIntervalFormVisible = false">关闭</el-button>
        <el-button type="primary"  @click="handleAddInterval" :loading="addLoading">确 定</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { addInterval, deleteInterval, getIntervalList } from '@/api/task'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultIntervalData = {
  id: '',
  every: 1,
  period: ''
  
}


export default {
  name: 'TaskInterval',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      interval: Object.assign({}, defaultIntervalData),
      dialogIntervalFormVisible: false,
     
      // 表单验证
      rules: {
        every: {required: true, message: '不为空', trigger: 'blur'},
        period: {required: true, message: '不为空', trigger: 'change'},
      },
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        ordering: ''
      },
      allLoading: false,
      addLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
    }
  },
  watch:{
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取Interval时间列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getIntervalList(this.listQuery).then(response => {
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

    // 清空新增Interval弹出框临时数据
    resetTemp() {
      this.$refs['intervalForm'].resetFields()
    },
    // 新增Interval弹出框
    handleAddIntervalDailog(){
      this.dialogIntervalFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.$refs['intervalForm'].clearValidate()
      })
    },
    
    // 新增Interval
    handleAddInterval() {
      this.$refs['intervalForm'].validate((valid) => {
        if (valid) {
          let data = {...this.interval}
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.clocked_time_error = ''
          this.addLoading = true
          addInterval(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogIntervalFormVisible = false
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
    

    // 删除应用授权
    handleDeleteInterval({ $index, row }){
      this.$confirm('确认要删除该Interval吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        try{
          await deleteInterval(row.id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.data_list.splice($index, 1)
          this.getList()
        }catch(err) {
          this.listLoading = false
          console.log('删除Interval' + err);
          this.$message({
            type: 'info',
            message: '删除Interval' + err
          });  
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消'
        });       
      });
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
      }
      this.handleFilter()
    },

  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{

  // 弹出框的高度调整
  .IntervalForm /deep/.el-dialog{
    margin-top: 5vh!important;
  }

}


</style>