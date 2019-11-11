<template>
  <transition name="menu-fade-show">
    <div v-show="isShow" class="sidebar" :class="{ collapse: $store.state.isCollapse }">
      <el-menu :default-active="activeMenu" class="sideMenu" text-color="black" active-text-color="#f4433c"
        :collapse=$store.state.isCollapse :collapse-transition="false" router>
        <el-submenu index="system">
          <template slot="title">
            <i class="el-icon-s-tools"></i>
            <span>系统信息</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/system/system-config">
              <span slot="title">系统配置</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="member">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span>人员信息</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/member/field-manage">
              <span slot="title">字段管理</span>
            </el-menu-item>
            <el-menu-item index="/member/member-manage">
              <span slot="title">人员管理</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="device">
          <template slot="title">
            <i class="el-icon-s-platform"></i>
            <span>设备信息</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/device/device-manage">设备管理</el-menu-item>
            <el-menu-item index="/device/device-group-manage">设备组管理</el-menu-item>
            <el-menu-item index="/device/device-stream-manage">流媒体管理</el-menu-item>
            <el-menu-item index="/device/device-time-manage">时间管理</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="record">
          <template slot="title">
            <i class="el-icon-s-data"></i>
            <span>记录信息</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/record/pass-record">通行记录</el-menu-item>
            <el-menu-item index="/record/log-record">日志记录</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
      <div id="end">
        <i style="font-size: 30px;cursor: pointer" @click="changeIsCollapse"
          :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  data () {
    return {
      isShow: false,
      activeMenu: this.$store.state.activeMenuPath // 保证页面刷新后激活状态
    }
  },
  computed: {
    isCollapse () {
      return this.$store.state.isCollapse
    }
  },
  mounted () {
    let _this = this
    this.isShow = true
    let x = window.matchMedia('(max-width: 1200px)')
    listenScreenWidth(x) // 执行时调用的监听函数
    x.addListener(listenScreenWidth) // 状态改变时添加监听器
    // 监听窗口变化 过窄收起侧边栏 过宽展开侧边栏
    function listenScreenWidth (x) {
      if (x.matches) { // 媒体查询
        if (!_this.$store.state.isCollapse) {
          _this.changeIsCollapse()
        }
      } else {
        if (_this.$store.state.isCollapse) {
          _this.changeIsCollapse()
        }
      }
    }
  },
  methods: {
    changeIsCollapse () {
      this.$store.commit('changeIsCollapse')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../assets/stylus/init.stylus"
.sidebar
  position fixed
  z-index 10
  top $header-height + 10px
  bottom 0
  width 200px
  background linear-gradient(#40B2F3, #45E9C8)
  font-weight 400
  overflow hidden
  .sideMenu
    color  white
    border-right none
    i
      color #fff
#end
  color white
  position absolute
  bottom 0
  width 100%
  padding-bottom 20px
</style>
