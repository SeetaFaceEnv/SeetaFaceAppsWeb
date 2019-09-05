import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'

import Util from '@/utils/util' // 全局变量

import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/init.css' // 初始化css样式
import '@/assets/stylus/element-ui.stylus' // 初始化element-ui样式
import '@/assets/css/scrollbar.css' // 滚动条样式
import '@/assets/font-awesome/css/font-awesome.min.css' // 图标库

import '@/assets/stylus/fade.stylus' // 加载效果

Vue.config.productionTip = false
Vue.use(ElementUI, { size: 'small' })
Vue.use(Util)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
