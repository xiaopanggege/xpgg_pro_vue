<template>
  <el-card class="box-card" :body-style="{ padding: '5px' }">
    <div slot="header" class="clearfix">
      <span>系统状态</span>
    </div>
  <el-table :data="list" style="width: 100%;padding-top: 5px;">
    <el-table-column label="名称" min-width="120">
      <template slot-scope="scope">
        {{ scope.row.name }}
      </template>
    </el-table-column>
    <el-table-column label="状态" min-width="80" align="center">
      <template slot-scope="{row}">
          {{ row.value }}
      </template>
    </el-table-column>
  </el-table>

  
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  filters: {
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
