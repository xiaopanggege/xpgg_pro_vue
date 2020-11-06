<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">

      <el-row class="saltminion_global">
          <el-button class="filter-item" type="primary" size="small" @click="handleupdateSaltCmdListDailog">命令采集</el-button>
          <el-button class="filter-item" type="danger" size="small" @click="handleDeleteSaltCmdList">清空命令</el-button>
        <div style="float:right;">
          <el-input placeholder="命令" v-model="listQuery.search" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-select v-model="listQuery.salt_cmd_type" clearable style="width: 140px" class="filter-item" placeholder="命令类型" @change="handleFilter">
            <el-option label="module" value="module"/>
            <el-option label="state" value="state"/>
            <el-option label="runner" value="runner"/>
          </el-select>
          <el-button v-waves class="filter-item"  type="primary" size="small" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        </div>        
      </el-row>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="data_list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="命令类型" prop="salt_cmd_type" sortable="custom"  align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.salt_cmd_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模块" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.salt_cmd_module }}</span>
        </template>
      </el-table-column>
      <el-table-column label="命令" prop="salt_cmd" sortable="custom"  align="center" width="200">
        <template slot-scope="scope">
          <span class="link-type" @click="handleSaltCmdInfo(scope.row)">{{ scope.row.salt_cmd }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源"  align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.salt_cmd_source }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近一次采集时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleSaltCmdInfo(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog v-el-drag-dialog title="采集选项" :visible.sync="dialogFormVisible" >
      <el-scrollbar style="height:100%">
      <el-form ref="dataForm"  :model="temp" label-position="right" label-width="130px" style="width: 800px; margin-left:50px;">
        <el-form-item label="命令类型:" prop="collection_style" class="is-required">
          <el-radio-group v-model="temp.collection_style">
          <el-radio label="module" border>module</el-radio>
          <el-radio label="state" border>state</el-radio>
          <el-radio label="runner" border>runner</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Minion id:" prop="minion_list" :error="minion_transfer_error" class="is-required">
          <el-transfer
            ref="dataTransfer"
            filterable
            filter-placeholder="搜索Minion ID"
            :titles="['Minion ID选择', '已选Minion ID']"
            v-model="temp.minion_list"
            :data="minion_list"
            target-order='push'>
            <span slot-scope="{ option }">
              <el-tooltip class="item" effect="light" :content="option.label" placement="right">
                <span>{{ option.label }}</span>
              </el-tooltip>
            </span>
          </el-transfer>
        </el-form-item>
      </el-form>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleupdateSaltCmdList">确 定</el-button>
      </div>
    </el-dialog>

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
import { getMinionIdList, getSaltCmdList, deleteSaltCmd, updateSaltCmdList } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'




export default {
  name: 'SaltCmdTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      listQuery:{
        page: 1,
        page_size: 10,
        salt_cmd_type:'',
        ordering: ''
      },
      allLoading:false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
      minion_list: [],
      temp: {
        minion_list: [],
        collection_style: 'module',
      },
      dialogFormVisible: false,
      dialogInfoVisible: false,
      infoTemp: {},
      minion_transfer_error: '',
    }
  },
  watch:{
    // 监听minion穿梭框是否选择至少一个minion，选择就取消错误提示
    'temp.minion_list': {
      handler: function (val, oldVal) {
        if(val.length > 0 ){
          this.minion_transfer_error = ''
        }
      } 
    },
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取salt命令集列表
    getList() {
      this.listLoading = true
      getSaltCmdList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取salt命令集列表' + error);
      })
    },
    // 获取salt命令集列表无loading
    getListNoloading() {
      getSaltCmdList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
      }).catch(error => {
        console.log('获取salt命令集列表无loading' + error);
      })
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
    // 清空命令采集弹出框临时数据
    resetTemp() {
      this.minion_list = []; 
      this.temp = {
        minion_list: [],
        collection_style: 'module',
      }
    },
    // 命令采集弹出框
    handleupdateSaltCmdListDailog(){
      this.resetTemp()
      this.getIdList()
      this.minion_transfer_error = '';
      this.dialogFormVisible = true
      this.$nextTick(()=>{
      　this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
      })
    },
    // 命令采集
    handleupdateSaltCmdList(){
        if (this.temp.minion_list.length) {
          this.minion_transfer_error = '';
          this.dialogFormVisible = false
          this.allLoading = true
          let data = this.temp
          data.minions = []
          this.temp.minion_list.forEach((minion) => {
            data.minions.push(minion)
          });
          updateSaltCmdList(data).then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.getListNoloading()
              this.allLoading = false
            }
            else{
              Message.error(response.data.results)
              this.allLoading = false
            }
          }).catch(error => {
            console.log('命令采集' + error);
          })
        }
        else {
          this.minion_transfer_error = '请至少选择一个Minion ID';
          return false;
        }
      
    },
    // 清空命令
    handleDeleteSaltCmdList(){
      this.$confirm('确认要情况?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.allLoading = true
          deleteSaltCmd().then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.getListNoloading()
              this.allLoading = false
            }
            else{
              Message.error(response.data.results)
              this.allLoading = false
            }
          }).catch(error => {
            console.log('清空命令' + error);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
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
      if (prop === 'salt_cmd_type') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'salt_cmd_type'
        } else {
          this.listQuery.ordering = '-salt_cmd_type'
        }
      }
      else if(prop === 'salt_cmd'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'salt_cmd'
        } else {
          this.listQuery.ordering = '-salt_cmd'
        }
      }
      this.handleFilter()
    },
    handleSaltCmdInfo(row) {
      this.infoTemp = {}
      this.infoTemp = Object.assign({}, row) // copy obj
      this.dialogInfoVisible = true
    },
  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .saltcmd-info-textarea /deep/ .el-textarea__inner{
    background-color: #000;
    color: #00B600;
    font-weight: bold;
    font-family: Menlo,Monaco,Consolas,"Courier New",monospace;
  }
}


</style>