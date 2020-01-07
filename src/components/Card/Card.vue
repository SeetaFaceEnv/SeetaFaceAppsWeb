<template>
  <transition name="card-fade-show">
    <el-card v-show="isShow" class="main-card" shadow="hover">
      <div slot="header" class="card-header">
        <!-- Card左侧 菜单选项 -->
        <div class="card-header-left-menu">
          <slot name="cardTitle"></slot>
        </div>
        <!-- Card右侧 按钮组 -->
        <div class="card-header-right-button-group">
          <slot name="buttonGroup"></slot>
        </div>
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
@import "../../assets/stylus/params.stylus"
.main-card
  position absolute
  top 40px
  left 0
  right 0
  bottom 4px
  .card-header
    // min-width 600px
    overflow hidden
    .card-header-left-menu
      float left
    .card-header-right-button-group
      float right
      line-height $card-button-group-height
  .pagination
    position absolute
    right 10px
    bottom 0
    background white
</style>
