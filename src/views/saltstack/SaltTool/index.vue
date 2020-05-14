<template>
  <div class="app-container">
    <el-form :model="saltTool" status-icon   ref="ruleForm" label-width="120px" label-position="right" >
      <el-form-item label="请选择工具：">
        <el-select v-model="saltTool.name" clearable filterable placeholder="请选择工具">
          <el-option
            v-for="item in toolList"
            :key="item.name"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span style="font-weight: normal;color: #3FB8AF;font-size: 13px;text-align: left;padding: 7px 7px">{{tool_help[saltTool.name]}}</span>
      </el-form-item>
    </el-form>
    <hr>
    <transition name="fade"  mode="out-in" appear>
      <component :is="saltTool.name"/>
    </transition>
  </div>
</template>

<script>
import JobSearch from './components/JobSearch'
import WindowsCrontab from './components/WindowsCrontab'

export default {
  name: 'SaltTool',
  components: { 
    JobSearch, 
    WindowsCrontab 
  },
  data() {
    return {
      toolList:[
        {label:'任务查询', value:'JobSearch'},
        {label:'windows计划任务', value:'WindowsCrontab'},
      ],
      saltTool:{
        name:'',
      },
      tool_help: {
        JobSearch: '提示：通过jid查询salt执行的状态和结果', 
        WindowsCrontab: '提示：快速创建一个windows的计划任务', 
      },
    }
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  // 切换工具过度动画
  .fade-enter-active, .fade-leave-active {
      transition: all 0.5s ease;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
      opacity: 0;
      transform: translateX(150px);
    }
}


</style>