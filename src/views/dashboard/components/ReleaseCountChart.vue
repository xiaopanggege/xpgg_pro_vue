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
      let one = 0
      let two = 0
      let three = 0
      let four = 0
      let five = 0
      let six = 0
      let seven = 0
      let eight = 0
      let nine = 0
      let ten = 0
      let eleven = 0
      let twelve = 0
      if(this.list){
        for (let v of this.list) {
          if (v["month"] === 1) {
            one = v["count"]
          }
          else if(v["month"] === 2){
            two = v["count"]
          }
          else if(v["month"] === 3){
            three = v["count"]
          }
          else if(v["month"] === 4){
            four = v["count"]
          }
          else if(v["month"] === 5){
            five = v["count"]
          }
          else if(v["month"] === 6){
            six = v["count"]
          }
          else if(v["month"] === 7){
            seven = v["count"]
          }
          else if(v["month"] === 8){
            eight = v["count"]
          }
          else if(v["month"] === 9){
            nine = v["count"]
          }
          else if(v["month"] === 10){
            ten = v["count"]
          }
          else if(v["month"] === 11){
            eleven = v["count"]
          }
          else if(v["month"] === 12){
            twelve = v["count"]
          }
        }
      }
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        title: {
          text: '月发布量',
          subtext: '发布系统发布量统计',
        },
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '发布次数',
                type: 'bar',
                barWidth: '60%',
                data: [one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve]
            }
        ]
      })
    }
  }
}
</script>
