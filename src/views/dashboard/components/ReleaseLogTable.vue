<template>
  <el-card class="box-card" :body-style="{ padding: '5px' }">
    <div slot="header" class="clearfix">
      <span>最新发布日志</span>
    </div>
  <el-table :data="list" style="width: 100%;padding-top: 5px;">
    <el-table-column label="应用名称" min-width="120">
      <template slot-scope="scope">
        {{ scope.row.app_name }}
      </template>
    </el-table-column>
    <el-table-column label="时间" min-width="80" align="center">
      <template slot-scope="scope">
        {{ scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
      </template>
    </el-table-column>
    <el-table-column label="状态" min-width="80" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.release_result | statusFilter" >
          {{ row.release_result }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        发布成功: 'success',
        发布失败: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  props: {
    list: {
      type: Array,
    },
  },
  data() {
    return {
      
    }
  },
  
  methods: {
  }
}
</script>
