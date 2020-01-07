<template>
  <div class="theme-menu">
    <el-drawer
      size="400px"
      :visible.sync="$store.state.isThemeMenuShow"
      direction="rtl"
      :before-close="handleClose">
      <h1 slot="title">主题设置</h1>
      <div class="drawer-contain">
        <p class="drawer-contain-title">主题色</p>
        <el-tooltip v-for="(item ,index) in themeColorList" :key="index" :content="item.description" placement="top" :open-delay="200">
          <div @click="selectThemeColor(item.color)" class="color-select" :style="{ 'background-color': item.color }">
            <i v-if="item.color === localStorageThemeColor" class="el-icon-check"></i>
          </div>
        </el-tooltip>
      </div>
    </el-drawer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 主题色列表
      themeColorList: [
        { color: '#c83660', description: '极光红' },
        { color: '#4b8e8d', description: '墨绿' },
        { color: '#3c4245', description: '低调灰' },
        { color: '#11AFAF', description: '明青' },
        { color: '#3f3f53', description: '设计灰' }
      ],
      // 本地存储主题色列表
      localStorageThemeColor: localStorage.localStorageThemeColor || ''
    }
  },
  methods: {
    handleClose () {
      this.$store.commit('changeIsThemeMenuShow') // 关闭主题菜单显示
    },
    selectThemeColor (color) {
      this.localStorageThemeColor = color
      document.getElementById('sidebar').style.background = color
      document.getElementById('end').style.background = color
      localStorage.setItem('localStorageThemeColor', color)
    }
  }
}
</script>
<style lang="stylus" scoped>
.drawer-contain
  padding  0 5%
  font-size 18px
  .drawer-contain-title
    margin-bottom 20px
  .color-select // 主题颜色select
    width 26px
    height 26px
    border-radius 20%
    background red
    margin-right 8px
    display inline-block
    text-align center
    i
      color white
      line-height 26px
</style>
