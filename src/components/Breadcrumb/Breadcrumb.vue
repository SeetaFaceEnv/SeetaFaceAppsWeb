<template>
  <el-breadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ name: 'welcome' }">
      {{ $t('title') }}
      <i style="color: #9C9C9C" class="fa fa-vimeo-square" aria-hidden="true"></i>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in $store.state.breadcrumb" :key="index">
      {{ breadcrumbObj[item] }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { breadcrumbGenerate } from '@utils/routerHandle/breadcrumbHandle.js' // 引入路由处理
export default {
  data () {
    return {
      breadcrumbObj: {}
    }
  },
  mounted () {
    // 根据routerList自动生成面包屑
    this.breadcrumbObj = breadcrumbGenerate(this.$store.state.routerList)
    console.log(this.breadcrumbObj)
  }
}
</script>

<style lang="stylus" scoped>
.breadcrumb
  font-size 14px
  // padding-bottom 10px
  margin 10px 0 0 10px
</style>
