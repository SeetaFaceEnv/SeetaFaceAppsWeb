import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isSubmitting: false, // 是否表单提交中
    isRefreshDeviceList: false, // 是否刷新设备状态列表
    isCollapse: false, // 侧边栏状态(未启用)
    breadcrumb: [], // 面包屑状态
    activeMenuPath: '', // 侧边栏激活状态路径
    isWsConnected: false, // websocket是否连接
    isLoginPage: false // 是否是首页
  },
  mutations: {
    closeIsSubmitting (state) { // 关闭提交状态
      state.isSubmitting = false
    },
    openIsSubmitting (state) { // 开启提交状态
      state.isSubmitting = true
    },
    changeIsRefreshDeviceList (state) {
      state.isRefreshDeviceList = !state.isRefreshDeviceList
    },
    changeIsCollapse (state) { // 改变侧边栏状态
      state.isCollapse = !state.isCollapse
    },
    changeIsWsConnected (state) { // 改变websocket是否连接状态
      state.isWsConnected = !state.isWsConnected
    },
    changeBreadcrumb (state, toPath) { // 修改面包屑内容
      state.activeMenuPath = toPath
      state.breadcrumb = toPath.split('/')
      state.breadcrumb.shift()
    }
  },
  actions: {

  }
})
