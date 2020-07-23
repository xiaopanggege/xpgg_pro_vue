<template>
  <div class="app-container" v-loading="allLoading">
    <div class="filter-container">

      <el-row>
          <el-button class="filter-item" type="primary" size="small" @click="handAddReleaseDailog">新增应用</el-button>
          <el-button class="filter-item" type="success" size="small" @click="handGoReleaseList">批量发布</el-button>
          <el-button class="filter-item" type="primary" size="small" @click="getList" :loading="listLoading">刷新</el-button>
        <div style="float:right;">
          <el-input placeholder="应用名称" v-model="listQuery.app_name" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="Minion ID" v-model="listQuery.minion_id" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
          <el-input placeholder="svn/git地址" v-model="listQuery.app_url" style="width: 150px;"  class="filter-item" @keyup.enter.native="handleFilter"/>
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
      class="release_table">
      <el-table-column type="selection" align="center" width="55">
      </el-table-column>
      <el-table-column label="应用名称" prop="app_name" sortable="custom"  align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.app_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Minion_id" prop="minion_list" sortable="custom" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.minion_list }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作步骤"   align="center" min-width="350">
        <template slot-scope="scope">
          <span v-for="(operation, index) in JSON.parse(scope.row.operation_list)" :key="index"><span class="link-type" @click="handleSingleRelease(scope.row,operation)">{{ operation }}</span><span v-if="index!=JSON.parse(scope.row.operation_list).length-1">>></span></span>
          
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="250" >
        <template slot-scope="scope">
          <!-- <el-button type="primary" size="mini" @click="handUpdateReleaseDailog(scope.row)">编辑</el-button> -->
          <el-button type="success" size="mini" @click="handGoRelease(scope.row)">发布</el-button>
          <!-- <el-button type="primary" size="mini" @click="handAppInfoDailog(scope.row)">详情</el-button> -->
          <!-- <el-button type="danger" size="mini" @click="handDeleteAppDailog(scope.row)">删除</el-button> -->
          <el-button type="primary" size="mini" @click="handAppLogDailog(scope.row)">日志</el-button>
          <el-dropdown  trigger="click" placement="bottom-start" style="margin-left: 10px;">
            <el-button type="primary" size="mini">
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handAppInfoDailog(scope.row)">详情</el-dropdown-item>
              <el-dropdown-item @click.native="handUpdateReleaseDailog(scope.row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handDeleteAppDailog(scope.row)">删除</el-dropdown-item>
              <el-dropdown-item>备份</el-dropdown-item>
              <el-dropdown-item>还原</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" width="150" align="center">
        <template slot-scope="scope">
            <span v-if="scope.row.release_status === '发布成功'" class="status_success">发布成功</span>
            <span v-else-if="scope.row.release_status === '发布中'" class="status_loading">发布中<span class="dot-ani"></span></span>
            <span v-else-if="scope.row.release_status === '发布失败'" class="status_error">发布失败</span>
            <span v-else-if="scope.row.release_status === '空闲'" class="status_info">空闲</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :page_size.sync="listQuery.page_size" @pagination="getList" />

    <el-dialog class="AppForm"  :title="dialogAppFormTitle" width="1220px" :visible.sync="dialogAppFormVisible"  :close-on-press-escape="false" :close-on-click-modal="false">
      
      <div class="overflow_set">
        <el-form ref="appDataForm" :rules="rules"  :model="appData" label-position="right" label-width="130px" style="width: 1175px; margin:0;">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="应用名称：" prop="app_name" :error="app_name_error">
                <el-input v-model="appData.app_name" style="width:260px;" ref="app_name_focus"></el-input>
              </el-form-item>
              <el-form-item label="系统类型：" prop="sys_type">
                <el-radio-group v-model="appData.sys_type" @change="getIdList">
                <el-radio label="linux">Linux</el-radio>
                <el-radio label="windows">Windows</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Minion id：" prop="minion_list" :error="minion_transfer_error" class="is-required">
                <el-transfer
                  ref="dataTransfer"
                  filterable
                  filter-placeholder="搜索Minion ID"
                  :titles="['Minion ID选择', '已选Minion ID']"
                  v-model="appData.minion_list"
                  :data="minion_list"
                  target-order='push'>
                  <span slot-scope="{ option }">
                    <el-tooltip class="item" effect="light" :content="option.label" placement="right">
                      <span>{{ option.label }}</span>
                    </el-tooltip>
                  </span>
                </el-transfer>
              </el-form-item>
              <el-form-item label="应用目录：" prop="app_path">
                <el-input v-model="appData.app_path" style="width:440px;"></el-input>
              </el-form-item>
              <el-form-item label="目录属主：" prop="app_path_owner" v-show="appData.sys_type == 'linux'" class="is-required">
                <el-input v-model="appData.app_path_owner" style="width:140px;"></el-input>
              </el-form-item>
              <el-form-item label="svn地址：" prop="app_svn_url" v-show="appData.operation_list.indexOf('SVN更新') != -1" class="is-required">
                <el-input v-model="appData.app_svn_url" style="width:440px;"></el-input>
              </el-form-item>
              <el-row>
                <el-col :span="11">
                  <el-form-item label="svn账户：" prop="app_svn_user" v-show="appData.operation_list.indexOf('SVN更新') != -1" class="is-required">
                    <el-input v-model="appData.app_svn_user" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="11">
                  <el-form-item label="svn密码：" prop="app_svn_password" label-width="90px" v-show="appData.operation_list.indexOf('SVN更新') != -1" class="is-required">
                    <el-input type="password" auto-complete="off" v-model="appData.app_svn_password" ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="git地址：" prop="app_git_url" v-show="appData.operation_list.indexOf('GIT更新') != -1" class="is-required">
                <el-input v-model="appData.app_git_url" style="width:440px;"></el-input>
              </el-form-item>
              <el-row>
                <el-col :span="11">
                  <el-form-item label="git账户：" prop="app_git_user" v-show="appData.operation_list.indexOf('GIT更新') != -1" class="is-required">
                    <el-input v-model="appData.app_git_user" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="11">
                  <el-form-item label="git密码：" prop="app_git_password" label-width="90px" v-show="appData.operation_list.indexOf('GIT更新') != -1" class="is-required">
                    <el-input type="password" auto-complete="off" v-model="appData.app_git_password" ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="git分支：" prop="app_git_branch" v-show="appData.operation_list.indexOf('GIT更新') != -1" class="is-required">
                <el-input v-model="appData.app_git_branch" style="width:240px;"></el-input>
              </el-form-item>
              <el-form-item label="svn/git检出目录：" prop="co_path" v-show="dialogAppFormTitle=='应用发布详情'">
                <el-input   v-model="appData.co_path"></el-input>
              </el-form-item>
              <el-form-item label="检出状态：" prop="co_status" v-show="dialogAppFormTitle=='应用发布详情'">
                <el-input   v-model="appData.co_status"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="多主机执行顺序：" label-width="140px" prop="execution_style">
                <el-radio-group v-model="appData.execution_style">
                <el-radio label="serial">顺序</el-radio>
                <el-tooltip class="item" effect="dark" content="开发中..." placement="top-start">
                  <el-radio label="parallel" disabled>并行</el-radio>
                </el-tooltip>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="操作选择：" prop="operation_list" class="operationTransferClass is-required" :error="operation_transfer_error" >
                <el-transfer
                  ref="operationTransfer"
                  :titles="['可选操作', '选中操作 有序']"
                  v-model="appData.operation_list"
                  :data="operation_list"
                  target-order='push'>
                </el-transfer>
              </el-form-item>
              <el-form-item label="是否对比差异:" prop="sync_file_check_diff" v-show="appData.operation_list.indexOf('同步文件') != -1" class="is-required">
                <el-radio-group v-model="appData.sync_file_check_diff">
                  <el-tooltip class="item" effect="dark" content="应用目录中有同步目录里不存在的文件将被删除，如临时文件、日志文件等" placement="top-start">
                    <el-radio label="check_file">比对差异</el-radio>
                  </el-tooltip>
                  <el-radio label="not_check_file">不比对差异</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="同步方法:" prop="sync_file_method" v-show="appData.operation_list.indexOf('同步文件') != -1" class="is-required">
                <el-radio-group v-model="appData.sync_file_method">
                  <el-radio label="rsync">rsync</el-radio>
                  <el-tooltip class="item" effect="dark" content="不建议使用saltstack的文件服务，性能很差" placement="top-start">
                    <el-radio label="salt">salt</el-radio>
                  </el-tooltip>
                </el-radio-group>
              </el-form-item>
              <el-row>
                <el-col :span="11">
                  <el-form-item label="rsync_ip：" prop="rsync_ip" v-show="appData.operation_list.indexOf('同步文件') != -1 && appData.sync_file_method=='rsync'" class="is-required">
                    <el-input v-model="appData.rsync_ip"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="rsync_port:" prop="rsync_port"  label-width="100px" v-show="appData.operation_list.indexOf('同步文件') != -1 && appData.sync_file_method=='rsync'" class="is-required">
                    <el-input v-model="appData.rsync_port"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

                <el-row>
                  <el-form-item  class="app_stop is-required" label="应用停止方式：" prop="app_stop_style" v-show="appData.operation_list.indexOf('应用停止') != -1">
                    <el-radio-group v-model="appData.app_stop_style">
                      <el-row :gutter="20">
                        <el-col :span="6">
                          <el-radio label="停止服务名">停止服务名</el-radio>
                        </el-col>
                        <el-col :span="6">
                          <el-radio label="停止命令">停止命令</el-radio>
                        </el-col>
                        <el-col :span="6">
                          <el-radio label="任务计划停止">任务计划</el-radio>
                        </el-col>
                        <el-col :span="6">
                          <el-radio label="supervisor_stop">supervisor</el-radio>
                        </el-col>
                      </el-row>
                      <el-row :gutter="20">
                        <el-col :span="6">
                          <el-tooltip  effect="dark" content="windows在任务管理器中的进程里可以查看映像名称和命令行，linux用ss -anp查看映像名称ps -ef查看命令行" placement="top">
                            <el-radio label="映像名称和命令行">映像名称和命令行</el-radio>
                          </el-tooltip>
                        </el-col>
                      </el-row>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item  class="is-required" label="应用停止命令：" prop="app_stop_cmd"  v-show="appData.operation_list.indexOf('应用停止') != -1">
                    <el-col :span="22">
                      <el-input v-model="appData.app_stop_cmd" :placeholder="appData.app_stop_style!='映像名称和命令行'?appData.app_stop_style:'格式为：映像名称 | 命令行'" style="width:440px;"></el-input>
                    </el-col>
                  </el-form-item>
                </el-row>  
              <el-row>
                <el-form-item label="应用启动方式：" prop="app_start_style" v-show="appData.operation_list.indexOf('应用启动') != -1" class="is-required">
                  <el-radio-group v-model="appData.app_start_style">
                    <el-row :gutter="20">
                      <el-col :span="6">
                        <el-radio label="启动服务名">启动服务名</el-radio>
                      </el-col>
                      <el-col :span="6">
                        <el-radio label="启动命令">启动命令</el-radio>
                      </el-col>
                      <el-col :span="6">
                        <el-radio label="任务计划启动">任务计划</el-radio>
                      </el-col>
                      <el-col :span="6">
                        <el-radio label="supervisor_start">supervisor</el-radio>
                      </el-col>
                    </el-row>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="应用启动命令：" prop="app_start_cmd" v-show="appData.operation_list.indexOf('应用启动') != -1" class="is-required">
                  <el-col :span="22">
                    <el-input v-model="appData.app_start_cmd" :placeholder="appData.app_start_style" style="width:440px;"></el-input>
                  </el-col>
                </el-form-item>
              </el-row>
              <el-form-item label="执行命令1：" prop="cmd1" v-show="appData.operation_list.indexOf('执行命令1') != -1" class="is-required">
                <el-input v-model="appData.cmd1" style="width:440px;"></el-input>
              </el-form-item>
              <el-form-item label="执行命令2：" prop="cmd2" v-show="appData.operation_list.indexOf('执行命令2') != -1" class="is-required">
                <el-input v-model="appData.cmd2" style="width:440px;"></el-input>
              </el-form-item>
              <el-form-item label="应用备份目录：" prop="app_backup_path">
                <el-input v-model="appData.app_backup_path"  style="width:440px;"></el-input>
              </el-form-item>
              <el-form-item label="备注：" prop="description">
                <el-input v-model="appData.description" style="width:440px;"></el-input>
              </el-form-item>
              <el-form-item label="创建时间" prop="create_time" v-show="dialogAppFormTitle=='应用发布详情'">
                <el-date-picker  v-model="appData.create_time" type="datetime"/>
              </el-form-item>
              <el-form-item label="最近一次更新时间" prop="update_time" v-show="dialogAppFormTitle=='应用发布详情'">
                <el-date-picker  v-model="appData.update_time" type="datetime"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" class="clone-app" v-show="dialogAppFormTitle=='编辑应用发布'" @click="handleCloneApp">克 隆</el-button>
        <el-button @click="updateLoading = false;addLoading = false;dialogAppFormVisible = false">关闭</el-button>
        <el-button type="primary" v-show="dialogAppFormTitle=='新增应用发布'" @click="handleAddApp" :loading="addLoading">确 定</el-button>
        <el-button type="primary" v-show="dialogAppFormTitle=='编辑应用发布'" @click="handleUpdateApp" :loading="updateLoading">更 新</el-button>
        
        
      </div>
    </el-dialog>

    <el-dialog class="delDialog" v-el-drag-dialog :visible.sync="dialogDeleteAppVisible" :title="'删除应用：'+ deleteAppData.app_name" width="20%" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false">
      <el-scrollbar style="height:100%">
      <el-form  :model="deleteAppData" label-position="top" size="mini">
        <el-form-item label="是否要同时删除应用目录和应用备份目录:" class="is-required">
          <el-radio-group v-model="deleteAppData.delete_app_file_select">
          <el-radio label="delete_app_file">是</el-radio>
          <el-radio label="no_delete_app_file">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteLoading = false;dialogDeleteAppVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDeleteApp" :loading="deleteLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 日志显示 -->
    <el-dialog class="logDialog" :visible.sync="dialogLogVisible" width="800px">
      <span slot="title" class="el-dialog__title">
        <span>{{ logTitle + ' 日志' }}</span>
      </span>
      <el-row style="padding-bottom:10px;height:35px; line-height:35px;" >
        <el-col :span="6" style="text-align:center;"><span style="font-weight:bold;">发布时间：</span><span>{{logTemp.create_time | parseTime('{y}-{m}-{d} {h}:{i}')}}</span></el-col>
        <el-col :span="6" style="text-align:center;"><span style="font-weight:bold;">发布结果：</span><span>{{logTemp.release_result}}</span></el-col>
        <el-col :span="6" style="text-align:center;"><span style="font-weight:bold;">操作人：</span><span>{{logTemp.username}}</span></el-col>
        <el-col :span="6" style="text-align:center;"><el-button size="mini" type="primary" @click="getLogList" :loading="logLoading">刷新</el-button></el-col>
      </el-row>
      <el-row>
        <pre class="app-log-pre"  v-html="logTemp.log" ></pre>
        <pagination style="margin:0;padding:10px 16px 10px 16px;" v-show="logTotal>0" :total="logTotal" :page.sync="logListQuery.page" :page_size.sync="logListQuery.page_size" layout="total, prev, pager, next, jumper" @pagination="getLogList" />
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogLogVisible = false">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getMinionIdList } from '@/api/saltstack'
import { releaseAdd, releaseGetList, releaseUpdate, releaseOpt, releaseDel, releaseLog } from '@/api/release'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { Message } from 'element-ui'




export default {
  name: 'ReleaseTable',
  components: { Pagination },
  directives: { elDragDialog, waves },
  data() {
    var checkAppPathOwner = (rule, value, callback) => {
      if(this.appData.sys_type == 'linux'){
        if (!value) {
          callback(new Error('请输入目录属主'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkAppSvn = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('SVN更新') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkAppGit = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('GIT更新') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkSyncFile = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('同步文件') != -1){
        if (!value) {
          callback(new Error('请选择'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkRsyncIp = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('同步文件') != -1){
        if(this.appData.sync_file_method == 'rsync'){
          var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
          if (!value) {
            callback(new Error('IP不能为空'));
          }else if(value.match(reg)==null){
            callback(new Error('IP格式不合法'));
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
    var checkRsyncPort = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('同步文件') != -1){
        if(this.appData.sync_file_method == 'rsync'){
          var reg =/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
          if (!value) {
            callback(new Error('IP不能为空'));
          }else if(value.match(reg)==null){
            callback(new Error('端口不合法'));
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
    var checkStopStyle = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('应用停止') != -1){
        if (!value) {
          callback(new Error('请选择停止方式'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkStopCmd = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('应用停止') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkStartStyle = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('应用启动') != -1){
        if (!value) {
          callback(new Error('请选择启动方式'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkStartCmd = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('应用启动') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkCmd1 = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('执行命令1') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    var checkCmd2 = (rule, value, callback) => {
      if(this.appData.operation_list.indexOf('执行命令2') != -1){
        if (!value) {
          callback(new Error('不能为空'));
        }else{
          callback();
        }
      }else{
        callback();
      }
    };
    return {
      appData: {
        app_name:'',
        sys_type:'linux',
        minion_list:[],
        app_path:'',
        app_path_owner:'root',
        app_svn_url:'',
        app_svn_user:'',
        app_svn_password:'',
        app_git_url:'',
        app_git_user:'',
        app_git_password:'',
        app_git_branch:'master',
        execution_style:'serial',
        operation_list: [],
        sync_file_check_diff: 'not_check_file',
        sync_file_method: 'rsync',
        rsync_ip: '',
        rsync_port: '',
        app_stop_style: '停止服务名',
        app_stop_cmd: '',
        app_start_style: '启动服务名',
        app_start_cmd: '',
        cmd1: '',
        cmd2: '',
        operation_arguments:'',
        app_backup_path:'',
        create_time:'',
        update_time:'',
        description:'',
        co_path: '',
        co_status: '',
      },
      operation_list: [
        {key: 'SVN更新', label: 'SVN更新'},
        {key: 'GIT更新', label: 'GIT更新'},
        {key: '同步文件', label: '同步文件'},
        {key: '应用停止', label: '应用停止'},
        {key: '应用启动', label: '应用启动'},
        {key: '执行命令1', label: '执行命令1'},
        {key: '执行命令2', label: '执行命令2'},
      ],
      operation_transfer_error: '',
      minion_transfer_error: '',
      app_name_error:'',
      dialogAppFormVisible: false,
      // 存放从api获取的minion id列表，穿梭框格式要求所以列表里头是一个个{label: 'xxx', value: 'xxx'}
      minion_list: [],
      // 表单验证
      rules: {
        app_name: {required: true, message: '请输入应用名称', trigger: 'blur'},
        sys_type: {required: true, message: '请选择系统类型', trigger: 'change'},
        app_path: {required: true, message: '请输入应用路径', trigger: 'blur'},
        app_path_owner: {validator: checkAppPathOwner, trigger: 'blur'},
        app_svn_url: {validator: checkAppSvn, trigger: 'blur'},
        app_svn_user: {validator: checkAppSvn, trigger: 'blur'},
        app_svn_password: {validator: checkAppSvn, trigger: 'blur'},
        app_git_url: {validator: checkAppGit, trigger: 'blur'},
        app_git_user: {validator: checkAppGit, trigger: 'blur'},
        app_git_password: {validator: checkAppGit, trigger: 'blur'},
        app_git_branch: {validator: checkAppGit, trigger: 'blur'},
        execution_style: {required: true, message: '请选择执行顺序', trigger: 'change'},
        sync_file_check_diff: {validator: checkSyncFile, trigger: 'change'},
        sync_file_method: {validator: checkSyncFile, trigger: 'change'},
        rsync_ip: {validator: checkRsyncIp, trigger: 'blur'},
        rsync_port: {validator: checkRsyncPort, trigger: 'blur'},
        app_stop_style: {validator: checkStopStyle, trigger: 'change'},
        app_stop_cmd: {validator: checkStopCmd, trigger: 'blur'},
        app_start_style: {validator: checkStartStyle, trigger: 'change'},
        app_start_cmd: {validator: checkStartCmd, trigger: 'blur'},
        cmd1: {validator: checkCmd1, trigger: 'blur'},
        cmd2: {validator: checkCmd2, trigger: 'blur'},
      },
      listQuery:{
        page: 1,
        page_size: 10,
        app_name:'',
        minion_id:'',
        app_url:'',
        ordering: ''
      },
      allLoading: false,
      addLoading: false,
      updateLoading: false,
      deleteLoading: false,
      tableKey: 0,
      data_list: null,
      total: 0,
      multipleSelection:[],
      listLoading: true,
      dialogAppFormTitle:'新增应用发布',
      dialogDeleteAppVisible: false,
      deleteAppData: {
        app_name:'',
        id: '',
        delete_app_file_select: 'no_delete_app_file'
      },
      dialogInfoVisible: false,
      infoTemp: {},
      dialogLogVisible: false,
      logTemp: {},
      logListQuery: {
        page: 1,
        page_size: 1,
        app_name: '',
      },
      logTotal: 0,
      logTitle: '',
      logLoading: false,
    }
  },
  watch:{
    // 监控是否选择了minion，然后重置验证错误的信息用的
    'appData.minion_list': {
      handler: function (val, oldVal) {
        if(val.length > 0 ){
          this.minion_transfer_error = ''
        }
      } 
    },
    // 监控是否选择了操作步骤，然后重置验证错误的信息用的
    'appData.operation_list': {
      handler: function (val, oldVal) {
        if(val.length > 0 ){
          this.operation_transfer_error = ''
        }
      } 
    },
  },
  created() {
    this.getList()
    
  },
  methods: {
    // 获取应用列表,第一次进入好看加点loading
    getList() {
      this.listLoading = true
      releaseGetList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
        this.appData.rsync_ip = response.data.msg.rsync_ip
        this.appData.rsync_port = response.data.msg.rsync_port
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      }).catch(error => {
        this.listLoading = false
      })
    },
    // 获取应用列表无loading
    getListNoloading() {
      releaseGetList(this.listQuery).then(response => {
        this.data_list = response.data.results
        this.total = response.data.count
      })
    },
    // 应用日志查询
    getLogList() {
      this.logLoading = true
      releaseLog(this.logListQuery).then(response => {
        this.logTemp = response.data.results[0]
        this.logTotal = response.data.count
        if(Object.prototype.toString.call(this.logTemp) === '[object Object]'){
          // this.logTemp.create_time = new Date(this.logTemp.create_time)
          if(Object.prototype.toString.call(JSON.parse(this.logTemp['log_content'])) === '[object Array]'){
            this.logTemp.log = '';
            for (let content of JSON.parse(this.logTemp['log_content'])){
              this.logTemp.log  += content
            }
          }else{
            this.logTemp.log = '还未发布过';
          };
        }else{
          this.logTemp = {log: '还未发布过'}
        }
        this.logLoading = false
      }).catch(error => {
        console.log('应用日志查询' + error);
        this.logLoading = false
      })
      
    },
    // 获取minion id字段列表
    getIdList(){
      this.minion_list = [];
      this.appData.minion_list = [];
      let query = {};
      query.sys = this.appData.sys_type
      getMinionIdList(query).then(response =>{
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
    // 清空新增应用弹出框临时数据
    resetTemp() {
      this.minion_list = []; 
      this.$refs['appDataForm'].resetFields()
    },
    // 新增应用弹出框
    handAddReleaseDailog(){
      this.dialogAppFormTitle = '新增应用发布'
      this.minion_transfer_error = '';
      this.operation_transfer_error = '';
      this.app_name_error = '';
      this.dialogAppFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        this.getIdList()
        this.$refs['app_name_focus'].focus();
      　this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['appDataForm'].clearValidate()
      })
    },
    // 编辑应用弹出框
    handUpdateReleaseDailog(row){
      this.dialogAppFormTitle = '编辑应用发布'
      let data = {...row}
      this.minion_transfer_error = '';
      this.operation_transfer_error = '';
      this.app_name_error = '';
      this.dialogAppFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        data.minion_list = data.minion_list.split(",")
        data.operation_list = JSON.parse(data.operation_list)
        data.operation_arguments = JSON.parse(data.operation_arguments)
        for (let k in data.operation_arguments){
          data[k] = data.operation_arguments[k]
        }
        // operation_arguments是后端逻辑处理后的参数不需要前端传递，默认传递空的字符串，这里转换成对象了如果传递对象反而会造成后端验证报错
        data.operation_arguments = '';
        // console.log(row);
        // console.log(data);
        this.appData = data;
        // v-model无法接受布尔类型所以得转换一下下面的检出状态
        this.appData.co_status = this.appData.co_status?'已检出':'未检出';
      　this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['appDataForm'].clearValidate()
        // 下面这些操作是因为本来我是用this.getIdList()来直接获取minon id列表，但是由于异步的原因导致还没获取到minion数据，appData里的minion_list已经有了数据即左边还没有数据
        // 右边的穿梭框已经有了数据导致前端报错，所以只能手动写了
        let tmp_minion_list = this.appData.minion_list
        this.appData.minion_list = []
        this.minion_list = [];
        let query = {};
        query.sys = this.appData.sys_type
        getMinionIdList(query).then(response =>{
            const minionList = response.data.results;
            minionList.forEach((minion_id, index) => {
            this.minion_list.push({
              label: minion_id,
              key: minion_id
              });
            });
            this.appData.minion_list = tmp_minion_list
        }).catch(error => {
          console.log('getMinionIdList' + error);
        })
      })
    },
    // 查看应用详情弹出框
    handAppInfoDailog(row){
      this.dialogAppFormTitle = '应用发布详情'
      let data = {...row}
      this.minion_transfer_error = '';
      this.operation_transfer_error = '';
      this.app_name_error = '';
      this.dialogAppFormVisible = true
      // 穿梭框搜索关键词清空
      this.$nextTick(()=>{
        this.resetTemp()
        data.minion_list = data.minion_list.split(",")
        data.operation_list = JSON.parse(data.operation_list)
        data.operation_arguments = JSON.parse(data.operation_arguments)
        for (let k in data.operation_arguments){
          data[k] = data.operation_arguments[k]
        }
        // operation_arguments是后端逻辑处理后的参数不需要前端传递，默认传递空的字符串，这里转换成对象了如果传递对象反而会造成后端验证报错
        data.operation_arguments = '';
        this.appData = data
        this.appData.co_status = this.appData.co_status?'已检出':'未检出';
        this.appData.create_time = new Date(this.appData.create_time)
        this.appData.update_time = new Date(this.appData.update_time)
      　this.$refs.dataTransfer.clearQuery("left")
      　this.$refs.dataTransfer.clearQuery("right")
        this.$refs['appDataForm'].clearValidate()
        // 下面这些操作是因为本来我是用this.getIdList()来直接获取minon id列表，但是由于异步的原因导致还没获取到minion数据，appData里的minion_list已经有了数据即左边还没有数据
        // 右边的穿梭框已经有了数据导致前端报错，所以只能手动写了
        let tmp_minion_list = this.appData.minion_list
        this.appData.minion_list = []
        this.minion_list = [];
        let query = {};
        query.sys = this.appData.sys_type
        getMinionIdList(query).then(response =>{
            const minionList = response.data.results;
            minionList.forEach((minion_id, index) => {
            this.minion_list.push({
              label: minion_id,
              key: minion_id
              });
            });
            this.appData.minion_list = tmp_minion_list
        }).catch(error => {
          console.log('getMinionIdList_1' + error);
        })
      })
    },
    // 新增应用
    handleAddApp() {
      this.$refs['appDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.appData}
          // // minion id逻辑处理 因为无法用element的验证来触发只能手动写
          if (data.minion_list.length) {
            data.minion_list = data.minion_list.join(",")
          }
          else {
            this.minion_transfer_error = '请至少选择一个Minion ID'
            return false;
          }

          // 操作选择逻辑处理 因为无法用element的验证来触发只能手动写
          if (!data.operation_list.length) {
            this.operation_transfer_error = '请选择操作'
            return false;
          }
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.operation_transfer_error = ''
          this.minion_transfer_error = ''
          this.app_name_error = ''
          this.addLoading = true
          console.log(data);
          releaseAdd(data).then(response => {
            if(response.data.status){
              this.addLoading = false
              this.dialogAppFormVisible = false
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
    // 更新应用
    handleUpdateApp() {
      this.$refs['appDataForm'].validate((valid) => {
        if (valid) {
          let data = {...this.appData}
          // // minion id逻辑处理 因为无法用element的验证来触发只能手动写
          if (data.minion_list.length) {
            data.minion_list = data.minion_list.join(",")
          }
          else {
            this.minion_transfer_error = '请至少选择一个Minion ID'
            return false;
          }

          // 操作选择逻辑处理 因为无法用element的验证来触发只能手动写
          if (!data.operation_list.length) {
            this.operation_transfer_error = '请选择操作'
            return false;
          }
          // 检出状态转bool
          data.co_status = data.co_status=='已检出'?true:false;
          // 重置表单错误用的，如果不重置下面提交后端出错返回后再重置赋值错误信息发现只能第一次有效，必须在post操作前重置才可以
          // 如果太多计划弄一个单独的方法存放
          this.operation_transfer_error = ''
          this.minion_transfer_error = ''
          this.app_name_error = ''
          this.$confirm('确定要更新当前应用?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.updateLoading = true
            releaseUpdate(data).then(response => {
              if(response.data.status){
                this.updateLoading = false
                this.dialogAppFormVisible = false
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
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消更新'
            });          
          });
        } else{
          return false
        }
      });
      
    },
    // 克隆应用焦点和提示
    handleCloneApp(){
      this.dialogAppFormTitle='新增应用发布';
      this.app_name_error = '该字段必须唯一'
      this.$refs['app_name_focus'].focus();
    },
    // 删除应用弹出框
    handDeleteAppDailog(row){
      this.dialogDeleteAppVisible = true;
      this.deleteAppData.app_name = row.app_name;
      this.deleteAppData.id = row.id;
      this.deleteAppData.delete_app_file_select = 'no_delete_app_file';
    },
    // 删除应用
    handleDeleteApp(){
      let data = {}
      data.id = this.deleteAppData.id
      data.delete_app_file_select = this.deleteAppData.delete_app_file_select
      this.deleteLoading = true
      releaseDel(data).then(response => {
        if(response.data.status){
          this.deleteLoading = false
          this.dialogDeleteAppVisible = false
          Message.success(response.data.results)
          this.getList()
        }
        else{
          this.deleteLoading = false
          Message.error(response.data.results)
        }
      }).catch(error => {
        this.deleteLoading = false
      })
    },
    // 发布方法封装
    GoRelease(release_version,row){
      let data = {};
      data['id'] = row.id;
      data['release_version'] = release_version?release_version:'HEAD';
      row.release_status = '发布中'
      releaseOpt(data).then(response =>{
        if(response.data.status){
          row.release_status = '发布成功'
        }
        else{
          if(response.data.release_status === '发布中'){
            this.$message({
              type: 'error',
              message: response.data.results
            });
            row.release_status = '发布中'
          }else{
            console.log(response.data.results);
            row.release_status = '发布失败'
          }
        }
      }).catch(error => {
        row.release_status = '空闲'
      })
    },
    handGoRelease(row){
      this.$prompt('<strong>请输入SVN/GIT版本号,为空则默认为最新</strong>', '版本号 填写', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: 'SVN/GIT版本号',
        dangerouslyUseHTMLString: true
        // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        // inputErrorMessage: '邮箱格式不正确'
      }).then(({ value }) => {
        this.GoRelease(value,row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消发布'
        });       
      });
    },
    // 当选项发生变化时触发该方法多选赋值,val是@selection-change内置的表示选中的对象
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 批量发布
    handGoReleaseList(){
      if(this.multipleSelection.length === 0){
        Message.error('未选择任何记录，请选择后重试')
      }
      else{
        this.$prompt('<strong>请输入SVN/GIT版本号,为空则默认为最新</strong>', '版本号 填写', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: 'SVN/GIT版本号',
        dangerouslyUseHTMLString: true
        }).then(({ value }) => {
          for(var row of this.multipleSelection){
            this.GoRelease(value,row)
          };
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消发布'
          });       
        });
      }
    },
    // 单项操作发布
    handleSingleRelease(row, single_cmd){
      if(single_cmd === 'SVN更新' || single_cmd === 'GIT更新'){
        this.$prompt(`<strong>应用：${row.app_name}</strong><br><strong>操作：${single_cmd}</strong>`, '单项操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: 'SVN/GIT版本号,为空则默认为最新',
        dangerouslyUseHTMLString: true
        }).then(({ value }) => {
          let data = {};
          data['id'] = row.id;
          data['release_version'] = value?value:'HEAD';
          data['single_cmd'] = single_cmd
          row.release_status = '发布中'
          releaseOpt(data).then(response =>{
            if(response.data.status){
              row.release_status = '发布成功'
            }
            else{
              if(response.data.release_status === '发布中'){
                this.$message({
                  type: 'error',
                  message: response.data.results
                });
                row.release_status = '发布中'
              }else{
                console.log(response.data.results);
                row.release_status = '发布失败'
              }
            }
          }).catch(error => {
            console.log('单项操作发布' + error);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消发布'
          });       
        });
      }
      else{
        this.$confirm(`<strong>应用：${row.app_name}</strong><br><strong>操作：${single_cmd}</strong>`, '单项操作', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          let data = {};
          data['id'] = row.id;
          data['single_cmd'] = single_cmd
          row.release_status = '发布中'
          releaseOpt(data).then(response =>{
            if(response.data.status){
              row.release_status = '发布成功'
            }
            else{
              if(response.data.release_status === '发布中'){
                this.$message({
                  type: 'error',
                  message: response.data.results
                });
                row.release_status = '发布中'
              }else{
                console.log(response.data.results);
                row.release_status = '发布失败'
              }
            }
          }).catch(error => {
            console.log('单项操作发布_1' + error);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消发布'
          });       
        }); 
      }
    },
    
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'app_name') {
        if (order === 'ascending') {
          this.listQuery.ordering = 'app_name'
        } else {
          this.listQuery.ordering = '-app_name'
        }
      }
      else if(prop === 'minion_id'){
        if (order === 'ascending') {
          this.listQuery.ordering = 'minion_id'
        } else {
          this.listQuery.ordering = '-minion_id'
        }
      }
      this.handleFilter()
    },

    // 日志弹出框
    handAppLogDailog(row){
      this.logListQuery.page = 1;
      this.logListQuery.app_name = row.app_name;
      this.logTitle = row.app_name;
      this.logTemp.log = '';
      this.getLogList()
      this.dialogLogVisible = true;
    },
  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .transfer_error{
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
    // 穿梭框高度调整，
  .operationTransferClass /deep/ .el-transfer{
    .el-transfer-panel{
      width: 190px;
    }
    .el-transfer-panel__body{
      height: 133px;
      .el-transfer-panel__list{
        height: 133px;
      }
    }
  }

  .app_stop {
    .el-radio-group{
      .el-radio{
        padding-top: 10px;
      }
    }
  }

  .release_table{
    .status_success {
      color: #40c984;
    }
    .status_error {
      color: #f4516c;
    }
    .status_info {
      color: #31b0d5;
    }
    .status_loading {
      color: #7451f4;
    }
  }

  .dot-ani {
    display: inline-block;
    height: 12px;
    line-height: 12px;
    overflow: hidden;
  }
  .dot-ani::after {
    display: inline-table;
    white-space: pre;
    content: "\A.\A..\A...";
    animation: spin 2s steps(4) infinite;
  }
  @keyframes spin {
    to{
      -webkit-transform:translateY(-48px);
      transform:translateY(-48px)
    }
  }

  .clone-app{
    float: left!important;
  }
  
  .delDialog /deep/ .el-dialog__body{
    text-align: center;
  }

  
  .app-log-pre{
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

  .overflow_set{
    max-height: 745px;
    overflow: auto;
  }

}


</style>