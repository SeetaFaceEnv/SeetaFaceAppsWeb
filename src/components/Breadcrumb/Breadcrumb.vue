<template>
  <el-breadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
    <el-breadcrumb-item>智慧园区</el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in $store.state.breadcrumb" :key="index">
      {{ breadcrumbList[item] }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  data () {
    return {
      breadcrumbList: {
        'system': '系统信息',
        'system-config': '系统配置',
        'member': '人员信息',
        'field-manage': '字段管理',
        'member-manage': '人员管理',
        'device': '设备信息',
        'device-manage': '设备管理',
        'device-group-manage': '设备组管理',
        'device-stream-manage': '流媒体管理',
        'device-time-manage': '时间管理',
        'record': '记录信息',
        'pass-record': '通行记录',
        'log-record': '日志记录',
        '404': '404'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.breadcrumb
  font-size 14px
  // padding-bottom 10px
  margin 10px 0 0 10px
</style>
