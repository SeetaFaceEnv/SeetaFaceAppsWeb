<template>
  <div class="home">
    <Header></Header>
    <div class="left" :class="{ collapse: $store.state.isCollapse }">
      <SideMenu/>
    </div>
    <div class="right">
      <Contain></Contain>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Header from '../components/Menu/Header'
import SideMenu from '../components/Menu/SideMenu'
import Contain from '../components/Contain/Contain'
import { getTcpInfo } from '@/api/getData'
export default {
  data () {
    return {
      index: 0 // 防止多次重连 影响浏览器性能
    }
  },
  components: {
    Header,
    SideMenu,
    Contain
  },
  mounted () {
    if (!this.$store.state.isWsConnected) {
      this.getWebsocketUrl()
    }
  },
  methods: {
    // 获取websocket url
    async getWebsocketUrl () {
      const res = await getTcpInfo()
      if (res.data.result === 0) {
        const url = res.data.gw_url + '/?token=' + res.data.gw_token
        this.connectWebSocket(url)
      }
    },
    // 连接websocket
    connectWebSocket (url) {
      const ws = new WebSocket(url)
      ws.onopen = (evt) => {
        this.$store.commit('changeIsWsConnected')
        console.log('websocket连接成功', url)
      }
      ws.onmessage = (evt) => {
        // console.log(JSON.parse(evt.data))
        const msgObj = JSON.parse(evt.data)
        switch (msgObj.command) {
          case 'device_status_change':
            this.notifyDeviceStatusChange(msgObj)
            // 添加异常处理
            try {
              // 页面处于设备管理页面时 发生状态变更刷新页面
              if ((msgObj.content.status_type === 5 || msgObj.content.status_type === 6) &&
                this.$route.name === 'device-manage') {
                this.$store.commit('changeIsRefreshDeviceList')
              }
            } catch (e) {
              console.log('Exception occurred by Home.vue', e)
            }
            break
          case 'image_register_fail':
            this.$handleErrorNotify('人员照片注册失败')
            break
          case 'repeat_login':
            this.$handleErrorNotify(`该账号于 ${this.transformToDateTime(msgObj.content.time)} 重复登录`, '重复登录', 0)
            this.$router.push({ name: 'login' })
            break
        }
      }
      ws.onclose = (evt) => {
        this.$store.commit('changeIsWsConnected')
        console.log('websocket连接关闭', url)
        if (this.index < 3) {
          this.index = this.index + 1
          setTimeout(() => {
            console.log('websocket正在重新连接 次数' + this.index, url)
            this.connectWebSocket(url)
          }, 3000)
        }
      }
    },
    // 通知用户设备状态变更
    notifyDeviceStatusChange (msgObj) {
      const normalType = {
        1: '摄像头恢复正常',
        3: '应用显示恢复正常',
        5: '恢复在线'
      }
      const exceptionType = {
        2: '摄像头异常',
        4: '应用显示异常',
        6: '离线'
      }
      if (msgObj.content.status_type in normalType) { // 提示设备状态恢复正常
        this.$handleSuccessNotify(` ${msgObj.content.device_name} 设备于 ${this.transformToDateTime(msgObj.content.time)}
          ${normalType[msgObj.content.status_type]}`, '恢复', 0)
      } else { // 提示设备状态出现异常
        this.$handleErrorNotify(` ${msgObj.content.device_name} 设备于 ${this.transformToDateTime(msgObj.content.time)}
          ${exceptionType[msgObj.content.status_type]}`, '异常', 0)
      }
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
<style lang="stylus" scoped>
.home
  width 100%
  height 100%
  display flex
  padding-top 60px
  .left
    width 200px !important
    height 100%
    position relative
    overflow hidden
  .right
    flex 1
    position relative
    top 0
    left 0

  .collapse
    width 64px !important
</style>
