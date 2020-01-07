<template>
  <transition name="menu-fade-show">
    <div v-show="isShow" id="sidebar" :class="{ collapse: $store.state.isCollapse }">
      <el-menu :default-active="activeMenu" class="sideMenu" text-color="black" active-text-color="#f4433c"
        :collapse="$store.state.isCollapse" unique-opened router>
        <!-- 统一规划 -->
        <el-submenu v-for="(menu, index) in filteredSideMenuList" :key="index" :index="menu.index">
          <template slot="title">
            <i :class="menu.iconClass"></i>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item-group>
            <template>
              <el-menu-item v-for="(menuItem, itemIndex) in menu.menuItemGroup" :key="itemIndex" :index="menuItem.routerPath">
                <span slot="title">{{ menuItem.title }}</span>
              </el-menu-item>
            </template>
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
import { sideMenuGenerate } from '@utils/routerHandle/sideMenuHandle.js' // 引入路由处理
export default {
  data () {
    return {
      isShow: false,
      sideMenuList: [] // 根据路由信息生成侧边栏
    }
  },
  computed: {
    isCollapse () {
      return this.$store.state.isCollapse
    },
    activeMenu () {
      return this.$store.state.activeMenuPath // 保证页面跳转后激活状态及时更新
    },
    // 过滤 无需显示 菜单列表
    filteredSideMenuList () {
      let finalMenuList = []
      try {
        for (let menu of this.sideMenuList) {
          let tempMenuItem = []
          if (menu.menuItemGroup) { // 当存在menuItemGroup时进行过滤
            for (let menuItem of menu.menuItemGroup) {
              // 判断是否需要显示子菜单
              if (menuItem.isShow) {
                tempMenuItem.push(menuItem)
              }
            }
          }
          menu.menuItemGroup = tempMenuItem // 保存筛选后需要显示的子菜单
          if (menu.menuItemGroup.length > 0) { // 存在二级菜单时，显示一级菜单
            finalMenuList.push(menu)
          }
        }
      } catch (e) {
        console.error(e, '请检查路由配置信息！')
      }
      return finalMenuList
    }
  },
  mounted () {
    // 处理router信息并存储store 以供生成面包屑
    this.$store.state.routerList = sideMenuGenerate(this.$router.options.routes)
    this.sideMenuList = this.$store.state.routerList
    // 修改侧边栏主题色
    document.getElementById('sidebar').style.background = localStorage.localStorageThemeColor || ''
    document.getElementById('end').style.background = localStorage.localStorageThemeColor || ''
    this.isShow = true
    this.autoChangeSideMenuCollapse()
  },
  methods: {
    changeIsCollapse () {
      this.$store.commit('changeIsCollapse')
    },
    autoChangeSideMenuCollapse () { // 窗口变更自动收缩侧边栏
      let x = window.matchMedia('(max-width: 1200px)')
      // 监听窗口变化 过窄收起侧边栏 过宽展开侧边栏
      const listenScreenWidth = (x) => {
        if (x.matches) { // 媒体查询
          if (!this.$store.state.isCollapse) {
            this.changeIsCollapse()
          }
        } else {
          if (this.$store.state.isCollapse) {
            this.changeIsCollapse()
          }
        }
      }
      listenScreenWidth(x) // 执行时调用的监听函数
      x.addListener(listenScreenWidth) // 状态改变时添加监听器
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../assets/stylus/init.stylus"
#sidebar
  position fixed
  z-index 10
  top $header-height + 10px
  bottom 0
  width $sideMenuWidth
  background #11AFAF
  font-weight 400
  overflow hidden
  transition all 0.4s ease
  .sideMenu
    border-right none
    &:not(.el-menu--collapse)
      width $sideMenuWidth
#end
  color white
  position absolute
  bottom 0
  width 100%
  padding-bottom 20px
</style>
