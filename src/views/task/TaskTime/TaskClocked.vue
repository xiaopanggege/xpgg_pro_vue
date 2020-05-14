<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">
      <el-row class="">
          <el-button class="filter-item" type="primary" size="small" @click="handleAddClockedDailog">新增日期时间</el-button>
        <div style="float:right;">
          <el-date-picker
            class="filter-item"
            v-model="listQuery.search"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
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
      <el-table-column label="日期时间" prop="clocked_time" sortable="custom" align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.clocked_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="50" >
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="handleDeleteClocked(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="ClockedForm"  :title="dialogClockedFormTitle" width="520px" :visible.sync="dialogClockedFormVisible" :close-on-click-modal="false" >
      
      <div>
        <el-form ref="dateForm" :rules="rules"  :model="date" label-position="right" label-width="80px" style="width: 375px; margin:0;">
          <el-row :gutter="10">
              <el-form-item label="时间：" prop="clocked_time" :error="clocked_time_error">
                  <el-date-picker
                    v-model="date.clocked_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    value-format="yyyy-MM-dd HH:mm:ss">
                  </el-date-picker>
              </el-form-item>
          </el-row>
        </el-form>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="addLoading = false;dialogClockedFormVisible = false">关闭</el-button>
        <el-button type="primary"  @click="handleAddClocked" :loading="addLoading">确 定</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { addClocked, getClockedList, deleteClocked } from '@/api/task'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'

const defaultClockedData = {
  id: '',
  clocked_time:'',
  
}


export default {
  name: 'TaskClocked',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      date: Object.assign({}, defaultClockedData),
      clocked_time_error:'',
      dialogClockedFormVisible: false,
     
      // 表单验证
      rules: {
        clocked_time: {required: true, message: '请选择日期时间', trigger: 'blur'},
      },
      listQuery:{
        page: 1,
        // page_size: 20,
        page_size: 10,
        clocked_time:'',
        id:'',
        ordering: ''
      },
      allLoading: false,
      addLoading: false,
      deleteLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
      dialogClockedFormTitle:'新增Clocked',
      dialogDeleteAppVisible: false,
    }
  },
  watch:{
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取日期时间列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      getClockedList(this.listQuery).then(response => {
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

    // 清空新增日期时间弹出框临时数据
    resetTemp() {
      this.$refs['dateForm'].resetFields()
    },
    // 新增日期时间弹出框
    handleAddClockedDailog(){
      this.dialogClockedFormTitle = '新增日期时间'
      this.clocked_time_error = '';
      this.dialogClockedFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.$refs['dateForm'].clearValidate()
      })
    },
    
    // 新增日期时间
    handleAddClocked() {
      this.$refs['dateForm'].validate((valid) => {
        if (valid) {
          let data = {...this.date}
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.clocked_time_error = ''
          this.addLoading = true
          addClocked(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogClockedFormVisible = false
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
    handleDeleteClocked({ $index, row }){
      this.$confirm('确认要删除该日期时间吗?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        this.listLoading = true
        console.log(row);
        try{
          await deleteClocked(row.id)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.data_list.splice($index, 1)
          this.getList()
        }catch(err) {
          this.listLoading = false
          console.log('删除日期时间' + err);
          this.$message({
            type: 'info',
            message: '删除日期时间' + err
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
      if (prop === 'clocked_time') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'clocked_time'
        } else {
          this.listQuery.ordering = '-clocked_time'
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

  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  

  // 弹出框的高度调整
  .ClockedForm /deep/.el-dialog{
    margin-top: 5vh!important;
  }

}


</style>