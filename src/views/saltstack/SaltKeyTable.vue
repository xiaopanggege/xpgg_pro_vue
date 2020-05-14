<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">

      <el-row :gutter="40" class="panel-group">
        <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" :class="{cardselected:'accepted'===certification_status}" @click="handleGetList('accepted')">
            <div class="card-panel-icon-wrapper icon-accepted">
              <svg-icon icon-class="peoples" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description icon-accepted">
              <div class="card-panel-text">已认证KEYS</div>
              <span  class="card-panel-num">{{ saltkey_count.accepted_count }}</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" :class="{cardselected:'unaccepted'===certification_status}" @click="handleGetList('unaccepted')">
            <div class="card-panel-icon-wrapper icon-unaccepted">
              <svg-icon icon-class="peoples" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description icon-unaccepted">
              <div class="card-panel-text">待认证KEYS</div>
              <span  class="card-panel-num">{{ saltkey_count.unaccepted_count }}</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" :class="{cardselected:'denied'===certification_status}" @click="handleGetList('denied')">
            <div class="card-panel-icon-wrapper icon-denied">
              <svg-icon icon-class="peoples" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description icon-denied">
              <div class="card-panel-text">未被允许KEYS</div>
              <span  class="card-panel-num">{{ saltkey_count.denied_count }}</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
          <div class="card-panel" :class="{cardselected:'rejected'===certification_status}" @click="handleGetList('rejected')">
            <div class="card-panel-icon-wrapper icon-rejected">
              <svg-icon icon-class="peoples" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description icon-rejected">
              <div class="card-panel-text">已拒绝KEYS</div>
              <span  class="card-panel-num">{{ saltkey_count.rejected_count }}</span>
            </div>
          </div>
        </el-col>
      </el-row>


      <el-row class="saltkey_global">
        <span  class="saltkey_tag1 filter-item">全局操作：</span>
        <el-button class="filter-item"  type="primary" size="small" @click="handleFlushKey">刷新列表</el-button>
        <el-tooltip class="item" effect="dark" content="只接受已认证和待认证的KEY" placement="top">
          <el-button class="filter-item"  type="primary" size="small" @click="handleAcceptAllKey">接受所有</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="未被允许的KEY无法全局删除" placement="top">
          <el-button class="filter-item"  type="danger" size="small" @click="handleDeleteAllKey">删除所有</el-button>
        </el-tooltip>
        <span  class="saltkey_tag1 filter-item">批量操作：</span>
        <el-button class="filter-item"  type="primary" size="small" v-show="certification_status==='unaccepted'" @click="handleAcceptKeyList">批量接受</el-button>
        <el-button class="filter-item"  type="primary" size="small" v-show="certification_status==='unaccepted'" @click="handleRejectKeyList">批量拒绝</el-button>
        <el-button class="filter-item"  type="danger" size="small" @click="handleDeleteKeyList">批量删除</el-button>
        <div style="float:right;">
          <el-input placeholder="Minion_ID" v-model="listQuery.search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
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
      @selection-change="handleSelectionChange"
      class="saltkey_table">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="MinionID"  align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.minion_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="KEY状态" width="100px" align="center">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium" :class="'icon-'+certification_status">{{ scope.row.certification_status }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最近一次更新时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="测试结果" width="150px" align="center" v-show="certification_status==='accepted'">
        <template slot-scope="scope">
          <el-button size="mini" v-show="scope.row.show" :type="testButtion[scope.row.minion_id]" :icon="testIcon[scope.row.minion_id]" circle></el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" v-show="certification_status==='accepted'" :loading="testLoading[scope.row.minion_id]" @click="handleTestKey(scope.row)">测试</el-button>
          <el-button type="success" size="mini" v-show="certification_status==='unaccepted'" @click="handleAcceptKey(scope.row)">接受</el-button>
          <el-button type="warning" size="mini" v-show="certification_status==='unaccepted'" @click="handleRejectKey(scope.row)">拒绝</el-button>
          <el-button type="danger" size="mini" @click="handleDeleteKey(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />


  </div>
</template>

<script>
import { getSaltKeyList, flushSaltKeyList, acceptSaltKey, deleteSaltKey, rejectSaltKey, deleteDeniedSaltKey, testSaltKey } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'



export default {
  name: 'SaltKeyTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      testLoading:{},
      testIcon:{},
      testButtion:{},
      certification_status: '',
      tableKey: 0,
      data_list: null,
      total: 0,
      saltkey_count:{},
      multipleSelection:[],
      listLoading: true,
      allLoading:false,
    }
  },
  computed: {
    listQuery(){
      return {
        certification_status:this.certification_status,
        page: 1,
        page_size: 10,
        // sort: '+id'
      }
    },
  },
  created() {
    this.certification_status = 'accepted'
    this.getList()
    
  },
  methods: {
    // 获取saltkey列表
    getList() {
      this.listLoading = true
      getSaltKeyList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        this.saltkey_count = response.data.msg
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        console.log('获取saltkey列表' + error);
      })
    },
    // 大标题KEY状态选择
    handleGetList(status) {
      if(this.certification_status!=status){
        this.certification_status = status
        // this.listQuery.certification_status = status
        this.getList()
      }
    },
    // 搜索框操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 全局刷新列表
    handleFlushKey(){
      this.allLoading = true
      flushSaltKeyList().then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.certification_status = 'accepted'
          this.getList()
          this.allLoading = false
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('全局刷新列表' + error);
      })
    },

    // 接受key基类方法
    acceptKey(minion_id){
      this.allLoading = true
      acceptSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.allLoading = false
          this.getList()
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('接受key基类方法' + error);
      })
    },
    // 接受所有key
    handleAcceptAllKey(){
      let minion_id = ["*"]
      this.acceptKey(minion_id)
    },
    // 接受单个key
    handleAcceptKey(row){
      let minion_id = [row.minion_id]
      this.acceptKey(minion_id)
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 批量接受key
    handleAcceptKeyList(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何记录，请选择后重试')
      }
      else{
        let minion_id = []
        for(let data of this.multipleSelection.values()){
          minion_id.push(data.minion_id)
        }
        this.acceptKey(minion_id)
      }
    },
    // 删除key基类方法
    deleteKey(minion_id){
      this.allLoading = true
      deleteSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.allLoading = false
          this.getList()
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('删除key基类方法' + error);
      })
    },
    // 删除denied key基类方法
    deleteDeniedKey(minion_id){
      this.allLoading = true
      deleteDeniedSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.allLoading = false
          this.getList()
        }
        else{
          Message.error(response.data.results)
          this.allLoading = false
        }
      }).catch(error => {
        console.log('删除denied key基类方法' + error);
      })
    },
    // 删除所有key
    handleDeleteAllKey(){
      this.$confirm('此操作将删除除未被允许KEYS以外所有KEYS, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let minion_id = ["*"]
          this.deleteKey(minion_id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    // 删除单个key
    handleDeleteKey(row){
      this.$confirm(' 确认要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let minion_id = [row.minion_id]
          if(this.certification_status === 'denied'){
            this.deleteDeniedKey(minion_id)
          }
          else{
            this.deleteKey(minion_id)
          }
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
          let minion_id = []
          for(let data of this.multipleSelection.values()){
            minion_id.push(data.minion_id)
          }
          if(this.certification_status === 'denied'){
            this.deleteDeniedKey(minion_id)
          }
          else{
            this.deleteKey(minion_id)
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
    },
    // 拒绝key基类方法
    rejectKey(minion_id){
      rejectSaltKey(minion_id).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.getList()
        }
        else{
          Message.error(response.data.results)
        }
      }).catch(error => {
        console.log('拒绝key基类方法' + error);
      })
    },
    // 批量拒绝
    handleRejectKeyList(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何记录，请选择后重试')
      }
      else{
        let minion_id = []
        for(let data of this.multipleSelection.values()){
          minion_id.push(data.minion_id)
        }
        this.rejectKey(minion_id)
      }
    },
    // 拒绝单个key
    handleRejectKey(row){
      let minion_id = [row.minion_id]
      this.rejectKey(minion_id)
    },
    // 测试test.ping
    handleTestKey(row){
      this.$set(this.testIcon, row.minion_id, 'el-icon-loading')
      this.$set(this.testButtion, row.minion_id, '')
      row.show = 1;
      this.$set(this.testLoading, row.minion_id, true)
      testSaltKey(row.minion_id).then(response => {
        if(response.data.status){
          if(response.data.results[row.minion_id]){
            this.$set(this.testIcon, row.minion_id, 'el-icon-check')
            this.$set(this.testButtion, row.minion_id, 'success')
            Message.success(`${row.minion_id}：${response.data.results[row.minion_id]}`)
            this.$set(this.testLoading, row.minion_id, false)
          }
          else{
            this.$set(this.testIcon, row.minion_id, 'el-icon-close')
            this.$set(this.testButtion, row.minion_id, 'danger')
            Message.error(`${row.minion_id}：${response.data.results[row.minion_id]}`)
            this.$set(this.testLoading, row.minion_id, false)
          }          
        }
        else{
          this.$set(this.testIcon, row.minion_id, 'el-icon-close')
          this.$set(this.testButtion, row.minion_id, 'danger')
          Message.error(`${row.minion_id}：${response.data.results[row.minion_id]}`)
          this.$set(this.testLoading, row.minion_id, false)
        }
      }).catch(error => {
        console.log('测试test.ping' + error);
      })
    }
  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .saltkey_tag1{
    color: #0063DC;
    background-color: azure;
    padding: 9px 20px;
  }

  .panel-group {
    margin-top: 18px;
    .card-panel-col{
      margin-bottom: 32px;
    }
    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      background: #d2f1f1;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);
      border-radius: 10px;
      &:hover {
        background: #d2e6e6;
      }
      .icon-accepted {
        color: #40c984;
      }
      .icon-unaccepted {
        color: #36a3f7;
      }
      .icon-denied {
        color: #f4ce51;
      }
      .icon-rejected {
        color: #f4516c;
      }
      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }
      .card-panel-icon {
        float: left;
        font-size: 48px;
      }
      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;
        .card-panel-text {
          line-height: 18px;
          // color: rgba(51, 155, 82, 0.45);
          font-size: 20px;
          margin-bottom: 12px;
        }
        .card-panel-num {
          font-size: 20px;
        }
      }
    }
    .cardselected{
      background: #b2eba7!important ;
    }
  }
  .saltkey_table{
    .icon-accepted {
        color: #40c984;
      }
      .icon-unaccepted {
        color: #36a3f7;
      }
      .icon-denied {
        color: #f4ce51;
      }
      .icon-rejected {
        color: #f4516c;
      }
  }
}


</style>