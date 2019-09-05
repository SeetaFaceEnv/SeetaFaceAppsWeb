<template>
  <transition name="card-fade-show">
    <el-card v-show="isShow" class="main-card" shadow="hover">
      <div slot="header" class="card-header">
        <span style="float: left;font-weight: 900">
          <slot name="cardTitle"></slot>
        </span>
        <span style="float: right">
          <slot name="buttonGroup"></slot>
        </span>
      </div>
      <slot name="queryBar"></slot>
      <slot name="contain"></slot>
      <div class="pagination">
        <slot name="footer"></slot>
      </div>
    </el-card>
  </transition>
</template>
<script>
export default {
  data () {
    return {
      isShow: false
    }
  },
  mounted () {
    this.isShow = true
  }
}
</script>
<style lang="stylus" scoped>
.main-card
  position absolute
  top 40px
  left 0
  right 0
  bottom 4px
  .card-header
    font-size 16px
    padding-left 10px
    overflow hidden
  .pagination
    position absolute
    right 10px
    bottom 0
    background white
</style>
