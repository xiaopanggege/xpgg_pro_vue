<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">

      <el-row class="saltminion_global">
        <el-tooltip class="item" effect="dark" content="更新所有minion的grains数据，比较耗时" placement="bottom-start">
          <el-button class="filter-item"  type="primary" size="small" @click="handleupdateMinionList">更新列表</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="只更新所有minion的状态，速度较快" placement="bottom-start">
          <el-button class="filter-item"  type="primary" size="small" @click="handleupdateMinionStatus">更新状态</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="同步saltkey管理中的删除操作" placement="bottom-start">
          <el-button class="filter-item"  type="danger" size="small" @click="handleDeleteKeyList">批量删除</el-button>
        </el-tooltip>
        <div style="float:right;">
          <el-input placeholder="Minion_ID" v-model="listQuery.minion_id" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="IP" v-model="listQuery.ip" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-select v-model="listQuery.sys" clearable style="width: 140px" class="filter-item" placeholder="系统类型" @change="handleFilter">
            <el-option label="Linux" value="Linux"/>
            <el-option label="Windows" value="Windows"/>
          </el-select>
          <el-select v-model="listQuery.minion_status" clearable style="width: 140px" class="filter-item" placeholder="状态" @change="handleFilter">
            <el-option label="在线" value="在线"/>
            <el-option label="离线" value="离线"/>
            <el-option label="异常" value="异常"/>
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
      @selection-change="handleSelectionChange"
      class="saltminion_table">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="MinionID" prop="minion_id" sortable="custom"  align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.minion_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ip" sortable="custom"  align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="系统类型"  align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.sys }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Minion版本"  align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.minion_version }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近一次更新时间" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.minion_status === '在线'" class="status_success">在线</span>
            <span v-else-if="scope.row.minion_status === '离线'" class="status_danger">离线</span>
            <span v-else class="status_waring">异常</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleupdateMinion(scope.row.minion_id)">更新</el-button>
          <el-button type="primary" size="mini" @click="handleMinionInfo(scope.row)">详情</el-button>
          <el-button type="danger" size="mini" @click="handleDeleteKey(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog v-el-drag-dialog :title="`MinionID ${temp.minion_id} 详细信息`" :visible.sync="dialogFormVisible" >
      <el-scrollbar style="height:100%">
      <el-form ref="dataForm"  :model="temp" label-position="right" label-width="130px" style="width: 800px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="MinionID" prop="minion_id">
          <el-input readonly v-model="temp.minion_id"/>
          </el-form-item>
          <el-form-item label="IP" prop="ip">
            <el-input type="textarea" autosize readonly v-model="temp.ip"/>
          </el-form-item>
          <el-form-item label="Minion版本" prop="minion_version">
            <el-input readonly v-model="temp.minion_version"/>
          </el-form-item>
          <el-form-item label="系统版本" prop="system_issue">
            <el-input readonly v-model="temp.system_issue"/>
          </el-form-item>
          <el-form-item label="SN序列号" prop="sn">
            <el-input type="textarea" autosize readonly v-model="temp.sn"/>
          </el-form-item>
          <el-form-item label="CPU个数" prop="cpu_num">
            <el-input readonly v-model="temp.cpu_num"/>
          </el-form-item>
          <el-form-item label="CPU型号" prop="cpu_model">
            <el-input readonly v-model="temp.cpu_model"/>
          </el-form-item>
          <el-form-item label="系统类型" prop="sys">
            <el-input readonly v-model="temp.sys"/>
          </el-form-item>
          <el-form-item label="内核版本" prop="kernel">
            <el-input readonly v-model="temp.kernel"/>
          </el-form-item>
          <el-form-item label="品牌名称" prop="product_name">
            <el-input readonly v-model="temp.product_name"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="IPv4地址" prop="ipv4_address">
            <el-input type="textarea" autosize readonly v-model="temp.ipv4_address"/>
          </el-form-item>
          <el-form-item label="MAC地址" prop="mac_address">
            <el-input type="textarea" autosize readonly v-model="temp.mac_address"/>
          </el-form-item>
          <el-form-item label="主机名" prop="localhost">
            <el-input readonly v-model="temp.localhost"/>
          </el-form-item>
          <el-form-item label="内存大小(M)" prop="mem_total">
            <el-input readonly v-model="temp.mem_total"/>
          </el-form-item>
          <el-form-item label="创建时间" prop="create_date">
            <el-date-picker readonly v-model="temp.create_date" type="datetime"/>
          </el-form-item>
          <el-form-item label="最近一次更新时间" prop="update_time">
            <el-date-picker readonly v-model="temp.update_time" type="datetime"/>
          </el-form-item>
        </el-col>
      </el-row>
      </el-form>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getSaltMinionList, updateMinionList, updateMinionStatus, deleteSaltKey, updateMinion } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'




export default {
  name: 'SaltMinionTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    return {
      listQuery:{
        page: 1,
        page_size: 10,
        minion_id:'',
        ip:'',
        sys:'',
        minion_status:'',
        ordering: ''
      },
      allLoading:false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
      temp: {
        minion_id: '',
        ip: '',
        minion_version: '',
        system_issue: '',
        sn: '',
        cpu_num: '',
        cpu_model: '',
        sys: '',
        kernel: '',
        product_name: '',
        ipv4_address: '',
        mac_address: '',
        localhost: '',
        mem_total: '',
        create_date: new Date(),
        update_time: new Date(),
        minion_status: '',
        description: '',
      },
      dialogFormVisible: false,
    }
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取minion列表
    getList() {
      this.listLoading = true
      getSaltMinionList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取minion列表' + error);
      })
    },
    // 获取minion列表不需要loading的
    getListNoLoading() {
      getSaltMinionList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
      }).catch(error => {
        console.log('获取minion列表不需要loading的' + error);
      })
    },
    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 更新列表
    handleupdateMinionList(){
      this.$confirm('此操作为耗时操作将获取所有minion的状态及grains信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.allLoading = true
          updateMinionList().then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.getListNoLoading()
              this.allLoading = false
            }
            else{
              Message.error(response.data.results)
              this.allLoading = false
            }
          }).catch(error => {
            console.log('更新列表' + error);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '操作取消'
          });          
        });
    },
    // 更新状态
    handleupdateMinionStatus(){
      this.allLoading = true
      updateMinionStatus().then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.getListNoLoading()
          this.allLoading = false
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('更新状态' + error);
      })
    },

    // 更新单个minion
    handleupdateMinion(minion_id){
      this.listLoading = true
      updateMinion(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.getList()
          this.listLoading = false
        }
        else{
          Message.error(response.data.results)
          this.listLoading = false
        }
      }).catch(error => {
        console.log('更新单个minion' + error);
      })
    },

    // 删除key基类方法
    deleteKey(minion_id){
      deleteSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.getList()
        }
        else{
          Message.error(response.data.results)
        }
      }).catch(error => {
        console.log('删除key基类方法' + error);
      })
    },
    // 删除key基类方法调用不需要loading的
    deleteKeyNoLoading(minion_id){
      deleteSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.getListNoLoading()
          this.allLoading = false
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('删除key基类方法调用不需要loading的' + error);
      })
    },
    // 删除单个key
    handleDeleteKey(row){
      this.$confirm('确认要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let minion_id = [row.minion_id]
          this.deleteKey(minion_id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    // 批量删除key
    handleDeleteKeyList(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何记录，请选择后重试')
      }
      else{
        this.$confirm('确认要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.allLoading = true
          let minion_id = []
          for(let data of this.multipleSelection.values()){
            minion_id.push(data.minion_id)
          }
          this.deleteKeyNoLoading(minion_id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'minion_id') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'minion_id'
        } else {
          this.listQuery.ordering = '-minion_id'
        }
      }
      else if(prop === 'ip'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'ip'
        } else {
          this.listQuery.ordering = '-ip'
        }
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        minion_id: '',
        ip: '',
        minion_version: '',
        system_issue: '',
        sn: '',
        cpu_num: '',
        cpu_model: '',
        sys: '',
        kernel: '',
        product_name: '',
        ipv4_address: '',
        mac_address: '',
        localhost: '',
        mem_total: '',
        create_date: new Date(),
        update_time: new Date(),
        minion_status: '',
        description: '',
      }
    },
    handleMinionInfo(row) {
      this.resetTemp()
      this.temp = Object.assign({}, row) // copy obj
      this.temp.create_date = new Date(this.temp.create_date)
      this.temp.update_time = new Date(this.temp.update_time)
      this.dialogFormVisible = true
    },
  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .saltminion_table{
    .status_success {
        color: #40c984;
      }
      .status_danger {
        color: #f4516c;
      }
      .status_waring {
        color: #f4ce51;
      }
  }

}


</style>