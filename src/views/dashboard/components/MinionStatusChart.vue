<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

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
      let online = 0
      let offline = 0
      let anomaly = 0
      if(this.list){
        for (let v of this.list) {
          if (v["minion_status"] === '在线') {
            online = v["minion_status__count"]
          }
          else if(v["minion_status"] === '离线'){
            offline = v["minion_status__count"]
          }
          else if(v["minion_status"] === '异常'){
            anomaly = v["minion_status__count"]
          }
        }
      }
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: 'Minion状态',
          subtext: 'Minion状态统计',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'value',
          
        }],
        yAxis: [{
          type: 'category',
          inverse: true,
          data: ['在线', '离线', '异常'],
        }],
        series: [{
          name: '数量',
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          itemStyle: {
            normal: {
                // 定制显示（按顺序）
                color: function(params) { 
                    var colorList = ['#22DDDD','#FE8463','#FAD860']; 
                    return colorList[params.dataIndex] 
                }
            },
        },
          data: [online, offline, anomaly ],
          animationDuration
        }, ]
      })
    },

  }
}
</script>
