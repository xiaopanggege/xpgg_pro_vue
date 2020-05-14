<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    list: {
      type: Array,
    },
    now_time:{
      type: [String, Date],
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  watch: {
    // 监控list变化
    list: function(val, oldVal) {
      if(val!=oldVal){
        this.$nextTick(() => {
          this.initChart()
        })
      }
    }
  },
  methods: {
    initChart() {
      let accepted = 0
      let unaccepted = 0
      let denied = 0
      let rejected = 0
      if(this.list){
        for (let v of this.list) {
          if (v["certification_status"] === 'accepted') {
            accepted = v["certification_status__count"]
          }
          else if(v["certification_status"] === 'unaccepted'){
            unaccepted = v["certification_status__count"]
          }
          else if(v["certification_status"] === 'denied'){
            denied = v["certification_status__count"]
          }
          else if(v["certification_status"] === 'rejected'){
            rejected = v["certification_status__count"]
          }
        }
      }
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: 'Minion信息',
          subtext: 'Minion认证分布比例',
          left: 'left'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['已认证', '待认证', '禁止', '已拒绝']
        },
        series: [
          {
            name: 'Minion信息',
            type: 'pie',
            roseType: 'radius',
            radius: '55%',
            radius: [15, 95],
            data: [
              { value: accepted, name: '已认证' },
              { value: unaccepted, name: '待认证' },
              { value: denied, name: '禁止' },
              { value: rejected, name: '已拒绝' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
